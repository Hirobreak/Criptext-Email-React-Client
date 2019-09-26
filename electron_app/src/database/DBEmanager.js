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
  initDatabaseEncrypted,
  getAccount,
  getAccountByParams
};
