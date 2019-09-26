const dbManager = require('./../database');
const pinWindow = require('./pin');

const upStepDBEncryptedWithoutPIN = async () => {
  const [existingAccount] = await dbManager.getAccount();
  if (existingAccount) {
    await pinWindow.show();
  }
};

module.exports = {
  dbManager,
  upStepDBEncryptedWithoutPIN
};
