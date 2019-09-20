{
  "variables": {
    "dll_files": [
      "C:\Program Files\OpenSSL\bin\libcrypto-3.dll", 
      "C:\Program Files (x86)\cJSON\lib\cjson.dll"
    ]
  },
  "targets": [
    {
      "target_name": "alice",
      "type": "executable",
      "sources": [ 
        "main.cpp",
        "src/http/http.cpp",
        "src/http/handlers/helpers.cpp",
        "src/http/handlers/cors.cpp",
        "src/http/handlers/encrypt.cpp",
        "src/http/handlers/decrypt.cpp",
        "src/http/handlers/keyBundle.cpp",
        "src/helpers/utf8.c",
        "src/crypto/crypto.c",
        "src/crypto/signal.cpp",
        "src/crypto/store.cpp",
        "src/crypto/base64.c",
        "src/crypto/protocol_store/IdentityKeyStore.cpp",
        "src/crypto/protocol_store/PreKeyStore.cpp",
        "src/crypto/protocol_store/SessionStore.cpp",
        "src/crypto/protocol_store/SignedPreKeyStore.cpp",
        "src/crypto/protocol_store/decode_utils.cpp",
        "../db_interface/src/axolotl/Account.cpp",
        "../db_interface/src/axolotl/IdentityKey.cpp",
        "../db_interface/src/axolotl/PreKey.cpp",
        "../db_interface/src/axolotl/SessionRecord.cpp",
        "../db_interface/src/axolotl/SignedPreKey.cpp"
      ],
      "cflags": ["-Wall"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'cflags_cc!': [ "-std=c++17" ],
      "include_dirs" : [
        "/usr/local/include",
        "/usr/include",
        "C:\Users\Unable to decrypt\Documents\Git\sqlite_modern_cpp\hdr",
        "C:\Users\Unable to decrypt\Downloads\sqlite3",
        "C:\Program Files\OpenSSL\include",
        "C:\Program Files (x86)\signal-protocol-c\include",
        "C:\Program Files (x86)\spdlog\include",
        "C:\Program Files (x86)\cJSON\include",
        "C:\Program Files (x86)\civetweb\include"
      ],
      "libraries": [
        "C:\Users\Unable to decrypt\Downloads\sqlite3\sqlite3.lib",
        "C:\Program Files\OpenSSL\lib\libcrypto.lib",
        "C:\Program Files\OpenSSL\lib\libssl.lib",
        "C:\Program Files (x86)\signal-protocol-c\lib\signal-protocol-c.lib",
        "C:\Program Files (x86)\spdlog\lib\spdlog\spdlog.lib",
        "C:\Program Files (x86)\cJSON\lib\cjson.lib",
        "C:\Program Files (x86)\civetweb\lib\civetweb.lib"
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'OTHER_CPLUSPLUSFLAGS' : [ '-std=c++17', '-stdlib=libc++' ],
            'OTHER_LDFLAGS': [ '-stdlib=libc++' ],
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}