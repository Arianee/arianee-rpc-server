import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import axios from 'axios';
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {readCertificate} from "../../helpers/readCertificate";


const certificateRPCFactory = (configuration:ReadConfiguration) => {

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

        // case of reseved token
        if (tokenImprint === '0x0000000000000000000000000000000000000000000000000000000000000000'
            && createWithoutValidationOnBC) {
          return successCallBackWithoutValidation();
        }

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
   return readCertificate(data, callback, configuration);
  };


  return {
    [RPCNAME.certificate.create]: create,
    [RPCNAME.certificate.read]: read
  };
};

export { certificateRPCFactory };
