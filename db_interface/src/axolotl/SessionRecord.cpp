#include "SessionRecord.h"
#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <vector>
#include <iostream>
#include <stdexcept>

using namespace std;

CriptextDB::SessionRecord CriptextDB::getSessionRecord(string dbPath, string recipientId, long int deviceId) {
  std::cout << "Get Session Record : " << recipientId << std::endl;
  SQLite::Database db(dbPath);

  SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ? and deviceId == ?");
  query.bind(1, recipientId);
  query.bind(2, deviceId);

  query.executeStep();
  
  if (!query.hasRow()) {
    throw std::invalid_argument("row not available");
  }

  char *record = strdup(query.getColumn(2).getText());
  SessionRecord sessionRecord = { query.getColumn(0).getString(), query.getColumn(1).getInt(), record };
  return sessionRecord;
}

vector<CriptextDB::SessionRecord> CriptextDB::getSessionRecords(string dbPath, string recipientId) {
  std::cout << "Get Session Records : " << recipientId << std::endl;
  vector<CriptextDB::SessionRecord> sessionRecords;

  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "Select * from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    while (query.executeStep()) {
      char *record = strdup(query.getColumn(1).getText());
      CriptextDB::SessionRecord sessionRecord = { query.getColumn(0).getString(), query.getColumn(1).getInt(), record };
      sessionRecords.push_back(sessionRecord);
    }
  } catch (exception& e) {
    return sessionRecords;
  }

  return sessionRecords;
}

bool CriptextDB::createSessionRecord(string dbPath, string recipientId, long int deviceId, string record) {
  std::cout << "Create Session Record : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath, SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
    SQLite::Transaction transaction(db);

    SQLite::Statement getQuery(db, "Select * from sessionrecord where recipientId == ? and deviceId == ?");
    getQuery.bind(1, recipientId);
    getQuery.bind(2, deviceId);
    getQuery.executeStep();

    if (getQuery.hasRow()) {
      SQLite::Statement query(db, "update sessionrecord set record = ? where recipientId == ? and deviceId == ?");
      query.bind(1, record);
      getQuery.bind(2, recipientId);
      getQuery.bind(3, deviceId);
      query.exec();
    } else {
      SQLite::Statement query(db, "insert into sessionrecord (recipientId, deviceId, record) values (?,?,?)");
      query.bind(1, recipientId);
      query.bind(2, deviceId);
      query.bind(3, record);
      query.exec();
    }
    std::cout << "RETURN SR" << std::endl;
    transaction.commit();
  } catch (exception& e) {
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecord(string dbPath, string recipientId, long int deviceId) {
  std::cout << "Delete Session Record : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ? and deviceId == ?");
    query.bind(1, recipientId);
    query.bind(2, deviceId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}

bool CriptextDB::deleteSessionRecords(string dbPath, string recipientId) {
  std::cout << "Delete Session Records : " << recipientId << std::endl;
  try {
    SQLite::Database db(dbPath);

    SQLite::Statement query(db, "delete from sessionrecord where recipientId == ?");
    query.bind(1, recipientId);

    query.exec();
  } catch (exception& e) {
    return false;
  }

  return true;
}