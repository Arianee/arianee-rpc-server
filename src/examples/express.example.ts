import {NETWORK} from "@arianee/arianeejs";
import {SessionDBRPC} from "./sessionDB";

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
console.log("port",port)
var bodyParser = require("body-parser");

const $arianeeRpcServer = SessionDBRPC(NETWORK.arianeeTestnet);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("World");
});
app.post("/rpc", async (req, res, next) => {
    const arianeeRpcServer = await $arianeeRpcServer;
    return arianeeRpcServer(req, res, next);
});

app.listen(port, () => {
    return console.log(`Example app listening on port ${port}!`);
});

export default app;
