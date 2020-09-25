const {
  getMailLabels,
  getMailboxEmails,
  getUrlByClient,
  initializeImap
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

const handleProgress = data => {
  process.send(data);
};

process.on('message', data => {
  if (data.step !== 'init') return;

  var args = process.argv.slice(2);
  const accountId = args[0];
  const accountEmail = args[1];
  const client = args[2];

  const { key, email, password } = data;

  clearTimeout(startTimeout);
  start(
    { email, password, client, accountId, accountEmail, databaseKey: key },
    handleProgress
  );
});
