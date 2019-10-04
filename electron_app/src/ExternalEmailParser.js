const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const MailParser = require('mailparser').MailParser;
const { getBasepathAndFilenameFromPath } = require('./utils/stringUtils');
const { saveEmailBody } = require('./utils/FileUtils');
const { createEmail } = require('./DBManager');
const { databasePath } = require('./models');
const { sendEventToAllWindows } = require('./windows/windowUtils');

const ALLOWED_EXTENSIONS = ['.mbox'];

/*  Temp Directory
----------------------------- */
const TempFolderName = 'Imported';
const TempDirectory = path.join(databasePath, '..', TempFolderName);
const MODES = {
  CREATE: 'create',
  RESUME: 'resume'
};

const checkTempDirectory = mode => {
  try {
    if (mode === 'create') {
      if (fs.existsSync(TempDirectory)) {
        removeTempDirectoryRecursive(TempDirectory);
      }
      fs.mkdirSync(TempDirectory);
    }
  } catch (e) {
    throw new Error('Unable to check temp folder');
  }
};

const removeTempDirectoryRecursive = pathToDelete => {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach(file => {
      const currentPath = path.join(pathToDelete, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeTempDirectoryRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
};

/*  Methods
----------------------------- */
function checkEmailFileExtension(filepath) {
  const { filename } = getBasepathAndFilenameFromPath(filepath);
  if (!filename) return false;
  const ext = path.extname(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
}

const parseFileAndSplitEmailsInFiles = mboxFilepath => {
  return new Promise(resolve => {
    let count = 0;
    const labelsFound = {};
    String.prototype.getBetween = function(prefix, suffix) {
      let s = this;
      let i = s.indexOf(prefix);
      if (i < 0) return '';
      s = s.substring(i + prefix.length);
      if (suffix) {
        i = s.indexOf(suffix);
        if (i < 0) return '';
        s = s.substring(0, i - 1);
      }
      return s;
    };
    // Check extension
    try {
      const check = checkEmailFileExtension(mboxFilepath);
      if (!check)
        resolve({ error: true, message: 'Unable to parse. Invalid file' });
    } catch (checkError) {
      return resolve({ error: true, message: checkError.toString() });
    }
    // Temp Directory
    try {
      checkTempDirectory(MODES.CREATE);
    } catch (tmpError) {
      return resolve({ error: true, message: 'Unable to check temp folder' });
    }
    // Split in files and count
    try {
      const inputStream = fs.createReadStream(mboxFilepath);
      const mboxparser = new Mbox();
      mboxparser.on('message', msg => {
        const labelsMatch = msg.toString().getBetween('X-Gmail-Labels: ', '\n');
        const externalLabels = `${labelsMatch || ''}`.split(',');
        for (const label of externalLabels) {
          labelsFound[label] = '';
        }
        try {
          const identifier = count + 1;
          const emailfolder = path.join(TempDirectory, `EXT${identifier}`);
          const rawEmailPath = path.join(emailfolder, `raw.txt`);
          fs.mkdirSync(emailfolder);
          fs.writeFileSync(rawEmailPath, msg);
          count++;
          if (count % 50 === 0) {
            sendEventToAllWindows('import-file', count);
          }
        } catch (saveEmailErr) {
          console.log('Failed to save email to file');
        }
      });
      mboxparser.on('error', mboxErr => {
        resolve({ error: true, message: mboxErr.toString() });
      });
      mboxparser.on('end', () => {
        resolve({ error: false, count, labels: Object.keys(labelsFound) });
      });
      inputStream.pipe(mboxparser);
    } catch (parseError) {
      resolve({ error: true, message: parseError.toString() });
    }
  });
};

// Parse One Email
const parseIndividualEmailFiles = async params => {
  let myLabelsMap = params.labels.reduce((result, label) => {
    return {
      ...result,
      [label.text]: {
        mailbox: parseInt(label.mappedMailboxId),
        label: parseInt(label.mappedLabelId)
      }
    }
  }, {});
  const mySetup = {
    ...params,
    labels: myLabelsMap
  };
  let count = 0;
  try {
    if (fs.existsSync(TempDirectory)) {
      for (const folder of fs.readdirSync(TempDirectory)) {
        const subFolderPath = path.join(TempDirectory, folder);
        for (const email of fs.readdirSync(subFolderPath)) {
          // Just 1 file
          const emailPath = path.join(subFolderPath, email);
          const headersResponse = await getHeadersFromEmailFile(emailPath);
          const bodyResponse = await parseEmailFromFile(emailPath, mySetup);
          if (!bodyResponse.error && validateEmail(bodyResponse.emailData.email)) {
            await saveEmailBody({
              body: bodyResponse.message, 
              headers: headersResponse.message, 
              username: params.username, 
              metadataKey: bodyResponse.emailData.email.key
            })
            await createEmail(bodyResponse.emailData);
          }
          count++;
          if (count % 50 === 0) {
            sendEventToAllWindows('import-emails', count);
          }
        }
      }
    }
    sendEventToAllWindows('import-emails', count);
  } catch (parseErr) {
    console.log(parseErr);
    return { error: true, message: 'Failed to parse emails files' };
  }
};

const getHeadersFromEmailFile = pathtoemail => {
  const Splitter = require('mailsplit').Splitter;
  const splitter = new Splitter();
  const emailFileStream = fs.createReadStream(pathtoemail);
  let headers;
  let isFirst = true;
  return new Promise(resolve => {
    splitter.on('data', data => {
      if (data.type === 'node' && isFirst) {
        headers = `${data.getHeaders()}`;
        isFirst = false;
      }
    });
    splitter.on('error', () =>
      resolve({ error: true, message: `Failed to split file: ${pathtoemail}` })
    );
    splitter.on('end', () => resolve({ error: false, message: headers }));
    emailFileStream.pipe(splitter);
  });
};

const parseEmailFromFile = (pathtoemail, params) => {
  return new Promise(resolve => {
    const handleError = err => {
      resolve({
        error: true,
        message: typeof err === 'string' ? err : err.toString()
      });
    };
    const handleSuccess = (body, emailData) => {
      //console.log("\x1b[33m", emailData);
      resolve({ error: false, message: body, emailData });
    };
    try {
      const files = [];
      let labels = [];
      const recipients = {
        from: [],
        to: [],
        cc: [],
        bcc: []
      };
      let email = {};

      const inputStream = fs.createReadStream(pathtoemail);
      const mailparser = new MailParser({ streamAttachments: true });
      mailparser.on('headers', headers => {
        const res = parseEmailHeaders(headers, recipients)
        labels = res.labels;
        email = { ...email, ...res.email }
      });
      mailparser.on('data', data => {
        const res = parseEmailData(data, files);
        email = { ...email, ...res };
      });
      mailparser.on('error', err => handleError(err.toString()));
      mailparser.on('end', () => {
        mailparser.updateImageLinks(
          (attachment, done) => {
            const type = attachment.contentType;
            const data = attachment.buf.toString('base64');
            done(false, `data:${type};base64,${data}`);
          },
          (err, html) => {
            if (err) return handleError(err.toString());
            if (html) {
              const emailData = {};
              emailData['email'] = email;
              emailData['recipients'] = recipients;
              if (files.length) emailData['files'] = files;
              if (labels.length) {
                const myLabels = labels.reduce((result, label) => {
                  const labelMap = params.labels[label];
                  if (labelMap.mailbox > 0 && labelMap.label > 0) {
                    return [...result, labelMap.mailbox, labelMap.label];
                  } else if (labelMap.mailbox > 0) {
                    return [...result, labelMap.mailbox];
                  } else if (labelMap.label > 0) {
                    return [...result, labelMap.label];
                  } 

                  return result;
                }, [])
                emailData['labels'] = [...(new Set(myLabels))];
              } 
              handleSuccess(html, emailData);
            } else {
              return handleError('empty mail ', err, html);
            }
          }
        );
      });
      inputStream.pipe(mailparser);
    } catch (parseFileErr) {
      handleError(parseFileErr.toString());
    }
  });
};

const validateEmail = email => {
  return (email.threadId && email.key)
}

const parseEmailHeaders = (headers, recipients) => {
  const key = parseInt(Math.random() * 1000000000)
  let email = {
    key: key,
    s3Key: key, 
    content: '',
    status: 3,
    unread: false,
    secure: false,
    isMuted: false,
    unsentDate: null,
    trashDate: null,
    subject: '(No Subject)'
  };
  let labels;
  for (const [clave, valor] of headers.entries()) {
    switch(clave) {
      case 'x-gm-thrid':
        email['threadId'] = valor;
        break;
      case 'subject':
        email['subject'] = valor;
        break;
      case 'message-id':
        email['messageId'] = valor;
        break;
      case 'date': 
        email['date'] = valor;
        break;
      case 'from': 
        const from = valor.value[0];
        email['fromAddress'] = (from.name ? `${from.name} <${from.address}>` : from.address);
        recipients.from = [...recipients.from, email['fromAddress']];
        break;
      case 'to':
        const tos = valor.value;
        tos.forEach( to => {
          const contact = (to.name ? `${to.name} <${to.address}>` : to.address);
          recipients.to = [...recipients.to, contact];
        })
        break;
      case 'cc':
        const ccs = valor.value;
        ccs.forEach( cc => {
          const contact = (cc.name ? `${cc.name} <${cc.address}>` : cc.address);
          recipients.cc = [...recipients.cc, contact];
        })
        break;
      case 'bcc':
        const bccs = valor.value;
        bccs.forEach( bcc => {
          const contact = (bcc.name ? `${bcc.name} <${bcc.address}>` : bcc.address);
          recipients.bcc = [...recipients.bcc, contact];
        })
        break;
      case 'x-gmail-labels':
        labels = [...valor.split(',')];
        break
      case 'reply-to':
        const replyTo = valor.value[0];
        email['replyTo'] = replyTo.address;
        break;
      default:
        //console.log("HERE 3 ", clave, JSON.stringify(valor), '\n');
    }
  }
  //console.log('\x1b[36m%s\x1b[0m', JSON.stringify(email), JSON.stringify(labels), JSON.stringify(recipients));
  return {labels, email};
};


const parseEmailData = (data, attachmentsArray) => {
  let email = {};
  if (data.type === 'text') {
    Object.keys(data).forEach(key => {
      if (key !== 'text') {
        return;
      }
      email = {
        preview: data[key].substring(0, 100).replace(/\n/g, " ").replace(/\s\s+/g, ' ')
      };
      // console.log('\x1b[33m%s\x1b[0m', `${key} = ${data[key]}`);
    });
    if (!email.preview) {
      email.preview = "Preview Not Available"
    }
  } else if (data.type === 'attachment') {
    data.chunks = [];
    data.chunklen = 0;
    const fileDataObject = {
      token: '',
      status: 1,
      mimeType: 'application/octet-stream',
      name: 'unknown',
      size: 0,
      date: Date.now(),
      cid: null
    };
    for (const key of Object.keys(data)) {
      const isObject = typeof data[key] === 'object';
      const isFunction = typeof data[key] === 'function';
      if (!isObject && !isFunction) {
        switch (key) {
          case 'filename':
            fileDataObject['name'] = data[key];
            break;
          case 'contentType':
            fileDataObject['mimeType'] = data[key];
            break;
          case 'size':
            fileDataObject['size'] = data[key];
            break;
          case 'cid':
            if (data[key] && !!data.related) {
              fileDataObject['cid'] = data[key];
            }
            break;
          default:
            break;
        }
      }
    }
    data.content.on('readable', () => {
      let chunk;
      while ((chunk = data.content.read()) !== null) {
        data.chunks.push(chunk);
        data.chunklen += chunk.length;
      }
    });
    data.content.on('end', () => {
      data.buf = Buffer.concat(data.chunks, data.chunklen);
      data.release();
      attachmentsArray.push(fileDataObject);
      /*console.log(
        '\x1b[32m%s\x1b[0m',
        `-----------------------------------
        ${JSON.stringify(fileDataObject)}
        -----------------------------------
      `
      );*/
    });
  }
  return email;
};

// Main
const handleParseMailboxFile = async filepath => {
  const splitResponse = await parseFileAndSplitEmailsInFiles(filepath);
  if (splitResponse.error) {
    console.log('Hubo un error');
    return null;
  }
  const { count, labels } = splitResponse;
  console.log(
    '\x1b[36m%s\x1b[0m',
    `[ Total de emails : ${count} ][ LabelsEnconrados: ${labels} ]`
  );
  return {
    count, labels
  }
};

const cleanDir = () => {
  removeTempDirectoryRecursive(TempDirectory);
};

module.exports = {
  handleParseMailboxFile,
  parseIndividualEmailFiles,
  cleanDir
};
