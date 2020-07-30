import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import axios from 'axios';
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";


const certificateRPCFactory = (configuration: { fetchItem, createItem, network, createWithoutValidationOnBC? }) => {

  const {fetchItem, createItem, network, createWithoutValidationOnBC} = configuration;


  /**
   * Create a certificate content in database
   * @param data
   * @param callback
   */
  const create = async (data:CertificatePayloadCreate, callback:SyncFunc) => {
    const { certificateId, json } = data;

    const [successCallBack, successCallBackWithoutValidation] = callBackFactory(callback)(
        [
          () => createItem(certificateId, json),
          () => createWithoutValidationOnBC(certificateId, json)
        ]);

    const arianee = await new Arianee().init(network);
    const tempWallet = arianee.fromRandomKey();

    let tokenImprint,res;
    const isTokenIdExist: boolean = await tempWallet
        .contracts
        .smartAssetContract
        .methods
        .ownerOf(certificateId.toString())
        .call()
        .then(() => true)
        .catch(() => false);

    const createCertificateIfTokenIdExist = async () => {
      try {
        tokenImprint = await tempWallet.contracts.smartAssetContract.methods
            .tokenImprint(certificateId.toString())
            .call();

        res = await axios(
            json.$schema
        );
      } catch (e) {
        return callback(getError(ErrorEnum.WRONGIMPRINT));
      }

      const certificateSchema = res.data;

      const hash = await tempWallet.utils.cert(
          certificateSchema,
          json
      );

      if (hash === tokenImprint) {
        return successCallBack();
      } else {
        return callback(getError(ErrorEnum.WRONGIMPRINT));
      }
    }

    if (!isTokenIdExist && createWithoutValidationOnBC) {
      return successCallBackWithoutValidation()
    }else{
      return createCertificateIfTokenIdExist()

    }

  };


  /**
   * Read a certificate in database
   * @param data
   * @param callback
   */
  const read = async (data: CertificatePayload, callback: SyncFunc) => {
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
      const isJWTValid = await tempWallet.methods.isCertificateArianeeProofTokenValid(bearer);
      const {payload} = await tempWallet.methods.decodeArianeeProofToken(bearer);
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


  return {
    [RPCNAME.certificate.create]: create,
    [RPCNAME.certificate.read]: read
  };
};

export { certificateRPCFactory };
