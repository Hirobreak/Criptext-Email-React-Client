const { fork } = require('child_process');
const path = require('path');
const { app } = require('electron');
const { databasePath } = require('../database/DBEmodel');
const { getUserEmailsPath } = require('../utils/FileUtils');

const importerPath = path.join(__dirname, 'emailsImporter.js');
const imapImporterPath = path.join(__dirname, 'imapImporter.js');
const attachmentsUploaderPath = path.join(__dirname, 'attachments/index.js');

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

const startFork = ({ path, args, params = {}, accountEmail }, callback) => {
  return new Promise((resolve, reject) => {
    const worker = fork(path, args, {
      env: {
        NODE_ENV: 'script',
        DBPATH: databasePath,
        FSPATH: getUserEmailsPath(process.env.NODE_ENV, accountEmail)
      },
      stdio: ['inherit', 'inherit', 'inherit', 'ipc']
    });

    worker.on('message', data => {
      console.log(`message: ${JSON.stringify(data)}`);
      callback(data);
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
      ...params,
      step: 'init'
    });
  });
};

const runImport = async (
  { key, accountEmail, accountId, mboxPath },
  progressCallback
) => {
  const tempDir = getTempDirectory(process.env.NODE_ENV);
  await startFork(
    {
      accountEmail,
      path: importerPath,
      args: [mboxPath, accountEmail, accountId, tempDir],
      params: {
        key
      }
    },
    data => {
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    }
  );
};

const runMboxMailboxes = async ({ key, accountEmail, accountId, mboxPath }) => {
  const tempDir = getTempDirectory(process.env.NODE_ENV);
  let mailboxes, count;
  await startFork(
    {
      accountEmail,
      path: importerPath,
      args: [mboxPath, accountEmail, accountId, tempDir],
      params: {
        type: 'mailboxes',
        key
      }
    },
    data => {
      if (data.type === 'mailboxes') {
        mailboxes = data.mailboxes;
        count = data.count;
      }
    }
  );
  return {
    mailboxes,
    count
  };
};

const runMboxEmails = async (
  { key, accountEmail, accountId, mboxPath, labelsMap, addedLabels, count },
  progressCallback
) => {
  const tempDir = getTempDirectory(process.env.NODE_ENV);
  await startFork(
    {
      accountEmail,
      path: importerPath,
      args: [mboxPath, accountEmail, accountId, tempDir],
      params: {
        type: 'emails',
        key,
        labelsMap,
        addedLabels,
        count
      }
    },
    data => {
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    }
  );
};

const runImapImport = async (
  { key, email, password, client, accountId, accountEmail },
  progressCallback
) => {
  await startFork(
    {
      accountEmail,
      path: imapImporterPath,
      args: [accountId, accountEmail, client],
      params: {
        key,
        email,
        password
      }
    },
    data => {
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    }
  );
};

const runImapMailboxes = async ({
  key,
  email,
  password,
  client,
  accountId,
  accountEmail
}) => {
  let mailboxes;
  await startFork(
    {
      accountEmail,
      path: imapImporterPath,
      args: [accountId, accountEmail, client],
      params: {
        type: 'mailboxes',
        key,
        email,
        password
      }
    },
    data => {
      if (data.type === 'mailboxes') mailboxes = data.mailboxes;
    }
  );
  return mailboxes;
};

const runImapEmails = async (
  {
    key,
    email,
    password,
    client,
    accountId,
    accountEmail,
    labelsMap,
    addedLabels
  },
  progressCallback
) => {
  await startFork(
    {
      accountEmail,
      path: imapImporterPath,
      args: [accountId, accountEmail, client],
      params: {
        type: 'emails',
        key,
        email,
        password,
        labelsMap,
        addedLabels
      }
    },
    data => {
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    }
  );
};

const runUploadAttachments = async (
  { accountId, accountEmail, key },
  progressCallback
) => {
  console.log('GONNA RUN ', attachmentsUploaderPath);
  await startFork(
    {
      accountEmail,
      path: attachmentsUploaderPath,
      args: [accountId, accountEmail],
      params: {
        key,
        step: 'init'
      }
    },
    data => {
      if (data.type === 'progress' || data.type === 'import')
        progressCallback(data);
    }
  );
};

module.exports = {
  runImport,
  runMboxMailboxes,
  runMboxEmails,
  runImapImport,
  runImapMailboxes,
  runImapEmails,
  runUploadAttachments
};
