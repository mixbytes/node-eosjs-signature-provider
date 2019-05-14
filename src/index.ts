// @ts-ignore
import * as ecc from "eosjs-ecc"
// @ts-ignore
import * as cppModule from "../build/Release/node_eos_signature_provider";
import {SignatureProvider, SignatureProviderArgs} from "eosjs/dist/eosjs-api-interfaces";
import {PushTransactionArgs} from "eosjs/dist/eosjs-rpc-interfaces";
import {convertLegacyPublicKey} from 'eosjs/dist/eosjs-numeric';

export default class NodeEosjsSignatureProvider implements SignatureProvider {
    private readonly privateKeys: string[];
    private readonly keys: Map<string, string> = new Map();

    constructor(privateKeys: string[]) {
        if (privateKeys.length === 0)
            throw new Error("At least one private key must be specified");
        this.privateKeys = privateKeys;
    }

    getAvailableKeys(): Promise<string[]> {
        return this.generateKeyPairs().then(() => Array.from(this.keys.keys()));
    }

    sign({chainId, requiredKeys, serializedTransaction}: SignatureProviderArgs): Promise<PushTransactionArgs> {
        return this.generateKeyPairs()
            .then(() => new Promise<PushTransactionArgs>(resolve => {
                let privateKeys = requiredKeys
                    .map(key => convertLegacyPublicKey(key))
                    .map(key => this.keys.get(key))
                    .filter(pkey => pkey);

                const signBuf = Buffer.concat([
                    Buffer.from(chainId, 'hex'),
                    Buffer.from(serializedTransaction),
                    Buffer.from(new Uint8Array(32)),
                ]);

                resolve(
                    {
                        serializedTransaction: serializedTransaction,
                        signatures: cppModule.sign(privateKeys, signBuf)
                    }
                );
            }));
    }

    private generateKeyPairs(): Promise<any> {
        if (this.keys.size !== 0)
            return Promise.resolve();
        return Promise.all(this.privateKeys.map(privateKey => {
            this.keys.set(
                convertLegacyPublicKey(ecc.PrivateKey.fromString(privateKey).toPublic().toString()), privateKey);
        }));
    }
}