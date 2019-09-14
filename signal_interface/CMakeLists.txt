cmake_minimum_required(VERSION 3.10)

add_definitions(-D__STDC_FORMAT_MACROS)
add_definitions(-D__STDC_LIMIT_MACROS)
add_definitions(-D__USE_MINGW_ANSI_STDIO=1)

include_directories("C:/Program Files/OpenSSL/include/openssl")
include_directories("C:/Program Files (x86)/signal-protocol-c/include")
include_directories("C:/Program Files (x86)/cJSON/include")
include_directories("C:/Program Files (x86)/civetweb/include")
include_directories("C:/Program Files (x86)/spdlog/include")
include_directories("C:/Program Files (x86)/SQLiteCpp/include")

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -std=gnu99")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++17")
set(SOURCES
    main.cpp
    src/http/http.cpp
    src/http/handlers/helpers.cpp
    src/http/handlers/cors.cpp
    src/http/handlers/keyBundle.cpp
    src/http/handlers/encrypt.cpp
    src/http/handlers/decrypt.cpp
    src/crypto/crypto.c
    src/crypto/signal.cpp
    src/crypto/store.cpp
    src/crypto/base64.c
    src/crypto/protocol_store/IdentityKeyStore.cpp
    src/crypto/protocol_store/PreKeyStore.cpp
    src/crypto/protocol_store/SessionStore.cpp
    src/crypto/protocol_store/SignedPreKeyStore.cpp
    src/crypto/protocol_store/decode_utils.cpp
    ../../db_interface/src/axolotl/Account.cpp
    ../../db_interface/src/axolotl/IdentityKey.cpp
    ../../db_interface/src/axolotl/PreKey.cpp
    ../../db_interface/src/axolotl/SessionRecord.cpp
    ../../db_interface/src/axolotl/SignedPreKey.cpp)

find_package(OpenSSL REQUIRED)

add_executable(alice ${SOURCES})

target_link_libraries(alice OpenSSL::SSL)
target_link_libraries(alice "C:/Program Files (x86)/SQLiteCpp/lib/SQLiteCpp.lib")
target_link_libraries(alice "C:/Program Files (x86)/signal-protocol-c/lib/libsignal-protocol-c.a")
target_link_libraries(alice "C:/Program Files (x86)/civetweb/lib/civetweb.lib")
target_link_libraries(alice "C:/Program Files (x86)/cJSON/lib/cjson.lib")
target_link_libraries(alice "C:/Program Files (x86)/spdlog/lib/spdlog/spdlog.lib")