#include "writeDB.h"

int postCreateEmail(struct mg_connection *conn, void *cbdata, string dbPath) {
  int corsResult = cors(conn);
  if (corsResult < 0) {
    return 201;
  }
  
  std::cout << "Receiving Request" << std::endl;
  char *bufferData;
  int readLength = parseBody(&bufferData, conn);

  if (readLength <= 0) {
    mg_send_http_error(conn, 400, "%s", "Request data too big");
    return 400;
  }
  cJSON *obj = cJSON_Parse(bufferData);

  if (obj == NULL) {
    std::cout << "Receiving Request Fail 2 : " << bufferData << std::endl;
    mg_send_http_error(conn, 400, "%s", "No request data");
    return 400;
  }
  std::cout << "Request -> " << cJSON_Print(obj) << std::endl;

  cJSON *key, *threadId, *subject, *preview, *date, *status, *unread, *secure, *unsentDate, *trashDate, *messageId, *fromAddress, *replyTo, *boundary, *accountId;
  key = cJSON_GetObjectItemCaseSensitive(obj, "key");
  threadId = cJSON_GetObjectItemCaseSensitive(obj, "threadId");
  subject = cJSON_GetObjectItemCaseSensitive(obj, "subject");
  preview = cJSON_GetObjectItemCaseSensitive(obj, "preview");
  date = cJSON_GetObjectItemCaseSensitive(obj, "date");
  status = cJSON_GetObjectItemCaseSensitive(obj, "status");
  unread = cJSON_GetObjectItemCaseSensitive(obj, "unread");
  secure = cJSON_GetObjectItemCaseSensitive(obj, "secure");
  unsentDate = cJSON_GetObjectItemCaseSensitive(obj, "unsentDate");
  trashDate = cJSON_GetObjectItemCaseSensitive(obj, "trashDate");
  messageId = cJSON_GetObjectItemCaseSensitive(obj, "messageId");
  fromAddress = cJSON_GetObjectItemCaseSensitive(obj, "fromAddress");
  replyTo = cJSON_GetObjectItemCaseSensitive(obj, "replyTo");
  boundary = cJSON_GetObjectItemCaseSensitive(obj, "boundary");
  accountId = cJSON_GetObjectItemCaseSensitive(obj, "accountId");

  if (!cJSON_IsNumber(key) || !cJSON_IsString(subject) 
    || !cJSON_IsString(preview) || !cJSON_IsString(fromAddress)) {
    mg_send_http_error(conn, 400, "%s", "No request data");
    std::cout << "Receiving Request Fail 3" << std::endl;
    return 400;
  }

  cJSON *response = cJSON_CreateObject();
  int emailId = CriptextDB::createEmail(dbPath, key->valuestring, threadId->string, subject->valuestring, preview->valuestring,
    0, status->valueint, true, true, nullopt, nullopt, messageId->valuestring, fromAddress->valuestring, nullopt, nullopt, accountId->valueint);
  cJSON_AddNumberToObject(response, "emailId", emailId);
  return SendJSON(conn, response);
}