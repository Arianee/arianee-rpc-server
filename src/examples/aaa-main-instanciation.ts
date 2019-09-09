import { ArianeeRPCCustom } from "../arianeeRPCServer";
const axios = require("axios");

const arianeeRpcServer = new ArianeeRPCCustom()
  // with simple Promise
  .setFetchCertificateContent(() =>
    Promise.resolve({ id: "ezd", certificate: "zefz" })
  )
  // with fetch with http call
  .setFetchCertificateContent(()=>{
    return axios('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.data)
  })
  .build();

  export {arianeeRpcServer}