import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import axios from 'axios';
import {ErrorEnum, getError} from "../errors/error";

const certificateRPCFactory = (fetchItem,createItem, network) => {

  /**
   * Create a certificate content in database
   * @param data
   * @param callback
   */
  const create = async (data:CertificatePayloadCreate, callback:SyncFunc) => {
    const { certificateId, json } = data;

    const successCallBack = async () => {
      try {
        const content = await createItem(certificateId,json);
        return callback(null, content);
      } catch (err) {
        return callback(getError(ErrorEnum.CALLBACKIMPLEMENTATION));
      }
    };



    const arianee = await new Arianee().init(network);
    const tempWallet = arianee.fromRandomKey();

    let tokenImprint,res;
    try{

    tokenImprint = await tempWallet.contracts.smartAssetContract.methods
        .tokenImprint(certificateId.toString())
        .call();

    res = await axios(
        json.$schema
    );
    }catch(e){
      return callback(getError(ErrorEnum.SIGNATURETOOOLD));
    }

    const certificateSchema=res.data;

    const hash = await tempWallet.utils.cert(
        certificateSchema,
        json
    );

    if(hash===tokenImprint){
      return successCallBack();
    }else{
      return callback(getError(ErrorEnum.WRONGIMPRINT));
    }

  };


  /**
   * Read a certificate in database
   * @param data
   * @param callback
   */
  const read = async (data:CertificatePayload, callback:SyncFunc) => {
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

    const { certificateId, authentification } = data;
    const { message, signature } = authentification;

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

    return callback(getError(ErrorEnum.MAINERROR));
  };


  return {
    [RPCNAME.certificate.create]: create,
    [RPCNAME.certificate.read]: read
  };
};

export { certificateRPCFactory };
