const {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Label,
  getDB,
  initDatabaseEncrypted,
  resetKeyDatabase,
  Table
} = require('./DBEmodel.js');

const getAccount = () => {
  const db = getDB();
  if (!db) return [];
};

const getAccountByParams = () => {
  const db = getDB();
  if (!db) return [];
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
  getDB,
  getAccount,
  getAccountByParams,
  initDatabaseEncrypted,
  resetKeyDatabase
};
