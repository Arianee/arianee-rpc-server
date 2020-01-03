[![Build Status](https://travis-ci.org/Arianee/arianee-server.svg?branch=master)](https://travis-ci.org/Arianee/arianee-server)


### What is it?

``arianee-rpc-server`` is a arianeeRPCServer ready to use with Arianee solution. Authorizations of read and write are already set. You just need to set methods how to read and create events and certificate content.

## How to setup your own rpc server
For quick examples see 
[examples for firebase and express](./src/examples)

### Instanciate with the network
```javascript
import { ArianeeRPCCustom } from "@arianee/arianee-rpc-server";
import {NETWORK} from "@arianee/arianeejs";
const arianeeRPC=new ArianeeRPCCustom(NETWORK.mainnet);
```

### Certificates:

A certificate can be ```create``` or ```read`create```. 
You need to define this 2 methods.

```javascript

const fetchCertificateContent=(certificateId)=>Promise.resolve('hey I am the content');
const createCertificate=(certificateid, content)=>Promise.resolve('hey I have created the content');

arianeeRPC.setFetchCertificateContent(fetchCertificateContent,createCertificate);
```

### Events
An event can be ```create``` or ```read`create```. 
You need to define this 2 methods.

```javascript

const fetchCertificateContent=(certificateId)=>Promise.resolve('hey I am the content');
const createCertificate=(certificateid, content)=>Promise.resolve('hey I have created the content');

arianeeRPC.setFetchEventContent(fetchCertificateContent,createCertificate);
```
### Final step: build
Then if you need to build. It returns a function that can be easily used in an express server

```javascript
const rpcServer = arianeeRPC.build();

app.post("/rpc", (req, res, next) => rpcServer(req, res, next));
// Or shorter
app.post("/rpc",rpcServer);

```


### DEBUG

process.env.DEBUG = true

## Contributing

Your contribution are welcome if they comply to the following requirements:

 1. Commit name should follow this specification [https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary](https://www.conventionalcommits.org/en/v1.0.0-beta.2/#summary)
 2. All tests should be ok
 3. Add value to the product

