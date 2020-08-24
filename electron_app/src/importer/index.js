const { spawn } = require('child_process');
const path = require('path');
const { app } = require('electron');

const importerPath = path.join(__dirname, 'emailsImporter.js');

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
    let backupSize = 0;
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
      resolve(backupSize);
    });

    worker.send({
      step: 'init',
      key
    });
  });
};

module.exports = {
  runImport
};
