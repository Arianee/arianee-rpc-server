import { ArianeeRPCCustom } from "../arianeeRPCServer";
const axios = require("axios");

const arianeeRpcServer = new ArianeeRPCCustom()
  .setFetchCertificateContent(() => {
    return axios("https://jsonplaceholder.typicode.com/todos/1").then(
      response => response.data
    );
  })
  // with simple Promise
  .setFetchCertificateContent(tokenId => {
    if (tokenId === 9875232) {
      return Promise.resolve({
        myTokenId: tokenId,
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
        socialmedia: {
          instagram: "arianee_project",
          twitter: "ArianeeProject"
        },
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
    } else {
      //  throw new Error('')
      return Promise.reject();
    }
  })


    .setFetchEventContent(()=>{
        console.log('fetch event');
    },()=>{
      console.log('create event');
    })
  // with fetch with http call

  .build();

export { arianeeRpcServer };
