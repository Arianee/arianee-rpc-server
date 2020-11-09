import {CertificatePayload} from "../rpc/models/certificates";
import {SyncFunc} from "../rpc/models/func";
import {ErrorEnum, getError} from "../rpc/errors/error";
import {Arianee} from "@arianee/arianeejs/dist/src";
import {ReadConfiguration} from "../rpc/models/readConfiguration";


export const readCertificate = async (data: CertificatePayload, callback: SyncFunc, configuration: ReadConfiguration) => {
  const {fetchItem, network} = configuration;

  const successCallBack = async () => {
    try {
      const content = await fetchItem(certificateId);
      return callback(null, content);
    } catch (err) {
      return callback(getError(ErrorEnum.MAINERROR));
    }
  };

  const arianee = await new Arianee().init(network);
  const tempWallet = arianee.fromRandomKey();

  const {certificateId, authentification} = data;
  const {message, signature, bearer} = authentification;

  if (bearer) {
    const isJWTValid = await tempWallet.methods.isCertificateArianeeAccessTokenValid(bearer);
    const {payload} = await tempWallet.methods.decodeArianeeAccessToken(bearer);
    if (isJWTValid && (payload.subId === certificateId)) {
      return successCallBack();
    } else {
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
  }
  return callback(getError(ErrorEnum.MAINERROR));
};
