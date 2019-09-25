"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
var bodyParser = require("body-parser");
const rpc_name_1 = require("../rpc/rpc-name");
const aaa_main_instanciation_1 = require("./aaa-main-instanciation");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// https://www.vacheron.com/certificate/12334.json
//  https://www.vacheron.com/rpc
app.use("/rpc", (req, res, next) => aaa_main_instanciation_1.arianeeRpcServer(req, res, next));
app.use("/*.json", (req, res, next) => {
    console.log('reqqquest');
    return aaa_main_instanciation_1.arianeeRpcServer(req, res, next);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
// MAKE CALL
const makeCall = () => {
    axios({
        url: "http://localhost:3000/rpregerc",
        method: "post",
        data: {
            jsonrpc: "2.0",
            method: rpc_name_1.RPCNAME.certificate.read,
            params: {
                jsonrpc: "2.0",
                method: "certificate.read",
                params: {
                    tokenId: 12453,
                    authentification: {
                        hash: "hashing",
                        signature: "signature"
                    }
                },
                id: 3
            },
            id: 1
        },
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
        console.log(response.data);
    })
        .catch(error => {
        console.log(error);
    });
};
//# sourceMappingURL=express.js.map