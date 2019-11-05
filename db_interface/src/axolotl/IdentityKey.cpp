#include "IdentityKey.h"
#include <string>
#include <iostream>

using namespace sqlite;
using namespace std;

CriptextDB::IdentityKey CriptextDB::getIdentityKey(string dbPath, string password, string recipientId, long int deviceId) {
  sqlcipher_config config;
  config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READONLY;
  config.key = password;
  sqlcipher_database db(dbPath, config);

  IdentityKey identityKey;
  db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string identity) {
        identityKey = { 
          .recipientId = recipientId, 
          .deviceId = deviceId, 
          .identityKey = identity
        };
    };

  if (identityKey.deviceId == 0 || identityKey.identityKey.empty()) {
    throw std::invalid_argument("row not available");
  }
  return identityKey;
}

bool CriptextDB::createIdentityKey(string dbPath, string password, string recipientId, int deviceId, char *identityKey) {
  try {
    bool hasRow = false;
    sqlcipher_config config;
    config.flags = OpenFlags::FULLMUTEX | OpenFlags::SHAREDCACHE | OpenFlags::READWRITE;
    config.key = password;
    sqlcipher_database db(dbPath, config);
    db << "begin;";
    db << "Select * from identitykeyrecord where recipientId == ? and deviceId == ?;"
     << recipientId
     << deviceId
     >> [&] (string recipientId, int deviceId, string identity) {
        hasRow = true;
    };
    if (hasRow) {
      db << "update identitykeyrecord set identityKey = ? where recipientId == ? and deviceId == ?;"
        << identityKey
        << recipientId
        << deviceId;
    } else {
      db << "insert into identitykeyrecord (recipientId, deviceId, identityKey) values (?,?,?);"
        << recipientId
        << deviceId
        << identityKey;
    }
    db << "commit;";
  } catch (exception& e) {
    std::cout << "ERROR Creating Identity Key: " << e.what() << std::endl;
    return false;
  }
  return true;
}