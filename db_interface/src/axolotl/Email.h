#ifndef EMAIL_H_
#define EMAIL_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <cjson/cJSON.h>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct Email {
    int id;
    string key;
    string threadId;
    string subject;
    string content;
    string preview;
    string date;
    int status;
    bool unread;
    bool secure;
    optional<string> unsendDate;
    optional<string> trashDate;
    string messageId;
    string fromAddress;
    optional<string> replyTo;
    optional<string> boundary;
    int accountId;

    cJSON *toJSON(){
      cJSON *email = cJSON_CreateObject();
      if(email == NULL){
        return NULL;
      }

      cJSON_AddNumberToObject(email, "id", id);
      cJSON_AddStringToObject(email, "threadId", threadId.c_str());
      cJSON_AddStringToObject(email, "subject", subject.c_str());
      cJSON_AddStringToObject(email, "content", content.c_str());
      cJSON_AddStringToObject(email, "preview", preview.c_str());
      cJSON_AddStringToObject(email, "date", date.c_str());
      cJSON_AddNumberToObject(email, "status", status);
      cJSON_AddBoolToObject(email, "unread", unread);
      cJSON_AddBoolToObject(email, "secure", secure);
      cJSON_AddItemToObject(email, "unsendDate", cJSON_CreateString(unsendDate ? (*unsendDate).c_str() : NULL));
      cJSON_AddItemToObject(email, "trashDate", cJSON_CreateString(trashDate ? (*trashDate).c_str() : NULL));
      cJSON_AddStringToObject(email, "messageId", messageId.c_str());
      cJSON_AddStringToObject(email, "fromAddress", fromAddress.c_str());
      cJSON_AddItemToObject(email, "replyTo", cJSON_CreateString(replyTo ? (*replyTo).c_str() : NULL));
      cJSON_AddItemToObject(email, "boundary", cJSON_CreateString(boundary ? (*boundary).c_str() : NULL));
      
      return email;
    }
  };
  
  int createEmail(string dbPath, string key, string threadId, string subject, string preview, string date, int status, bool unread, bool secure, optional<string> unsendDate, optional<string> trashDate, string messageId, string fromAddress, optional<string> replyTo, optional<string> boundary, int accountId);
  int deleteEmailByKey(string dbPath, string key, int accountId);
  int deleteEmailById(string dbPath, int emailId, int accountId);
  int deleteEmailsById(string dbPath, vector<int> emailIds, int accountId);
  int deleteEmailsByThreadIdAndEmailId(string dbPath, vector<int> threadIds, int labelId, int accountId);
  vector<Email> getTrashExpiredEmails(string dbPath, int accountId);
  Email getEmailByKey(string dbPath, string key, int accountId);
  cJSON *getResponseEmailsByThreadId(string dbPath, vector<int> rejectedLabel, string threadId, int accountId);
  vector<Email> getEmailsByIds(string dbPath, vector<int> emailIds, int accountId);
  vector<Email> getEmailsByThreadId(string dbPath, string threadId, vector<int> rejectedLabels, int accountId);
  vector<Email> getEmailsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId);
  vector<Email> getEmailsByLabelId(string dbPath, vector<int> rejectedLabels, int labelId, string date, int limit, int accountId);
} 

#endif