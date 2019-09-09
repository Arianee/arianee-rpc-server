const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
var bodyParser = require("body-parser");
import { RPCNAME } from "../rpc/rpc-name";
import { arianeeRpcServer } from "./aaa-main-instanciation";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use("/rpc", (req, res, next) => arianeeRpcServer(req, res, next));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));






// MAKE CALL
const makeCall = () => {
  axios({
    url: "http://localhost:3000/rpc",
    method: "post",
    data: {
      jsonrpc: "2.0",
      method: RPCNAME.certificate.read,
      params:  {
        jsonrpc: "2.0",
        method: "certificate.read",
        params: {
          tokenId: 12453,
          authentification:{
              hash:'hashing',
              signature:'signature'
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

makeCall();
