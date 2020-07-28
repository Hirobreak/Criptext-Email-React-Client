const fs = require('fs');
const path = require('path');
const Mbox = require('node-mbox');
const { getBasepathAndFilenameFromPath } = require('../utils/stringUtils');

const ALLOWED_EXTENSIONS = ['.mbox'];

const handleParseMailboxFile = async (filepath, tempDir) => {
  const splitResponse = await parseFileAndSplitEmailsInFiles(filepath, tempDir);
  if (splitResponse.error) {
    console.log('Hubo un error');
    return null;
  }
  const { count, labels } = splitResponse;
  console.log(
    '\x1b[36m%s\x1b[0m',
    `[ Total de emails : ${count} ][ LabelsEnconrados: ${labels} ]`
  );
  return splitResponse;
};

const checkEmailFileExtension = filepath => {
  const { filename } = getBasepathAndFilenameFromPath(filepath);
  if (!filename) return false;
  const ext = path.extname(filename);
  return ALLOWED_EXTENSIONS.includes(ext);
};

const parseFileAndSplitEmailsInFiles = (mboxFilepath, TempDirectory) => {
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

module.exports = {
  handleParseMailboxFile
};
