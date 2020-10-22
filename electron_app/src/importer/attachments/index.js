const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  getFilesByTokens,
  updateFileByToken
} = require('../../database/DBEmanager');
const { retrieve, getUserEmailsPath } = require('../../utils/FileUtils');
const { initDatabaseEncrypted, Account } = require('../../database/DBEmodel');
const fileService = require('./fileserver');
const crypto = require('crypto');

const DEFAULT_CHUNK_SIZE = 524288;
const attachmentsAuditPath = path.join(
  getUserEmailsPath(process.env.NODE_ENV),
  '../temp-attachments.audit'
);

const startTimeout = setTimeout(() => {
  start();
}, 5000);

const start = async ({ accountId, databaseKey }) => {
  let account;
  try {
    await initDatabaseEncrypted({
      key: databaseKey,
      dbpath: process.env.DBPATH,
      sync: false
    });
    account = await Account().findOne({
      where: {
        id: accountId
      }
    });
  } catch (ex) {
    throw new Error(`Error connecting to db ${ex}`);
  }
  console.log(attachmentsAuditPath);
  const fileStream = fs.createReadStream(attachmentsAuditPath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  console.log('LETS GOOO');
  for await (const line of rl) {
    console.log(line);
    try {
      const metadata = JSON.parse(line);
      const [file] = await getFilesByTokens([metadata.token]);
      if (!file || file.status !== 2) {
        continue;
      }
      const key = await asyncRandomBytes(16);
      const iv = await asyncRandomBytes(16);
      const buffer = await retrieve(metadata.path);
      const newToken = await encryptAndUploadFile(buffer, file, key, iv, account.jwt);
      await updateFileByToken({
        status: 1,
        key: key.toString('base64'),
        iv: iv.toString('base64'),
        token: newToken
      }, metadata.token);
    } catch (ex) {
      console.log(ex);
    }
  }

  process.exit(0);
};

const asyncRandomBytes = size => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(size, (ex, buffer) => {
      if (ex) {
        reject('error generating randomBytes');
      }
      resolve(buffer);
    });
  });
};

const encryptAndUploadFile = (buffer, attachment, key, iv, jwt) => {
  return new Promise(async resolve => {
    try {
      const totalChunks = Math.ceil(attachment.size / DEFAULT_CHUNK_SIZE);
      const filename = (attachment.name || 'unknown').replace(/\//g, ':');
      console.log("A1");
      const fileToken = await fileService.registerFile(
        {
          filename,
          filesize: attachment.size,
          chunkSize: DEFAULT_CHUNK_SIZE,
          totalChunks: totalChunks
        },
        jwt
      );
      console.log("A2");
      await encryptAndUploadChunks(
        buffer,
        fileToken,
        attachment,
        totalChunks,
        key,
        iv,
        jwt
      );
      console.log("A3");
      await fileService.markFilesAsPermanent(
        {
          files: [
            {
              token: fileToken
            }
          ]
        },
        jwt
      );
      console.log("A4");
      return resolve(fileToken);
    } catch (ex) {
      console.log(ex);
      return resolve(null);
    }
  });
};

const encryptAndUploadChunks = async (
  buffer,
  fileToken,
  attachment,
  totalChunks,
  key,
  iv,
  jwt
) => {
  for (let chunk = 0; chunk < totalChunks; chunk++) {
    const offset = chunk * DEFAULT_CHUNK_SIZE;
    const endRange =
      offset + DEFAULT_CHUNK_SIZE > attachment.size
        ? attachment.size
        : offset + DEFAULT_CHUNK_SIZE;
    const blob = buffer.slice(offset, endRange);
    const blobEncrypted = encryptFileAES({ key, iv, file: blob });
    await fileService.uploadChunk(
      fileToken,
      attachment,
      blobEncrypted,
      chunk + 1,
      jwt
    );
  }
};

const encryptFileAES = ({ file, key, iv }) => {
  const algorithm = 'aes-128-cbc';

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(file);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return encrypted;
};

const handleProgress = data => {
  process.send(data);
};

process.on('message', data => {
  if (data.step !== 'init') return;

  var args = process.argv.slice(2);
  const accountId = args[0];
  const accountEmail = args[1];

  const { key } = data;

  clearTimeout(startTimeout);
  start({ accountId, accountEmail, databaseKey: key }, handleProgress);
});
