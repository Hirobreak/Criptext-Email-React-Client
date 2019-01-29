const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const { app } = require('electron');

const getUserEmailsPath = async (node_env, user) => {
  switch (node_env) {
    case 'test': {
      const path = `./src/__integrations__/${user}`;
      await createIfNotExist(path);
      return path;
    }
    case 'development': {
      const path = path
        .join(__dirname, `/../userData/${user}/emails`)
        .replace('/src', '');
      await createIfNotExist(myEmailsPath);
      return path;
    }
    default: {
      const userDataPath = app.getPath('userData');
      const path = path
        .join(userDataPath, `/userData/${user}/emails`)
        .replace('/app.asar', '')
        .replace('/src', '');
      await createIfNotExist(path);
      return path;
    }
  }
};

const saveEmailBody = async ({
  body,
  headers,
  username,
  metadataKey,
  replaceKey
}) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);

  const emailPath = `${myPath}/${metadataKey}`;
  await createIfNotExist(emailPath);

  const bodyPath = `${emailPath}/body.txt`;
  await store(bodyPath, body);
  if (headers) {
    const headersPath = `${emailPath}/headers.txt`;
    await store(headersPath, headers);
  }
  if (replaceKey) {
    await remove(`${myPath}/${replaceKey}`).catch(console.error);
  }
};

const getEmailBody = async ({ username, metadataKey }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);

  const emailPath = `${myPath}/${metadataKey}`;
  const bodyPath = `${emailPath}/body.txt`;
  try {
    const body = await retrieve(bodyPath);
    return body;
  } catch (ex) {
    return undefined;
  }
};

const getEmailHeaders = async ({ username, metadataKey }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailPath = `${myPath}/${metadataKey}`;
  const headersPath = `${emailPath}/headers.txt`;
  try {
    const body = await retrieve(headersPath);
    return body;
  } catch (ex) {
    return undefined;
  }
};

const deleteEmailContent = async ({ metadataKey, username }) => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  const emailPath = `${myPath}/${metadataKey}`;
  await remove(emailPath).catch(console.error);
};

const removeUserDir = async username => {
  const myPath = await getUserEmailsPath(process.env.NODE_ENV, username);
  await remove(myPath);
};

const store = (path, text) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, text, err => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const retrieve = path => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};

const remove = path => {
  return new Promise((resolve, reject) => {
    rimraf(path, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const createIfNotExist = path => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(path)) return resolve();
    fs.mkdir(path, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

const checkIfExists = path => {
  try {
    return fs.existsSync(path);
  } catch (e) {
    return false;
  }
};

module.exports = {
  saveEmailBody,
  getEmailBody,
  getEmailHeaders,
  deleteEmailContent,
  removeUserDir,
  getUserEmailsPath,
  createIfNotExist,
  checkIfExists
};
