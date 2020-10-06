const { handleParseMailboxFile } = require('./mboxParser');
const { handleLabels } = require('./imap');
const { parseIndividualEmailFiles } = require('./mailParser');
const fs = require('fs');
const path = require('path');
const { initDatabaseEncrypted, Account } = require('../database/DBEmodel');
const { createLabel, getLabelsByText } = require('../database/DBEmanager');

const startTimeout = setTimeout(() => {
  start();
}, 5000);

const removeTempDirectoryRecursive = pathToDelete => {
  if (fs.existsSync(pathToDelete)) {
    fs.readdirSync(pathToDelete).forEach(file => {
      const currentPath = path.join(pathToDelete, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        removeTempDirectoryRecursive(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(pathToDelete);
  }
};

const checkTempDirectory = TempDirectory => {
  try {
    if (fs.existsSync(TempDirectory)) {
      removeTempDirectoryRecursive(TempDirectory);
    }
    fs.mkdirSync(TempDirectory);
  } catch (e) {
    throw new Error('Unable to check temp folder');
  }
};

const start = async key => {
  var args = process.argv.slice(2);
  const mboxPath = args[0];
  const accountEmail = args[1];
  const accountId = args[2];
  const tempBackupDirectory = args[3];

  if (!key) {
    throw new Error(`Database key was never received`);
  }

  let parsedEmails = 0;
  let count = 0;
  let labels, account;
  try {
    checkTempDirectory(tempBackupDirectory);
    const mboxResult = await handleParseMailboxFile(
      mboxPath,
      tempBackupDirectory
    );
    count = mboxResult.count;
    labels = mboxResult.labels;
  } catch (ex) {
    throw new Error(ex.toString());
  }

  try {
    await initDatabaseEncrypted({
      key: key,
      path: process.env.DBPATH,
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

  process.send({
    totalEmails: count,
    type: 'import'
  });

  try {
    const existingLabels = await getLabelsByText({
      accountId: account.id,
      text: labels
    });

    const labelsToCreate = labels
      .filter(label => {
        return (
          existingLabels.find(dbLabel => dbLabel.text === label) === undefined
        );
      })
      .map(label => {
        return {
          visible: true,
          type: 'imported',
          text: label,
          accountId: account.id
        };
      });

    await createLabel(labelsToCreate);

    const existingAllLabels = await getLabelsByText({
      accountId: account.id,
      text: labels
    });

    const labelsMap = labels.reduce((result, label) => {
      const dbLabel = existingAllLabels.find(dbLabel => dbLabel.text === label);
      return {
        ...result,
        [label.toLowerCase()]: dbLabel.id
      };
    }, {});

    const handleProgress = data => {
      parsedEmails++;
      if (data.error) {
        process.send({
          error: data.error,
          interrupted: false
        });
        return;
      }

      process.send({
        parsedEmails,
        totalEmails: count,
        lastEmail: data.email,
        type: 'progress'
      });
    };

    await parseIndividualEmailFiles(
      {
        TempDirectory: tempBackupDirectory,
        databaseKey: key,
        key,
        accountEmail,
        accountId: account.id,
        labels: labelsMap
      },
      handleProgress
    );
  } catch (ex) {
    throw new Error(ex.toString());
  }

  process.exit(0);
};

const startMailboxes = async () => {
  var args = process.argv.slice(2);
  const mboxPath = args[0];
  const tempBackupDirectory = args[3];

  let count, labels;
  try {
    checkTempDirectory(tempBackupDirectory);
    const mboxResult = await handleParseMailboxFile(
      mboxPath,
      tempBackupDirectory
    );
    count = mboxResult.count;
    labels = mboxResult.labels;
  } catch (ex) {
    throw new Error(ex.toString());
  }
  process.send({
    mailboxes: labels,
    count,
    type: 'mailboxes'
  });

  process.exit(0);
};

const startEmails = async ({ key, labelsMap, count, addedLabels }) => {
  var args = process.argv.slice(2);
  const accountEmail = args[1];
  const accountId = args[2];
  const tempBackupDirectory = args[3];

  let account;
  try {
    await initDatabaseEncrypted({
      key: key,
      path: process.env.DBPATH,
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

  process.send({
    totalEmails: count,
    type: 'import'
  });

  try {
    const newLabels = await handleLabels(addedLabels, accountId);

    let parsedEmails = 0;
    const handleProgress = data => {
      parsedEmails++;
      if (data.error) {
        process.send({
          error: data.error,
          interrupted: false
        });
        return;
      }

      process.send({
        parsedEmails,
        totalEmails: count,
        lastEmail: data.email,
        type: 'progress'
      });
    };

    await parseIndividualEmailFiles(
      {
        TempDirectory: tempBackupDirectory,
        databaseKey: key,
        key,
        accountEmail,
        accountId: account.id,
        labels: labelsMap,
        addedLabels: Object.keys(newLabels).map(key => newLabels[key])
      },
      handleProgress
    );
  } catch (ex) {
    throw new Error(ex.toString());
  }

  process.exit(0);
};

process.on('message', data => {
  if (data.step !== 'init') return;

  const { key, type, labelsMap, count, addedLabels } = data;

  clearTimeout(startTimeout);
  switch (type) {
    case 'mailboxes':
      startMailboxes();
      break;
    case 'emails':
      startEmails({ key, labelsMap, count, addedLabels });
      break;
    default:
      start(key);
      break;
  }
});
