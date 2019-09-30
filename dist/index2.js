"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JRPC = require("jrpc");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const axios = require("axios");
const makeCall = () => {
    axios({
        url: "http://localhost:3000",
        method: "post",
        data: {
            jsonrpc: "2.0",
            method: "subtract",
            params: [42, 23],
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
var bodyParser = require("body-parser");
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
}));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type,Authorization, Accept");
    res.header("method", "post");
    next();
});
const myRPC = {
    subtract: (a, b) => a - b
};
app.get("/", (req, res) => res.send({ hello: "world" }));
app.post("/", (req, res) => {
    //https://www.jsonrpc.org/specification
    const { body } = req;
    const { method, params, id } = body;
    if (myRPC.hasOwnProperty(body.method)) {
        const result = myRPC[method](...params);
        res.send({ jsonrpc: "2.0", result: result, id: id });
        return;
    }
    res.send({
        jsonrpc: "2.0",
        error: { code: -32601, message: "Method not found" },
        id: id
    });
});
app.listen(port, () => {
    console.log("server started on port", port);
    // makeCall();
});
const rpc = new JRPC({ remoteTimeout: 10 });
rpc.expose("foo", function (params, next) {
    console.log("fooo called");
    return next(false);
});
rpc.call("foo", {}, function (err, result) {
    if (err) {
        console.log(err);
        // Something went wrong...
    }
    else {
        console.log('success');
        // 'result' was returned by the other end's exposed 'foo()'
    }
});
//# sourceMappingURL=index2.js.map