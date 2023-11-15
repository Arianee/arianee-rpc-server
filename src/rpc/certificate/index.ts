import {RPCNAME} from "../rpc-name";
import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import axios from 'axios';
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {readCertificate} from "../../helpers/readCertificate";
import {ArianeeApiClient} from "@arianee/arianee-api-client";
import {calculateImprint} from "../../helpers/calculateImprint";


const certificateRPCFactory = (configuration:ReadConfiguration) => {

  const {fetchItem, createItem, createWithoutValidationOnBC} = configuration;
  const arianeeApiClient = new ArianeeApiClient();


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


    const response = await arianeeApiClient.network.getNft(
        configuration.network,
        certificateId
    ).catch(() => undefined);

    const isTokenIdExist=!!response;


    const createCertificateIfTokenIdExist = async () => {
      const   {issuer, imprint, owner, requestKey, viewKey, proofKey} = response;
let imprintCalculated;
      try {

        // case of reseved token
        if (imprint === '0x0000000000000000000000000000000000000000000000000000000000000000'
            && createWithoutValidationOnBC) {
          return successCallBackWithoutValidation();
        }

        imprintCalculated= await calculateImprint(json);
      } catch (e) {
        return callback(getError(ErrorEnum.WRONGIMPRINT));
      }



      if (imprintCalculated() === imprint) {
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
