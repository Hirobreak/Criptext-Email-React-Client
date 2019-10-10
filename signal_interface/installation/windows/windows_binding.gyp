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
      "cflags": ["-Wall", "-std=c++17"],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'cflags_cc': [ "-std=c++17" ],
      "include_dirs" : [
        "C:\Users\Unable to decrypt\Downloads\sqlite3",
        "C:\Program Files\OpenSSL\include",
        "C:\Users\Unable to decrypt\Documents\Git\sqlite_modern_cpp\hdr",
        "C:\Program Files (x86)\signal-protocol-c\include",
        "C:\Program Files (x86)\spdlog\include",
        "C:\Program Files (x86)\cJSON\include",
        "/usr/include",
        "C:\Program Files (x86)\civetweb\include",
        "/usr/local/include"
      ],
      "variables": {
        "dll_files": [
          "C:/Users/Unable to decrypt/Downloads/sqlite-dll-win64-x64-3290000/sqlite3.dll"
        ]
      },
      "ldflags": [ "/NODEFAULTLIB:LIBCMT" ],
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
        [
          'OS=="mac"', {
            'xcode_settings': {
              'GCC_ENABLE_CPP_EXCEPTIONS': 'YES'
            }
          }
        ],
        [
          "OS=='win'", {
            'include_dirs': [
              'C:\Users\Unable to decrypt\Downloads\sqlite3',
              "C:/Program Files/OpenSSL/include/openssl",
              "C:/Program Files (x86)/signal-protocol-c/include",
              "C:/Program Files (x86)/cJSON/include",
              "C:/Program Files (x86)/civetweb/include",
              "C:/Program Files (x86)/spdlog/include",
              "C:\Users\Unable to decrypt\Documents\Git\sqlite_modern_cpp\hdr"
            ],
            "msvs_settings": {
              "VCCLCompilerTool": {
                'StringPooling': 'true', # pool string literals
                'DebugInformationFormat': 3, # Generate a PDB
                'WarningLevel': 3,
                'BufferSecurityCheck': 'true',
                'ExceptionHandling': 1, # /EHsc
                'SuppressStartupBanner': 'true',
                'WarnAsError': 'false',
              },
              'VCLinkerTool': {
                'IgnoreDefaultLibraryNames': ['libcmtd.lib', 'libcmt.lib'],
              }
            }
          }
        ]
      ]
    }
  ]
}