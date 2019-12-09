import { RPCNAME } from "../rpc-name";
import { isObjectMatchingModel } from "isobjectmatchingmodel";
import { MAINERROR } from "../errors/error";
import { Arianee } from "@arianee/arianeejs";


const certificateRPCFactory = (fetchItem, network) => {
  const create = (data, callback) => {
    callback(null, data);
  };

  /*
 { certificateId: 3838065,
  authentification:
   { hash:
      '0xd5a77c8b8e828fb7669f67f726d813f1686b403a6bfc45a3cf7ca670961c9cf6',
     signature:
      '0x7fa947e468575a779ef02f9654a664b22c2571553571594417d8d8282b2c22047ee63781f33078b17b6da7dcb3f7c983a3f58913b2d2aa3edf209845991109201b',
     message: '{"certificateId":3838065,"timestamp":"2019-09-13T10:56:59.264Z"}' } }

*/

  const read = async (data, callback) => {
    const successCallBack = async () => {
      try {
        const content = await fetchItem(certificateId);
        return callback(null, content);
      } catch (err) {
        return callback(MAINERROR);
      }
    };

    const arianee = await new Arianee().connectToProtocol(network);
    const tempWallet = arianee.fromRandomKey();

    const { certificateId, authentification } = data;
    const { message, signature } = authentification;

    const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(
      message,
      signature
    );

    const parsedMessage = JSON.parse(message);

    if (parsedMessage.certificateId !== certificateId) {
      return callback(MAINERROR);
    }

    const isSignatureTooOld =
      (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
      300;

    if (isSignatureTooOld) {
      return callback(MAINERROR);
    }

    // Is user the owner of this certificate
    const owner = await tempWallet.contracts.smartAssetContract.methods
      .ownerOf(certificateId)
      .call();

    if (owner === publicAddressOfSender) {
      return successCallBack();
    }

    // Is the user provide a token acces
    for (let tokenType = 0; tokenType < 4; tokenType++) {
      const data = await tempWallet.contracts.smartAssetContract.methods
        .tokenHashedAccess(certificateId, tokenType)
        .call();

      if (publicAddressOfSender === data) {
        return successCallBack();
      }
    }

    return callback(MAINERROR);
  };

  const HELLOWORLD = function(args, callback) {
    const neededArguments = {
      a: "",
      b: ""
    };

    console.assert(
      isObjectMatchingModel(neededArguments, args),
      "wrong paramters"
    );

    const { a, b } = args;
    callback(null, a + b);
  };

  return {
    [RPCNAME.certificate.create]: create,
    [RPCNAME.certificate.read]: read,
    add: HELLOWORLD
  };
};

export { certificateRPCFactory };
