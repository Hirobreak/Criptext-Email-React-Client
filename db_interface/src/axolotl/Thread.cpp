#include "Thread.h"
#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"
#include <unordered_set>

using namespace std;

string CriptextDB::getThreadsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId){
  vector<Thread> threads;
  for(const string &threadId: threadIds){
    vector<Email> emails = CriptextDB::getEmailsByThreadIds(dbPath, threadIds, labelId, date, limit, accountId);
    vector<CriptextDB::FullEmail> fullEmails;
    for(const CriptextDB::Email &email : emails){
      vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
      vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
      vector<int> labelIds;
      for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
          labelIds.push_back(emailLabel.labelId);
      }
      vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
      vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
      vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
      vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
      string fromEmail = CriptextDB::DBUtils::getFromEmail(email.fromAddress);
      Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
      FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

      fullEmails.push_back(fullEmail);
    }
    std::unordered_set<int> labelIds;
    vector<int> emailIds;
    vector<string> fileTokens;
    unordered_set<string> fromNames;
    unordered_set<int> contactIds;
    std::transform(fullEmails.cbegin(), fullEmails.cend(), std::back_inserter(emailIds), [&](FullEmail const & fullEmail) {
        std::transform(fullEmail.labels.cbegin(), fullEmail.labels.cend(), std::back_inserter(labelIds), [&](Label const & label) {
          return label.id;
        });
        std::transform(fullEmail.files.cbegin(), fullEmail.files.cend(), std::back_inserter(fileTokens), [&](CRFile const & file) {
          return file.token;
        });
        std::transform(fullEmail.to.cbegin(), fullEmail.to.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
          return contact.id;
        });
        std::transform(fullEmail.cc.cbegin(), fullEmail.cc.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
          return contact.id;
        });
        std::transform(fullEmail.bcc.cbegin(), fullEmail.bcc.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
          return contact.id;
        });
        contactIds.insert(fullEmail.from.id);
        fromNames.insert(fullEmail.email.fromAddress);
        return fullEmail.email.id;
    });
    optional<string> trashDate = fullEmails.back().email.trashDate ? 
    CriptextDB::DBUtils::getDateForDBSaving(*fullEmails.back().email.trashDate) : NULL;
    optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
    CriptextDB::DBUtils::getDateForDBSaving(*fullEmails.back().email.unsendDate) : NULL;
    Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, CriptextDB::DBUtils::getDateForDBSaving(fullEmails.back().email.date), emailIds,
     fileTokens, fullEmails.back().from.email, CriptextDB::DBUtils::joinSet(fromNames), fullEmails.back().email.id,
     fullEmails.back().email.key, CriptextDB::DBUtils::getDateForDBSaving(fullEmails.back().email.date), fullEmails.back().email.messageId, fullEmails.back().email.preview,
     contactIds, fullEmails.back().email.replyTo, fullEmails.back().email.secure, fullEmails.back().email.status, 
     fullEmails.back().email.subject, threadId, trashDate, fullEmails.back().email.unread, 
     unsendDate };

     threads.push_back(thread);
  }

  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  string jsonString = cJSON_Print(threadsJSONArray);
  cJSON_Delete(threadsJSONArray);
  return jsonString;
}

string CriptextDB::getThreadsByLabel(string dbPath, vector<int> rejectedLabel, int labelId, string date, int limit, int accountId){
  vector<Thread> threads;
  
  vector<Email> emails = CriptextDB::getEmailsByLabelId(dbPath, labelId, date, limit, accountId);
  vector<CriptextDB::FullEmail> fullEmails;
  for(const CriptextDB::Email &email : emails){
    vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
    vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
    vector<int> labelIds;
    for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
        labelIds.push_back(emailLabel.labelId);
    }
    vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
    vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
    vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
    vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
    string fromEmail = CriptextDB::DBUtils::getFromEmail(email.fromAddress);
    Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
    FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

    fullEmails.push_back(fullEmail);
  }
  std::unordered_set<int> labelIds;
  vector<int> emailIds;
  vector<string> fileTokens;
  unordered_set<string> fromNames;
  unordered_set<int> contactIds;
  std::transform(fullEmails.cbegin(), fullEmails.cend(), std::back_inserter(emailIds), [&](FullEmail const & fullEmail) {
      std::transform(fullEmail.labels.cbegin(), fullEmail.labels.cend(), std::back_inserter(labelIds), [&](Label const & label) {
        return label.id;
      });
      std::transform(fullEmail.files.cbegin(), fullEmail.files.cend(), std::back_inserter(fileTokens), [&](CRFile const & file) {
        return file.token;
      });
      std::transform(fullEmail.to.cbegin(), fullEmail.to.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
        return contact.id;
      });
      std::transform(fullEmail.cc.cbegin(), fullEmail.cc.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
        return contact.id;
      });
      std::transform(fullEmail.bcc.cbegin(), fullEmail.bcc.cend(), std::back_inserter(contactIds), [&](Contact const & contact) {
        return contact.id;
      });
      contactIds.insert(fullEmail.from.id);
      fromNames.insert(fullEmail.email.fromAddress);
      return fullEmail.email.id;
  });
  optional<string> trashDate = fullEmails.back().email.trashDate ? 
  CriptextDB::DBUtils::getDateForDBSaving(*fullEmails.back().email.trashDate) : NULL;
  optional<string> unsendDate = fullEmails.back().email.unsendDate ? 
  CriptextDB::DBUtils::getDateForDBSaving(*fullEmails.back().email.unsendDate) : NULL;
  Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, CriptextDB::DBUtils::getDateForDBSaving(fullEmails.back().email.date), emailIds,
    fileTokens, fullEmails.back().from.email, CriptextDB::DBUtils::joinSet(fromNames), fullEmails.back().email.id,
    fullEmails.back().email.key, CriptextDB::DBUtils::getDateForDBSaving(fullEmails.back().email.date), fullEmails.back().email.messageId, fullEmails.back().email.preview,
    contactIds, fullEmails.back().email.replyTo, fullEmails.back().email.secure, fullEmails.back().email.status, 
    fullEmails.back().email.subject, threadId, trashDate, fullEmails.back().email.unread, 
    unsendDate };

    threads.push_back(thread);
  

  cJSON *threadsJSONArray = cJSON_CreateArray();
  for(Thread &t: threads){
    cJSON_AddItemToArray(threadsJSONArray, t.toJSON());
  }
  string jsonString = cJSON_Print(threadsJSONArray);
  cJSON_Delete(threadsJSONArray);
  return jsonString;
}

