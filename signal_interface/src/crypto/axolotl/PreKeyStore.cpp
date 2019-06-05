#include <check.h>
#include "./store.h"
#include "./uthash.h"
#include <string>
#include <vector>

int pre_key_store_load_pre_key(signal_buffer **record, uint32_t pre_key_id, void *user_data)
{

    CriptextDB::Account *account = user_data;
    CriptextDB::PreKey preKey = CriptextDB::getPreKey("<path>", pre_key_id, account->id);

    if(!preKey) {
        return 0;
    }
    uint8_t* recordData = reinterpret_cast<const uint8_t*>(preKey.privKey.getString());
    signal_buffer *result = signal_buffer_create(recordData, sizeof(recordData));
    if(!result) {
        return SG_ERR_NOMEM;
    }
    *record = result;
    return 1;
}

int pre_key_store_store_pre_key(uint32_t pre_key_id, uint8_t *record, size_t record_len, void *user_data)
{
    CriptextDB::Account *account = user_data;
    bool success = CriptextDB::createPreKey("<path>", pre_key_id, "<PrivKey>", "<PubKey>", account->id);
    return success ? 1 : 0;
}

int pre_key_store_contains_pre_key(uint32_t pre_key_id, void *user_data)
{
    CriptextDB::Account *account = user_data;
    CriptextDB::PreKey preKey = CriptextDB::getPreKey("<path>", pre_key_id, account->id);
    return !preKey ? 0 : 1;
}

int pre_key_store_remove_pre_key(uint32_t pre_key_id, void *user_data)
{
    CriptextDB::Account *account = user_data;
    bool success = CriptextDB::deletePreKey("<path>", pre_key_id, account->id);
    return success ? 1 : 0;
}

void pre_key_store_destroy(void *user_data)
{
    
}

void setup_pre_key_store(signal_protocol_store_context *context, CriptextDB::Account *account)
{
    signal_protocol_pre_key_store store = {
        .load_pre_key = pre_key_store_load_pre_key,
        .store_pre_key = pre_key_store_store_pre_key,
        .contains_pre_key = pre_key_store_contains_pre_key,
        .remove_pre_key = pre_key_store_remove_pre_key,
        .destroy_func = pre_key_store_destroy,
        .user_data = account
    };

    signal_protocol_store_context_set_pre_key_store(context, &store);
}