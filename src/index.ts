// @ts-ignore
import * as ecc from "eosjs-ecc"
// @ts-ignore
import {SignatureProvider, SignatureProviderArgs} from "eosjs/dist/eosjs-api-interfaces";
import {PushTransactionArgs} from "eosjs/dist/eosjs-rpc-interfaces";
import {convertLegacyPublicKey} from 'eosjs/dist/eosjs-numeric';

export default class NodeEosjsSignatureProvider implements SignatureProvider {
    private readonly privateKeys: string[];
    private readonly keys: Map<string, string> = new Map();
    private readonly module: any;

    constructor(privateKeys: string[]) {
        if (privateKeys.length === 0)
            throw new Error("At least one private key must be specified");
        this.privateKeys = privateKeys;
        switch (process.platform) {
            case "linux":
                this.module = require("node-eosjs-signature-provider-linux/build/Release/node-eosjs-signature-provider.node");
                break;
            case "darwin":
                this.module = require("node-eosjs-signature-provider-macos/build/Release/node-eosjs-signature-provider.node");
                break;
            default:
                throw new Error(`This module only works on Darwin (MacOS) and Linux. Your os is ${process.platform}`);
        }
    }

    getAvailableKeys(): Promise<string[]> {
        return this.generateKeyPairs().then(() => Array.from(this.keys.keys()));
    }

    sign({chainId, requiredKeys, serializedTransaction}: SignatureProviderArgs): Promise<PushTransactionArgs> {
        return this.generateKeyPairs()
            .then(() => new Promise<PushTransactionArgs>(resolve => {
                let privateKeys = requiredKeys
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
                        signatures: this.module.sign(privateKeys, signBuf)
                    }
                );
            }));
    }

    private generateKeyPairs(): Promise<any> {
        if (this.keys.size !== 0)
            return Promise.resolve();
        return Promise.all(this.privateKeys.map(privateKey => {
            let publicKey = ecc.PrivateKey.fromString(privateKey).toPublic().toString();

            this.keys.set(publicKey, privateKey);
            this.keys.set(convertLegacyPublicKey(publicKey), privateKey);
        }));
    }
}
