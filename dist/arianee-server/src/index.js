"use strict";
const src_1 = require("../../arianeeJS/src");
const jayson = require("jayson");
const axios = require("axios");
src_1.Arianee().fromPrivateKey('');
class MyClass {
    constructor() {
        this.add = ([a, b], callback) => {
            callback(null, a + b);
        };
    }
}
const n = new MyClass();
const server = new jayson.Server({
    add: function ([a, b], callback) {
        if (typeof a === 'number' && typeof b === 'number') {
            callback(null, a + b);
        }
        else {
            callback(this.error(-32602));
        }
    }
});
server.http().listen(3000);
const makeCall = () => {
    axios({
        url: "http://localhost:3000",
        method: "post",
        data: [
            {
                jsonrpc: "2.0",
                method: "add",
                params: [42, 23],
                id: 1
            },
            {
                jsonrpc: "2.0",
                method: "add",
                params: [42, 55],
                id: 2
            }
        ],
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
        console.log('response');
        console.log(response.data);
    })
        .catch(error => {
        console.log(error);
    });
};
makeCall();
//# sourceMappingURL=index.js.map