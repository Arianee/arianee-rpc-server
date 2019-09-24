import { RPCNAME } from "../rpc-name";
import { isObjectMatchingModel } from "isobjectmatchingmodel";
import { MAINERROR } from "../errors/error";
import { Arianee } from "@arianee/arianeejs";
import { Aria } from "@arianee/ts-contracts";

/*
{ tokenId: 3838065,
    eventId:333,
    authentification:
     { hash:
        '0xd5a77c8b8e828fb7669f67f726d813f1686b403a6bfc45a3cf7ca670961c9cf6',
       signature:
        '0x7fa947e468575a779ef02f9654a664b22c2571553571594417d8d8282b2c22047ee63781f33078b17b6da7dcb3f7c983a3f58913b2d2aa3edf209845991109201b',
       message: '{"tokenId":3838065,"timestamp":"2019-09-13T10:56:59.264Z"}' } }
*/
interface Payload {
  tokenId: number;
  eventId: number;
  authentification: {
    hash: string;
    signature: string;
    message: any;
  };
}

Arianee();
const eventRPCFactory = (fetchItem) => {
  const create = (data: Payload, callback) => {

    callback(null, data);
  };

  const read = async (data:Payload, callback) => {
    const successCallBack = async () => {
      try {
        const content = await fetchItem(tokenId);
        return callback(null, content);
      } catch (err) {
        return callback(MAINERROR);
      }
    };

    const tempWallet = Arianee().fromRandomKey();

    const { tokenId, authentification, eventId } = data;
    const { message, signature } = authentification;

    const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(
      message,
      signature
    );

    const parsedMessage = JSON.parse(message);

    if (parsedMessage.tokenId !== tokenId) {
      return callback(MAINERROR);
    }

    const isSignatureTooOld =
      (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
      300;

    if (isSignatureTooOld) {
      return callback(MAINERROR);
    }

    // Is user the owner of this certificate
    const owner = await tempWallet.smartAssetContract.methods
      .ownerOf(tokenId)
      .call();

    try {
      await tempWallet.eventContract.methods.events(eventId).call();
    } catch (err) {
      return callback(MAINERROR);
    }

    if (owner === publicAddressOfSender) {
      return successCallBack();
    }

    // Is the user provide a token acces
    for (let tokenType = 0; tokenType < 4; tokenType++) {
      const data = await tempWallet.smartAssetContract.methods
        .tokenHashedAccess(tokenId, tokenType)
        .call();

      if (publicAddressOfSender === data) {
        return successCallBack();
      }
    }

    return callback(MAINERROR);
  };

  return {
    [RPCNAME.event.create]: create,
    [RPCNAME.event.read]: read
  };
};

export { eventRPCFactory };
