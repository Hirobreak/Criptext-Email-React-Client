#include <stdlib.h>
#include <string>
#include <civetweb.h>
#include "../../../db_interface/src/axolotl/Account.h"
#include "./handlers/decrypt.h"
#include "./handlers/keyBundle.h"

void http_init();
void http_shutdown();