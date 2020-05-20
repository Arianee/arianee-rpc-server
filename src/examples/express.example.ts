const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
console.log("port",port)
var bodyParser = require("body-parser");
import {SessionDBRPC} from "./sessionDB";

const arianeeRpcServer = SessionDBRPC();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/rpc", (req, res, next) => arianeeRpcServer(req, res, next));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));