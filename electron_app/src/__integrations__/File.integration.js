/* eslint-env node, jest */
// const DBManager = require('../database/DBManager');
const DBManager = require('../database');

const email = {
  email: {
    threadId: 'threadC',
    key: '3',
    s3Key: 's3KeyC',
    subject: 'Greetings',
    content: '<p>Hello there</p>',
    preview: 'Hello there',
    date: '2018-06-14 08:23:19.120',
    status: 0,
    unread: true,
    secure: true,
    unsendDate: '2018-06-14 08:23:20.000',
    messageId: 'messageIdC',
    fromAddress: 'User A <usera@criptext.com>'
  },
  recipients: {
    from: ['User A <usera@criptext.com>'],
    to: ['user@criptext.com', 'userb@criptext.com']
  },
  labels: [1],
  files: [
    {
      token: 'tokenC',
      name: 'Criptext_Image_2018_06_14.png',
      size: 183241,
      status: 1,
      date: '2018-06-14T23:45:57.466Z',
      mimeType: 'image/png',
      key: 'fileKeyA',
      iv: 'fileIvA'
    }
  ]
};

const insertEmail = async () => {
  await DBManager.createEmail(email);
};

beforeAll(async () => {
  // await DBManager.cleanDataBase();
  // await DBManager.createTables();
  await DBManager.deleteDatabase();
  await DBManager.initDatabaseEncrypted('1111', true);
  await insertEmail();
});

describe('Load data file from File Table:', () => {
  it('should load file by tokens', async () => {
    const token = 'tokenC';
    const file = await DBManager.getFilesByTokens([token]);
    expect(file).toMatchSnapshot();
  });
});
