const {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Label,
  deleteDatabase,
  getDB,
  initDatabaseEncrypted,
  resetKeyDatabase,
  Op,
  Table
} = require('./DBEmodel.js');
const { noNulls } = require('../utils/ObjectUtils');

/* Account
----------------------------- */
const createAccount = async params => {
  return await Account().create(params);
};

const getAccount = async () => {
  return await Account().findAll();
};

const getAccountByParams = async params => {
  return await Account().findAll({ where: params });
};

const updateAccount = async ({
  deviceId,
  jwt,
  refreshToken,
  name,
  privKey,
  pubKey,
  recipientId,
  registrationId,
  signature,
  signatureEnabled,
  signFooter
}) => {
  const params = noNulls({
    deviceId,
    jwt,
    refreshToken,
    name,
    privKey,
    pubKey,
    registrationId,
    signature,
    signatureEnabled:
      typeof signatureEnabled === 'boolean' ? signatureEnabled : undefined,
    signFooter: typeof signFooter === 'boolean' ? signFooter : undefined
  });

  return await Account().update(params, {
    where: { recipientId: { [Op.eq]: recipientId } }
  });
};

module.exports = {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Label,
  Table,
  createAccount,
  deleteDatabase,
  getDB,
  getAccount,
  getAccountByParams,
  initDatabaseEncrypted,
  resetKeyDatabase,
  updateAccount
};
