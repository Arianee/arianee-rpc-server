import {CertificatePayload} from "../rpc/models/certificates";
import {SyncFunc} from "../rpc/models/func";
import {ErrorEnum, getError} from "../rpc/errors/error";
import {ReadConfiguration} from "../rpc/models/readConfiguration";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";

export const readCertificate = async (data: CertificatePayload, callback: SyncFunc, configuration: ReadConfiguration) => {
  const {fetchItem, arianeeWallet} = configuration;
  const successCallBack = async () => {
    try {
      const content = await fetchItem(certificateId);
      return callback(null, content);
    } catch (err) {
      return callback(getError(ErrorEnum.MAINERROR));
    }
  };

  const tempWallet = await arianeeWallet

  const {certificateId, authentification} = data;
  const {message, signature, bearer} = authentification;

  // Is user the owner of this certificate
  const owner = await tempWallet.contracts.smartAssetContract.methods
      .ownerOf(certificateId)
      .call();

  const issuer = await tempWallet
      .contracts
      .smartAssetContract
      .methods
      .issuerOf(certificateId)
      .call();

  if (bearer) {
    let payload;
    try{
      payload = ArianeeAccessToken.decodeJwt(bearer).payload;   // decode test that aat is valid and throw if not
    }
    catch (e) {
      return callback(getError(ErrorEnum.WRONGJWT));
    }

    if (payload.subId === +certificateId && (payload.iss === owner || payload.iss === issuer)) {
      return successCallBack();
    }
    else if(payload.sub === 'wallet' && (payload.iss === owner || payload.iss === issuer)){
      return successCallBack();
    }
    else {
      return callback(getError(ErrorEnum.WRONGJWT));
    }
  }

  if (message && signature) {
    const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(
      message,
      signature
    );

    const parsedMessage = JSON.parse(message);

    if (parsedMessage.certificateId !== certificateId) {
      return callback(getError(ErrorEnum.WRONGCERTIFICATEID));
    }

    const isSignatureTooOld =
      (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
      300;

    if (isSignatureTooOld) {
      return callback(getError(ErrorEnum.SIGNATURETOOOLD));
    }


    if (owner === publicAddressOfSender) {
      return successCallBack();
    }



    if (issuer === publicAddressOfSender) {
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
  }
  return callback(getError(ErrorEnum.MAINERROR));
};
