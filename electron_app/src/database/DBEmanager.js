const {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  deleteDatabase,
  getDB,
  initDatabaseEncrypted,
  resetKeyDatabase,
  Op,
  Table
} = require('./DBEmodel.js');
const { noNulls } = require('../utils/ObjectUtils');
const { formContactsRow } = require('../utils/dataTableUtils.js');

/* Account
----------------------------- */
const createAccount = async params => {
  return await Account().create(params);
};

const getAccount = async () => {
  if (!getDB()) return [];
  return await Account().findAll({ raw: true });
};

const getAccountByParams = async params => {
  if (!getDB()) return [];
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

/* Contact
----------------------------- */
const createContact = async params => {
  return await Contact().bulkCreate(params);
};

const createContactsIfOrNotStore = async (contacts, trx) => {
  const parsedContacts = filterUniqueContacts(formContactsRow(contacts));
  const contactsMap = parsedContacts.reduce((contactsObj, contact) => {
    contactsObj[contact.email] = contact;
    return contactsObj;
  }, {});
  const emailAddresses = Object.keys(contactsMap);
  const contactsFound = await Contact().findAll({
    where: { email: emailAddresses },
    transaction: trx
  });
  const contactsToUpdate = contactsFound.reduce((toUpdateArray, contact) => {
    const email = contact.email;
    const newName = contactsMap[email].name || contact.name;
    if (newName !== contact.name) {
      toUpdateArray.push({ email, name: newName });
    }
    return toUpdateArray;
  }, []);

  const storedEmailAddresses = contactsFound.map(
    storedContact => storedContact.email
  );
  const newContacts = parsedContacts.filter(
    contact => !storedEmailAddresses.includes(contact.email)
  );

  if (newContacts.length) {
    await Contact().bulkCreate(newContacts, { transaction: trx });
  }
  if (contactsToUpdate.length) {
    await Promise.all(
      contactsToUpdate.map(contact => updateContactByEmail(contact, trx))
    );
  }
  return emailAddresses;
};

const getAllContacts = async () => {
  return await Contact().findAll({
    attributes: ['name', 'email'],
    order: [['score', 'DESC'], ['name']]
  });
};

const getContactByEmails = async (emails, trx) => {
  return await Contact().findAll({
    attributes: ['id', 'email', 'score', 'spamScore'],
    where: { email: emails },
    transaction: trx
  });
};

const getContactByIds = async (ids, trx) => {
  return await Contact().findAll({
    attributes: ['id', 'email', 'name'],
    where: { id: ids },
    raw: true,
    transaction: trx
  });
};

const updateContactByEmail = async ({ email, name }, trx) => {
  return await Contact().update(
    { name },
    { where: { email: { [Op.eq]: email } }, transaction: trx }
  );
};

/* Functions
----------------------------- */
const filterUniqueContacts = contacts => {
  const contactsUnique = contacts.reduce(
    (result, contact) => {
      const obj = Object.assign(result);
      if (!result.stack[contact.email]) {
        obj.stack[contact.email] = contact;
        obj.contacts.push(contact);
      }
      return obj;
    },
    { stack: {}, contacts: [] }
  );
  return contactsUnique.contacts;
};

module.exports = {
  Account,
  Contact,
  Email,
  EmailContact,
  EmailLabel,
  Feeditem,
  File,
  Identitykeyrecord,
  Label,
  Pendingevent,
  Prekeyrecord,
  Sessionrecord,
  Settings,
  Signedprekeyrecord,
  Table,
  createAccount,
  createContact,
  createContactsIfOrNotStore,
  deleteDatabase,
  getDB,
  getAccount,
  getAccountByParams,
  getAllContacts,
  getContactByEmails,
  getContactByIds,
  initDatabaseEncrypted,
  resetKeyDatabase,
  updateAccount,
  updateContactByEmail
};
