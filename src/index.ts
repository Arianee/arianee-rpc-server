import * as jayson from 'jayson';
const axios = require("axios");

const server = new jayson.Server({
    add: function([a,b], callback) {
      callback(null, a + b);
    }
  });
   
  server.http().listen(3000);


const makeCall = () => {
  axios({
    url: "http://localhost:3000",
    method: "post",
    data: {
      jsonrpc: "2.0",
      method: "add",
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

makeCall();
