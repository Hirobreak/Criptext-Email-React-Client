{
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
      "cflags": ["-Wall", "-std=c++11"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      "include_dirs" : [
        "C:/Program Files (x86)/signal-protocol-c/include",
        "C:/Program Files (x86)/cJSON/include",
        "C:/Program Files (x86)/civetweb/include",
        "C:/Program Files (x86)/spdlog/include",
        "C:/Program Files (x86)/SQLiteCpp/include"
      ],
      "libraries": [
        "-pthread",
        "-ldl",
        "C:/Program Files (x86)/mingw-w64/i686-8.1.0-posix-dwarf-rt_v6-rev0/mingw32/opt/lib/libssl.a", #
        "C:/Program Files (x86)/mingw-w64/i686-8.1.0-posix-dwarf-rt_v6-rev0/mingw32/opt/lib/libcrypto.a", #
        "C:/Program Files (x86)/mingw-w64/i686-8.1.0-posix-dwarf-rt_v6-rev0/mingw32/opt/lib/libsqlite3.a", #
        "C:/Program Files (x86)/SQLiteCpp/lib/libSQLiteCpp.a", #
        "C:/Program Files (x86)/signal-protocol-c/lib/libsignal-protocol-c.a", #
        "C:/Program Files (x86)/civetweb/lib/civetweb.lib", #
        "C:/Program Files (x86)/cJSON/lib/libcjson.a", #
        "C:/Program Files (x86)/cJSON/lib/cjson.lib", #
        "C:/Program Files (x86)/spdlog/lib/spdlog" #
      ],
      'conditions': [
        ['OS=="mac"', {
          'xcode_settings': {
            'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
          }
        }]
      ]
    }
  ]
}