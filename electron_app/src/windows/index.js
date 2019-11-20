const keytar = require('keytar');
const dbManager = require('./../database');
const myAccount = require('./../Account');
const mySettings = require('./../Settings');
const loginWindow = require('./login');
const mailboxWindow = require('./mailbox');
const pinWindow = require('./pin');
const { EVENTS, addEvent } = require('./events');
const { createAppMenu } = require('./menu');
const wsClient = require('./../socketClient');
const { initClient } = require('./../clientManager');
const { initNucleus } = require('./../nucleusManager');
const globalManager = require('./../globalManager');
const aliceManager = require('./../aliceManager');
const { isFromStore, getSystemLanguage } = require('./windowUtils');

const upStepDBEncryptedWithoutPIN = async () => {
  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    await pinWindow.show();
  }
};

const upStepCheckPINDBEncrypted = async () => {
  const pin = await pinWindow.checkPin();
  if (!pin) {
    globalManager.pinData.set({ pinType: 'new' });
    pinWindow.show();
    return;
  }

  try {
    await dbManager.initDatabaseEncrypted({ key: pin });
  } catch (error) {
    globalManager.pinData.set({ pinType: 'new' });
    pinWindow.show();
    return;
  }

  await upApp({});
};

const upApp = async ({ shouldSave, pin }) => {
  if (pin) {
    if (shouldSave) {
      keytar
        .setPassword('CriptextMailDesktopApp', 'unique', `${pin}`)
        .then(result => {
          console.log('result', result);
        })
        .catch(error => {
          console.log('error', error);
        });
    }
    globalManager.databaseKey.set(pin);
  }

  aliceManager.startAlice();

  const [existingAccount] = await dbManager.getAccount();
  if (!existingAccount) {
    const language = await getUserLanguage();
    await initClient();
    initNucleus({ language });
    createAppMenu();
    loginWindow.show({});
    return;
  }

  if (existingAccount.deviceId) {
    await upMailboxWindow(existingAccount);
  } else {
    const language = await getUserLanguage();
    initNucleus({ language });
    createAppMenu();
    loginWindow.show({});
  }
};

const upMailboxWindow = async existingAccount => {
  const appSettings = await dbManager.getSettings();
  const settings = Object.assign(appSettings, { isFromStore });
  myAccount.initialize(existingAccount);
  mySettings.initialize(settings);
  await initClient();
  initNucleus({ language: mySettings.language });
  wsClient.start(myAccount);
  createAppMenu();
  mailboxWindow.show({ firstOpenApp: true });
  if (pinWindow) pinWindow.close({ forceClose: true });
};

const getUserLanguage = async () => {
  return await getSystemLanguage();
};

addEvent(EVENTS.Up_app, upApp);

module.exports = {
  dbManager,
  upApp,
  upStepDBEncryptedWithoutPIN,
  upStepCheckPINDBEncrypted
};
