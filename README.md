# node-eosjs-signature-provider

[![npm version](https://badge.fury.io/js/node-eosjs-signature-provider.svg)](https://www.npmjs.com/package/node-eosjs-signature-provider)

EosJS signature provider implementation that uses fc 
library to sign transactions via node cpp modules feature.

### How to use?
First, you need to install library via npm or yarn
```bash
npm install --save node-eos-signature-provider
```

Than, you can use it like here:

```typescript
import {Api, JsonRpc} from "eosjs";
import fetch from "node-fetch";
import * as encoding from "text-encoding";

import NodeEosSignatureProvider from "node-eosjs-signature-provider";


const rpc = new JsonRpc("http://your-url:8888", {fetch});
const signatureProvider = new NodeEosSignatureProvider(
            [
                "first p-key",
                "second p-key"
            ]
        );

const api = new Api({
                        rpc: rpc,
                        signatureProvider: signatureProvider,
                        textDecoder: new encoding.TextDecoder(),
                        textEncoder: new encoding.TextEncoder(),
                    });

api.transact(...);
```

