import { ArianeeRPCCustom } from "../arianeeRPCServer";
const axios = require("axios");

const arianeeRpcServer = new ArianeeRPCCustom()
  // with simple Promise
  .setFetchCertificateContent(() =>
    Promise.resolve({ id: "ezd", certificate: "zefz" })
  )

  .build();

  export {arianeeRpcServer}