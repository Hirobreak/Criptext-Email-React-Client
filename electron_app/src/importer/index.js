const { spawn, fork } = require('child_process');
const path = require('path');
const { app } = require('electron');
const { databasePath } = require('../database/DBEmodel');
const { getUserEmailsPath } = require('../utils/FileUtils');

const importerPath = path.join(__dirname, 'emailsImporter.js');
const imapImporterPath = path.join(__dirname, 'imapImporter.js');

const getTempDirectory = nodeEnv => {
  const folderName = 'ImportTempData';
  const currentDirToReplace =
    process.platform === 'win32' ? '\\src\\database' : '/src/database';
  switch (nodeEnv) {
    case 'development': {
      return path.join(__dirname, `../../${folderName}`);
    }
    default: {
      const userDataPath = app.getPath('userData');
      return path
        .join(userDataPath, folderName)
        .replace('/app.asar', '')
        .replace(currentDirToReplace, '');
    }
  }
};

const runImport = (
  { dbPath, key, recipientId, mboxPath },
  progressCallback
) => {
  const tempDir = getTempDirectory(process.env.NODE_ENV);
  return new Promise((resolve, reject) => {
    const worker = spawn(
      'node',
      [importerPath, mboxPath, dbPath, recipientId, tempDir],
      {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      }
    );

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    });

    worker.on('error', code => {
      console.log(`child process exited with error ${code}`);
      reject(code);
    });

    worker.on('close', code => {
      console.log(`child process closed with code ${code}`);
      resolve();
    });

    worker.send({
      step: 'init',
      key
    });
  });
};

const runImapImport = (
  { key, email, password, client, accountId, accountEmail },
  progressCallback
) => {
  return new Promise((resolve, reject) => {
    const worker = fork(imapImporterPath, [accountId, accountEmail, client], {
      env: {
        NODE_ENV: 'script',
        DBPATH: databasePath,
        FSPATH: getUserEmailsPath(process.env.NODE_ENV, accountEmail)
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    });

    worker.on('error', code => {
      console.log(`child process exited with error ${code}`);
      reject(code);
    });

    worker.on('close', code => {
      console.log(`child process closed with code ${code}`);
      resolve();
    });

    worker.send({
      step: 'init',
      key,
      email,
      password
    });
  });
};

const runImapMailboxes = ({ key, email, password, client, accountId, accountEmail }) => {
  return new Promise((resolve, reject) => {
    let mailboxes;
    
    const worker = fork(imapImporterPath, [accountId, accountEmail, client], {
      env: {
        NODE_ENV: 'script',
        DBPATH: databasePath,
        FSPATH: getUserEmailsPath(process.env.NODE_ENV, accountEmail)
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      if (data.type === 'mailboxes')
        mailboxes = data.mailboxes;
    });

    worker.on('error', code => {
      console.log(`child process exited with error ${code}`);
      reject(code);
    });

    worker.on('close', code => {
      console.log(`child process closed with code ${code}`);
      resolve(mailboxes);
    });

    worker.send({
      step: 'init',
      type: 'mailboxes',
      key,
      email,
      password
    });
  });
}

const runImapEmails = ({ key, email, password, client, accountId, accountEmail, labelsMap, addedLabels }) => {
  return new Promise((resolve, reject) => {
    let mailboxes;
    
    const worker = fork(imapImporterPath, [accountId, accountEmail, client], {
      env: {
        NODE_ENV: 'script',
        DBPATH: databasePath,
        FSPATH: getUserEmailsPath(process.env.NODE_ENV, accountEmail)
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      if (data.type === 'mailboxes')
        mailboxes = data.mailboxes;
    });

    worker.on('error', code => {
      console.log(`child process exited with error ${code}`);
      reject(code);
    });

    worker.on('close', code => {
      console.log(`child process closed with code ${code}`);
      resolve(mailboxes);
    });

    worker.send({
      step: 'init',
      type: 'emails',
      key,
      email,
      password,
      labelsMap, 
      addedLabels
    });
  });
}

module.exports = {
  runImport,
  runImapImport,
  runImapMailboxes,
  runImapEmails
};
