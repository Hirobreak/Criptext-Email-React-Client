const {
  getMailLabels,
  getMailboxEmails,
  getUrlByClient,
  initializeImap,
  getMailboxes,
  handleLabels
} = require('./imap');
const { initDatabaseEncrypted } = require('../database/DBEmodel');

const startTimeout = setTimeout(() => {
  start();
}, 5000);

const start = async (
  { email, password, client, accountId, accountEmail, databaseKey },
  progressCallback
) => {
  try {
    await initDatabaseEncrypted({
      key: databaseKey,
      dbpath: process.env.DBPATH,
      sync: false
    });
  } catch (ex) {
    throw new Error(`Error connecting to db ${ex}`);
  }

  const clientUrl = getUrlByClient(client);
  const server = await initializeImap({
    user: email, //andres.menoscal1993@gmail.com
    password: password, //$1$2$3$4
    host: clientUrl,
    port: 993,
    tls: true,
    tlsOptions: {
      servername: clientUrl
    }
  });

  const labelsMap = await getMailLabels(server, accountId);

  for (const mailbox in labelsMap) {
    await getMailboxEmails(
      {
        mailbox,
        server,
        labelsMap,
        accountId,
        accountEmail,
        databaseKey
      },
      progressCallback
    );
  }

  process.exit(0);
};

const startMailboxes = async ({ email, password, client }) => {
  const clientUrl = getUrlByClient(client);
  const server = await initializeImap({
    user: email, //andres.menoscal1993@gmail.com
    password: password, //$1$2$3$4
    host: clientUrl,
    port: 993,
    tls: true,
    tlsOptions: {
      servername: clientUrl
    }
  });

  const mailboxes = await getMailboxes(server);
  process.send({
    mailboxes,
    type: 'mailboxes'
  });

  process.exit(0);
};

const startEmails = async (
  {
    email,
    password,
    client,
    accountId,
    accountEmail,
    databaseKey,
    labelsMap,
    addedLabels
  },
  progressCallback
) => {
  try {
    await initDatabaseEncrypted({
      key: databaseKey,
      dbpath: process.env.DBPATH,
      sync: false
    });
  } catch (ex) {
    throw new Error(`Error connecting to db ${ex}`);
  }

  const clientUrl = getUrlByClient(client);
  const server = await initializeImap({
    user: email, //andres.menoscal1993@gmail.com
    password: password, //$1$2$3$4
    host: clientUrl,
    port: 993,
    tls: true,
    tlsOptions: {
      servername: clientUrl
    }
  });

  const newLabels = await handleLabels(addedLabels, accountId);

  for (const mailbox in labelsMap) {
    await getMailboxEmails(
      {
        mailbox,
        server,
        labelsMap,
        accountId,
        accountEmail,
        databaseKey,
        addedLabels: Object.keys(newLabels).map(key => newLabels[key])
      },
      progressCallback
    );
  }

  process.exit(0);
};

const handleProgress = data => {
  process.send(data);
};

process.on('message', data => {
  if (data.step !== 'init') return;

  var args = process.argv.slice(2);
  const accountId = args[0];
  const accountEmail = args[1];
  const client = args[2];

  const { key, email, password, type, labelsMap, addedLabels } = data;

  clearTimeout(startTimeout);
  switch (type) {
    case 'mailboxes':
      startMailboxes(
        { email, password, client, accountId, accountEmail, databaseKey: key },
        handleProgress
      );
      break;
    case 'emails':
      startEmails(
        {
          email,
          password,
          client,
          accountId,
          accountEmail,
          databaseKey: key,
          labelsMap,
          addedLabels
        },
        handleProgress
      );
      break;
    default:
      start({ email, password, client });
      break;
  }
});
