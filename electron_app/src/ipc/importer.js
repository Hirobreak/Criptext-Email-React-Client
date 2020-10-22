const { send } = require('../windows/mailbox');
const { ipcMain: ipc } = require('@criptext/electron-better-ipc');
const globalManager = require('../globalManager');
const {
  runMboxMailboxes,
  runMboxEmails,
  runImapMailboxes,
  runImapEmails,
  runUploadAttachments
} = require('../importer/index');
const myAccount = require('../Account');

ipc.answerRenderer('import-mbox-mailboxes', async filepath => {
  try {
    const { mailboxes, count } = await runMboxMailboxes({
      key: globalManager.databaseKey.get(),
      accountId: myAccount.id,
      accountEmail: myAccount.email,
      mboxPath: filepath
    });
    return {
      mailboxes,
      count
    };
  } catch (ex) {
    return {
      error: ex
    };
  }
});

ipc.answerRenderer(
  'import-mbox-emails',
  async ({ labelsMap, addedLabels, count }) => {
    send('import-start', {
      email: myAccount.email,
      name: myAccount.name
    });
    try {
      await runMboxEmails(
        {
          key: globalManager.databaseKey.get(),
          accountId: myAccount.id,
          accountEmail: myAccount.email,
          labelsMap,
          addedLabels,
          count
        },
        data => {
          send('import-progress', data);
        }
      );
      send('import-end');
    } catch (ex) {
      console.log(ex);
    }
  }
);

ipc.answerRenderer(
  'import-imap-mailboxes',
  async ({ email, password, client }) => {
    try {
      const mailboxes = await runImapMailboxes({
        email,
        password,
        client,
        accountId: myAccount.id,
        accountEmail: myAccount.email,
        key: globalManager.databaseKey.get()
      });
      return {
        mailboxes
      };
    } catch (ex) {
      console.log(ex);
      return {
        error: ex
      };
    }
  }
);

ipc.answerRenderer(
  'import-imap-emails',
  async ({ email, password, client, labelsMap, addedLabels }) => {
    send('import-start', {
      email: myAccount.email,
      name: myAccount.name
    });
    try {
      await runImapEmails(
        {
          email,
          password,
          client,
          accountId: myAccount.id,
          accountEmail: myAccount.email,
          key: globalManager.databaseKey.get(),
          labelsMap,
          addedLabels
        },
        data => {
          send('import-progress', data);
        }
      );
      send('import-end');
      await runUploadAttachments({
        accountId: myAccount.id,
        accountEmail: myAccount.email,
        key: globalManager.databaseKey.get()
      });
    } catch (ex) {
      console.log(ex);
    }
  }
);
