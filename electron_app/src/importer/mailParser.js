const fs = require('fs');
const path = require('path');
const { saveEmailBody, remove } = require('../utils/FileUtils');
const { MailParser, simpleParser} = require('mailparser');
const { createEmail } = require('../database/DBEmanager');
const moment = require('moment');

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

const parseEmailFromFile = (pathtoemail, labels, newKey) => {
  return new Promise(resolve => {
    const handleError = err => {
      console.log('ERROOOOR: ', err);
      resolve({
        error: true,
        message: typeof err === 'string' ? err : err.toString()
      });
    };
    const handleSuccess = (body, emailData) => {
      resolve({ error: false, message: body, emailData });
    };
    try {
      const files = [];
      let email;

      const inputStream = fs.createReadStream(pathtoemail);
      const mailparser = new MailParser({ streamAttachments: true });
      mailparser.on('headers', headers =>
        parseEmailHeaders(headers, labels, newKey)
      );
      mailparser.on('data', data => {
        const res = parseEmailData(data, files);
        email = { ...res };
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
              if (files.length) emailData['files'] = files;
              handleSuccess(html, emailData);
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

const parseEmailHeaders = (headers, labelsMap, newKey) => {
  const metadata = {
    status: 1,
    key: newKey
  };
  const recipients = {
    from: [],
    to: [],
    cc: [],
    bcc: []
  };
  const labels = [];
  for (const [clave, valor] of headers.entries()) {
    if (
      clave === 'from' ||
      clave === 'to' ||
      clave === 'cc' ||
      clave === 'bcc'
    ) {
      const value = valor.value;
      if (Array.isArray(value)) {
        recipients[clave] = value.map(recipient => {
          if (!recipient.name) return recipient.address;
          return `${recipient.name} <${recipient.address}>`;
        });
      } else {
        recipients[clave] = value.name
          ? `${value.name} <${value.address}>`
          : value.address;
      }
    }
    if (clave === 'subject' || clave === 'date') {
      metadata[clave] = valor;
    }
    if (clave === 'message-id') {
      metadata['messageId'] = valor;
    }
    if (clave.includes('labels')) {
      const localLabels = valor.split(',');
      const filteredLabels = localLabels.filter(
        label => label.toLowerCase() !== 'unread'
      );
      metadata['unread'] = localLabels.length !== filteredLabels.length;
      labels.push(
        filteredLabels.map(label => {
          return labelsMap[label.toLowerCase()];
        })
      );
    }
    if (clave.includes('reply')) {
      metadata['in-reply-to'] = valor;
    }
    if (clave === 'reply-to') {
      const value = valor.value[0];
      metadata['replyTo'] = value.address;
    }
  }
  metadata['fromAddress'] = recipients['from'][0];

  const data = {
    email: metadata,
    recipients,
    labels
  };
  //console.log('METADATA : ', data);
};

const parseEmailData = (data, attachmentsArray) => {
  let email;
  if (data.type === 'text') {
    Object.keys(data).forEach(key => {
      if (key === 'html') {
        email = data[key];
      }
      // console.log('\x1b[33m%s\x1b[0m', `${key} = ${data[key]}`);
    });
  } else if (data.type === 'attachment') {
    data.chunks = [];
    data.chunklen = 0;
    const fileDataObject = {
      token: '',
      status: 1,
      mimeType: 'application/octet-stream',
      name: 'unknown'
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
    data.content.on('error', () => {
      console.log('EEEEEERROR');
    })
    data.content.on('readable', () => {
      let chunk;
      while ((chunk = data.content.read()) !== null) {
        data.chunks.push(chunk);
        data.chunklen += chunk.length;
      }
    });
    data.content.on('end', () => {
      console.log('ENDIIIIIING');
      data.buf = Buffer.concat(data.chunks, data.chunklen);
      data.release();
      attachmentsArray.push(fileDataObject);
    });
  }
  return email;
};

const parseAddresses = addresses => {
  if (!addresses) return [];
  const value = addresses.value;
  if (Array.isArray(value)) {
    return value.map(recipient => {
      if (!recipient.name) return recipient.address;
      return `${recipient.name} <${recipient.address}>`;
    });
  } else {
    return value.name
      ? [`${value.name} <${value.address}>`]
      : [value.address];
  }
}

const parseSimpleEmail = async (emailPath, labelsMap, newKey, accountId) => {
  let myResult = await simpleParser(fs.readFileSync(emailPath, {
    encoding: 'utf-8'
  }), {});

  const recipients = {
    from: parseAddresses(myResult.from),
    to: parseAddresses(myResult.to),
    cc: parseAddresses(myResult.cc),
    bcc: parseAddresses(myResult.bcc),
  }

  const body = myResult.html || myResult.text;

  const metadata = {
    subject: myResult.subject,
    messageId: myResult.messageId,
    replyTo: parseAddresses(myResult.replyTo)[0],
    preview: myResult.text ? myResult.text.slice(0, 200) : '(No Content)',
    date: moment(myResult.date).format('YYYY-MM-DD HH:mm:ss'),
    fromAddress: recipients['from'][0],
    secure: false,
    threadId: myResult.inReplyTo || myResult.messageId,
    key: newKey,
    content: ''
  }

  const labels = [];

  myResult.headerLines.forEach( header => {
    if (header.key && header.key.toLowerCase().includes('labels')) {
      const headerlineIndex = header.line.indexOf(':');
      const headerLine = header.line.slice(headerlineIndex + 2);
      const localLabels = headerLine.split(',');
      const filteredLabels = localLabels.filter(
        label => label.toLowerCase() !== 'unread'
      );
      metadata['unread'] = localLabels.length !== filteredLabels.length;
      labels.push(
        filteredLabels.map(label => {
          return labelsMap[label.toLowerCase()];
        })
      );
    }
  })

  return {
    email: metadata,
    recipients,
    labels: [].concat.apply([], labels),
    accountId,
    body
  }
}

const parseIndividualEmailFiles = async ({
  TempDirectory,
  accountEmail,
  accountId,
  databaseKey,
  labels
}, progress) => {
  try {
    if (fs.existsSync(TempDirectory)) {
      let pendingEmails = true;
      while (pendingEmails) {
        const folders = fs.readdirSync(TempDirectory);
        if (folders.length <= 0) {
          pendingEmails = false;
          continue;
        }
        let emailsParsed = 0;
        for (const folder of folders) {
          const subFolderPath = path.join(TempDirectory, folder);
          for (const email of fs.readdirSync(subFolderPath)) {

            try {
              const emailPath = path.join(subFolderPath, email);
              const headersResponse = await getHeadersFromEmailFile(emailPath);
              const myResult = await parseSimpleEmail(emailPath, labels, folder, accountId);

              await createEmail(myResult);

              await saveEmailBody({
                body: myResult ? myResult.body : '',
                headers: !headersResponse.error ? headersResponse.message : '',
                metadataKey: folder,
                username: accountEmail,
                password: databaseKey
              })
              progress({
                email: folder
              })
            } catch (ex) {
              progress({
                error: ex,
                email: folder
              })
            }
          }
          await remove(subFolderPath);
          emailsParsed++;
          if (emailsParsed > 100) break;
        }
      }
    }
  } catch (parseErr) {
    return {
      error: parseErr.toString(),
      message: 'Failed to parse emails files'
    };
  }
};

module.exports = {
  parseIndividualEmailFiles
};
