const { app, ipcMain } = require('electron');
const dbManager = require('./src/database');
const myAccount = require('./src/Account');
const wsClient = require('./src/socketClient');
const globalManager = require('./src/globalManager');
const mySettings = require('./src/Settings');
const pinWindow = require('./src/windows/pin');
const loginWindow = require('./src/windows/login');
const mailboxWindow = require('./src/windows/mailbox');
const loadingWindow = require('./src/windows/loading');
const composerWindowManager = require('./src/windows/composer');
const { startAlice, closeAlice, checkReachability } = require('./src/aliceManager');
const { createAppMenu } = require('./src/windows/menu');
const {
  showWindows, 
  isDev, 
  isLinux, 
  isWindows,
  isFromStore,
  getSystemLanguage
} = require('./src/windows/windowUtils');
const {initNucleus} = require('./src/nucleusManager');
require('./src/ipc/composer.js');
require('./src/ipc/pin.js');
require('./src/ipc/loading.js');
require('./src/ipc/login.js');
require('./src/ipc/mailbox.js');
require('./src/ipc/database.js');
require('./src/ipc/manager.js');
require('./src/ipc/dataTransfer.js');
require('./src/ipc/backup.js');
require('./src/ipc/nucleus.js');
require('./src/ipc/client.js');
const ipcUtils = require('./src/ipc/utils.js');
const { checkDatabaseStep } = require('./src/utils/dataBaseUtils');
const {initClient} = require('./src/clientManager');

globalManager.forcequit.set(false);

async function initApp() {
  const step = await checkDatabaseStep(dbManager);
  switch (step) {
    case 1:{
      await startAlice();
      await checkReachability();

      globalManager.windowsEvents.disable()
      globalManager.needsUpgrade.enable()

      const [existingAccount] = await dbManager.getAccount();
      const appSettings = await dbManager.getSettings();
      const settings = Object.assign(appSettings, { isFromStore });
      myAccount.initialize(existingAccount);
      mySettings.initialize(settings);
      await initClient();
      initNucleus({language: mySettings.language});
      wsClient.start(myAccount);
      createAppMenu();
      mailboxWindow.show({ firstOpenApp: true });
    }
    break;
    case 2:{
      try {
        const [existingAccount] = await dbManager.getAccount();
        if(existingAccount){
          pinWindow.show();
        }
      } catch (ex) {
        console.log(ex);
      }
      break;
    }
    case 3:{
      try {
        const language = await getUserLanguage();
        initNucleus({language});
        const settings = { isFromStore, language };
        mySettings.initialize(settings);
        createAppMenu();
        loginWindow.show({});
      } catch (ex) {
        console.log(ex);
      }
      break;
    }
    case 4:{
      const pin = await pinWindow.checkPin();
      if(!pin){
        globalManager.pinData.set({pinType: 'new'});
        pinWindow.show();
        return;
      }

      try {
        await dbManager.initDatabaseEncrypted(pin);
      } catch (error) {
        globalManager.pinData.set({pinType: 'new'});
        pinWindow.show();
        return;
      }

      const [existingAccount] = await dbManager.getAccount();
      if(!existingAccount){
        const language = await getUserLanguage();
        initNucleus({language});
        createAppMenu();
        loginWindow.show({});
        return;
      }

      if (existingAccount.deviceId) {
        const appSettings = await dbManager.getSettings();
        const settings = Object.assign(appSettings, { isFromStore });
        myAccount.initialize(existingAccount);
        mySettings.initialize(settings);
        initNucleus({language: mySettings.language});
        wsClient.start(myAccount);
        createAppMenu();
        mailboxWindow.show({ firstOpenApp: true });
      }else{
        const language = await getUserLanguage();
        initNucleus({language});
        createAppMenu();
        loginWindow.show({});
      }
      break; 
    }
    default:
      break;
  }

  //   Composer
  ipcMain.on('failed-to-send', () => {
    composerWindowManager.sendEventToMailbox('failed-to-send', undefined);
  });

  // Socket
  wsClient.setMessageListener(async data => {
    const SIGNIN_VERIFICATION_REQUEST_COMMAND = 201;
    const MANUAL_SYNC_REQUEST_COMMAND = 211;
    // This validation is for closed-mailbox case
    if (data.cmd === SIGNIN_VERIFICATION_REQUEST_COMMAND) {
      await ipcUtils.sendLinkDeviceStartEventToAllWindows(data);
    }
    else if (data.cmd === MANUAL_SYNC_REQUEST_COMMAND) {
      await ipcUtils.sendSyncMailboxStartEventToAllWindows(data);
    } else {
      mailboxWindow.send('socket-message', data);
      loginWindow.send('socket-message', data);
      loadingWindow.send('socket-message', data);
    }
  });
}

//   App
app.disableHardwareAcceleration();

if ((isWindows || isLinux) && !isDev) {
  const lock = app.requestSingleInstanceLock();
  if (!lock) {
    app.quit();
    return;
  } else {
    app.on('second-instance', (event, argv, cwd) => {
      initApp();
    })
  }
}

const getUserLanguage = async () => {
  return await getSystemLanguage();
};

app.on('ready', () => {
  initApp();
});

app.on('activate', () => {
  showWindows();
});

app.on('before-quit', () => {
  closeAlice();
  globalManager.forcequit.set(true);
});
