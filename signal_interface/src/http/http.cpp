#include "http.h"
#include <unistd.h>
#include <iostream>

struct mg_callbacks callbacks;
struct mg_context *ctx;

char* login_url;
char* get_kb_url;
SQLite::Database *db;

const char* civet_options[] = {
    "document_root",
    ".",
    "listening_ports",
    "8085",
    "request_timeout_ms",
    "10000",
    "error_log_file",
    "error.log",
    "enable_auth_domain_check",
    "no",
    0
};

int decrypt(struct mg_connection *conn, void *cbdata){
  std::cout << "DECRYPT" << std::endl;
  return postDecrypt(conn, cbdata, db);
}

int decryptKey(struct mg_connection *conn, void *cbdata){
  std::cout << "DECRYPT KEY" << std::endl;
  return postDecryptKey(conn, cbdata, db);
}

int encryptKey(struct mg_connection *conn, void *cbdata){
  std::cout << "ENCRYPT KEY" << std::endl;
  return postEncryptKey(conn, cbdata, db);
}

int encryptEmail(struct mg_connection *conn, void *cbdata){
  std::cout << "ENCRYPT EMAIL" << std::endl;
  return postEncryptEmail(conn, cbdata, db);
}

int sessionCreate(struct mg_connection *conn, void *cbdata){
  std::cout << "SESSION CREATE" << std::endl;
  return processKeyBundle(conn, cbdata, db);
}

int postKeyByndle(struct mg_connection *conn, void *cbdata){
  std::cout << "CREATE KEY BUNDLE" << std::endl;
  return createKeyBundle(conn, cbdata, db);
}

int pong(struct mg_connection *conn, void *cbdata){
  std::cout << "PING PING" << std::endl;
  mg_send_http_ok( conn, "text/plain", 5);
  mg_write(conn, "pong\n", 5);
  return 1;
}

void http_init(){
  login_url = getenv("BOB_LOGIN_URL");
  get_kb_url = getenv("BOB_GET_KEYBUNDLE_URL");

  SQLite::Database database("../../electron_app/Criptext.db", SQLite::OPEN_READWRITE|SQLite::OPEN_CREATE);
  db = &database;

  ctx = mg_start(&callbacks, 0, civet_options);
  mg_set_request_handler(ctx, "/decrypt", decrypt, 0);
  mg_set_request_handler(ctx, "/decrypt/key", decryptKey, 0);
  mg_set_request_handler(ctx, "/encrypt/key", encryptKey, 0);
  mg_set_request_handler(ctx, "/encrypt/email", encryptEmail, 0);
  mg_set_request_handler(ctx, "/account", createAccount, 0);
  mg_set_request_handler(ctx, "/keybundle", postKeyByndle, 0);
  mg_set_request_handler(ctx, "/session/create", sessionCreate, 0);
  mg_set_request_handler(ctx, "/ping", pong, 0);
}

void http_shutdown(){
  mg_stop(ctx);
}