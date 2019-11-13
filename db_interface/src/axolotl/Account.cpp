#include "Account.h"
#include <iostream>

using namespace std;
using namespace sqlite;

CriptextDB::Account CriptextDB::getAccount(string dbPath, string password, char *recipientId) {
  sqlcipher_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  config.key = password;
  sqlcipher_database db(dbPath, config);
  
  string myPrivKey;
  string myPubKey;
  int regId = 0;
  db << "select privKey, pubKey, registrationId from account where recipientId == ?;"
    << recipientId
    >> [&] (string privKey, string pubKey, int registrationId) {
      myPrivKey = privKey;
      myPubKey = pubKey;
      regId = registrationId;
  };
  Account account = { 
    .privKey = myPrivKey, 
    .pubKey = myPubKey, 
    .registrationId = regId,
    .dbPath = dbPath,
    .password = password
  };
  return account;
}

int CriptextDB::createAccount(string dbPath, string password, char* recipientId, char* name, int deviceId, char* pubKey, char* privKey, int registrationId) {
  try {
    bool hasRow = false;
    sqlcipher_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    std::cout << password << std::endl;
    std::cout << dbPath << std::endl;
    config.key = password;
    sqlcipher_database db(dbPath, config);
    db << "begin;";
    db << "Select recipientId from account where recipientId == ?;"
     << recipientId
     >> [&] (string recipientId) {
        hasRow = true;
    };

    if (hasRow) {
      db << "update account set name = ?, deviceId = ?, privKey = ?, pubKey = ?, registrationId = ? where recipientId == ?;"
        << name
        << deviceId
        << privKey
        << pubKey
        << registrationId
        << recipientId;
    } else {
      db << "insert into account (recipientId, name, deviceId, jwt, refreshToken, privKey, pubKey, registrationId) values (?,?,?,?,?,?,?,?);"
        << recipientId
        << name
        << deviceId
        << ""
        << ""
        << privKey
        << pubKey
        << registrationId;
    }
    db << "commit;";
  } catch (exception& e) {
    std::cout << "ERROR Creating Account : " << e.what() << std::endl;
    return false;
  }
  return true;
}
