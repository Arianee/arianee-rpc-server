
// CERTIFICATE
const readCertificate = {
  jsonrpc: "2.0",
  method: "certificate.read",
  params: {
    tokenId: "id du certificat",
    authentification:{
        hash:'hashing', //
        signature:'signature'
    } 
  },
  id: 3
};

// SERVICE
const readService = {
  jsonrpc: "2.0",
  method: "service.read",
  params: {
    tokenId: "id du certificat",
    serviceId:"service id",
    authentification:{
        hash:'hashing',
        signature:'signature'
    } 
  },
  id: 3
};


const createService = {
  jsonrpc: "2.0",
  method: "service.read",
  params: {
    tokenId: "id du certificat",
    serviceId:"service id",
    content:{
      //contenu du json
    },
    authentification:{
        hash:'hashing',
        signature:'signature'
    } 
  },
  id: 3
};


// MESSAGE (à confirmer)

const createMessage = {
  jsonrpc: "2.0",
  method: "service.read",
  params: {
    tokenId: "id du certificat",
    messageId:"message id",
    content:{
      //contenu du json
    },
    authentification:{
        hash:'hashing',
        signature:'signature'
    } 
  },
  id: 3
};



/*
ACTION POSSIBLES

certificate.read

service.create
service.read

message.create
message.read


lecture / création / modification 

lecture de certificat
creation de service
lecture de service
creation de message
lecture de message

*/
// MESSAGE d'erreur:

const error ={"jsonrpc": "2.0", "error": {
  "code": 41,
  "message": "This server cannot answer your question"
}, 
"id": "1"
}


const listOfError= {
  0:'token does not exist',
  1: {
    code:1,
    message:'unauthorized'
  }
}

// RETOUR
const result ={"jsonrpc": "2.0", "result":{
  content:'pure certificate as it is',

}, "id": 4}

