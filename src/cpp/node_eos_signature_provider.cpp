#include <napi.h>
#include <fc/crypto/pke.hpp>
#include <fc/crypto/private_key.hpp>

Napi::Value SignAll(const Napi::CallbackInfo &info) {
    Napi::Env env = info.Env();

    Napi::Array stringPrivateKeys = info[0].As<Napi::Array>();
    Napi::Uint8Array serializedTransaction = info[1].As<Napi::Uint8Array>();

    size_t serializedTransactionLength = serializedTransaction.ElementLength();

    fc::sha256::encoder encoder;
    for (size_t i = 0; i < serializedTransactionLength; i++) {
        encoder.put(serializedTransaction[i]);
    }
    fc::sha256 sha256 = encoder.result();

    uint32_t stringPrivateKeysAmount = stringPrivateKeys.Length();
    Napi::Array ans = Napi::Array::New(env, stringPrivateKeysAmount);
    for (uint32_t i = 0; i < stringPrivateKeysAmount; i++) {
        std::string stringPrivateKey = stringPrivateKeys.Get(i).ToString();
        fc::crypto::private_key privateKey(stringPrivateKey);
        std::string signature(privateKey.sign(sha256));
        ans.Set(i, Napi::String::New(env, signature));
    }

    return ans;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "sign"),
                Napi::Function::New(env, SignAll));
    return exports;
}

NODE_API_MODULE(node_eos_signature_provider, Init)