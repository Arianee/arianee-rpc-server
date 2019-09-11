const express = require("express");
const app = express();
const port = 3000;
const axios = require("axios");
var bodyParser = require("body-parser");
import { RPCNAME } from "../rpc/rpc-name";

import { arianeeRpcServer } from "./aaa-main-instanciation";

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// https://www.vacheron.com/certificate/12334.json
//  https://www.vacheron.com/rpc

app.use("/rpc", (req, res, next) => arianeeRpcServer(req, res, next));

app.use('/*.json',(req, res, next)=>{
  console.log(req);
  res.send({
    $schema: "https://cert.arianee.org/version1/ArianeeAsset.json",
    name: "Arianee",
    v: "0.1",
    serialnumber: [{ type: "serialnumber", value: "SAMPLE" }],
    brand: "Arianee",
    model: "Token goody",
    description:
      "Here is the digital passport of your Arianee token goody, giving you a glimpse of an augmented ownership experience. This Smart-Asset has a unique ID. It is transferable and enables future groundbreaking features. \n Connect with the arianee team to learn more.",
    type: "SmartAsset",
    picture:
      "https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.12.53-PM.png",
    pictures: [
      {
        src:
          "https://www.arianee.org/wp-content/uploads/2019/02/Screen-Shot-2019-02-27-at-12.14.36-PM.png"
      }
    ],
    socialmedia: { instagram: "arianee_project", twitter: "ArianeeProject" },
    externalContents: [
      {
        title: "About Arianee",
        url: "https://www.arianee.org",
        backgroundColor: "#000",
        color: "#FFF"
      }
    ],
    jsonSurcharger: "url"
  });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));






// MAKE CALL
const makeCall = () => {
  axios({
    url: "http://localhost:3000/rpregerc",
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

