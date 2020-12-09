import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import {Arianee} from "@arianee/arianeejs/dist/src";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {RPCNAME} from "../rpc-name";
import {readCertificate} from "../../helpers/readCertificate";


const updateRPCFactory = (configuration: { fetchItem, createItem, network, createWithoutValidationOnBC? }) => {

  const {createItem, network, createWithoutValidationOnBC} = configuration;

  const create = async (data:CertificatePayloadCreate, callback:SyncFunc) => {
    const { certificateId, json } = data;

    const [successCallBack, successCallBackWithoutValidation] = callBackFactory(callback)(
      [
        () => createItem(certificateId, json),
        () => createWithoutValidationOnBC(certificateId, json)
      ]);

    const arianee = await new Arianee().init(network);
    const tempWallet = arianee.readOnlyWallet();

    try{
      const update = await tempWallet.contracts.updateSmartAssetContract.methods.getUpdate(certificateId).call();

      if(!update[0]){
        return successCallBackWithoutValidation();
      }

      const hash = await tempWallet.utils.calculateImprint(json)
      if(hash === update[1]){
        return successCallBack();
      } else if (successCallBackWithoutValidation) {
        return successCallBackWithoutValidation();
      }

      return callback(getError(ErrorEnum.MAINERROR));
    }
    catch(e){
      return callback(getError(ErrorEnum.NOCERTIFICATE));
    }

  }

  /**
   * Read a certificate in database
   * @param data
   * @param callback
   */
  const read = async (data: CertificatePayload, callback: SyncFunc) => {
    return readCertificate(data, callback, configuration);
  };

  return {
    [RPCNAME.update.create]: create,
    [RPCNAME.update.read]: read
  };


}


export { updateRPCFactory };
