const Imap = require('imap');
const inspect = require('util').inspect;
const { parseSimpleEmail } = require('./mailParser');
const { createEmail } = require('../database/DBEmanager');
const { saveEmailBody } = require('../utils/FileUtils');

let imap;

const getUrlByClient = client => {
  switch (client) {
    case 'outlook':
      return 'outlook.office365.com';
    default:
      return 'imap.gmail.com';
  }
};

const initConnection = (
  { email, password, client, accountId, accountEmail, databaseKey },
  progressCallback
) => {
  const clientUrl = getUrlByClient(client);
  console.log(email, clientUrl);
  const externalIndex = Date.now();
  imap = new Imap({
    user: email, //andres.menoscal1993@gmail.com
    password: password, //$1$2$3$4
    host: clientUrl,
    port: 993,
    tls: true,
    tlsOptions: {
      servername: clientUrl
    }
  });
  imap.once('error', err => {
    console.log('Error Connect :', err);
  });
  imap.once('ready', () => {
    console.log('CONNECTED');
    imap.openBox('INBOX', (error, mailbox) => {
      console.log(mailbox);
      let parsedEmails = 0;
      if (error) console.log('error 1: ', error);
      imap.search(['ALL'], (error, uids) => {
        console.log('NOT SHY: ', uids);
        const fetchUids = uids.splice(0, 20);
        if (error) console.log('error 2: ', error);
        progressCallback({
          totalEmails: fetchUids.length,
          type: 'import'
        });
        const fetch = imap.fetch(fetchUids, {
          bodies: [''], //['HEADER.FIELDS (FROM TO SUBJECT DATE)', '']
          struct: true
        });
        fetch.on('message', (message, sequenceNumber) => {
          const prefix = '(#' + sequenceNumber + ') ';
          message.on('body', function(stream, info) {
            var buffer = '';
            stream.on('data', function(chunk) {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              handleEmailData({
                buffer,
                accountId,
                accountEmail,
                newKey: `EXT${externalIndex}${sequenceNumber}`,
                databaseKey
              }).then(() => {
                parsedEmails++;
                progressCallback({
                  parsedEmails,
                  totalEmails: fetchUids.length,
                  lastEmail: `EXT${externalIndex}${sequenceNumber}`,
                  type: 'progress'
                });
              });
            });
          });
          message.once('attributes', function(attrs) {
            console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
          });
          message.once('end', function() {
            console.log(prefix + 'Finished');
          });
        });
      });
    });
  });
  imap.connect();
};

const handleEmailData = async ({ buffer, accountId, accountEmail, newKey }) => {
  const result = await parseSimpleEmail(buffer, {}, newKey, accountId);
  await createEmail(result);
  await saveEmailBody({
    body: result ? result.body : 'No body',
    headers: '',
    metadataKey: newKey,
    username: accountEmail,
    password: databaseKey
  });
};

module.exports = {
  initConnection
};
