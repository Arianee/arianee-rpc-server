import {RPCNAME} from "../rpc-name";
import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {readCertificate} from "../../helpers/readCertificate";
import {calculateImprint} from "../../helpers/calculateImprint";
import {ArianeeProtocolClient, callWrapper} from "@arianee/arianee-protocol-client"
import Core from "@arianee/core";

const certificateRPCFactory = (configuration:ReadConfiguration) => {

  const { createItem, createWithoutValidationOnBC} = configuration;
  const core = Core.fromRandom();
  const arianeeProtocolClient = new ArianeeProtocolClient(core)
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

    const isTokenIdExist = await callWrapper(
        arianeeProtocolClient,
        configuration.network,
        {
          protocolV1Action: async (protocolV1) => {
            try{
              await protocolV1.smartAssetContract.ownerOf(certificateId);
              return true;
            }
            catch (e) {
              return false;
            }
          },
          protocolV2Action: async (protocolV2) => {
            throw new Error('not yet implemented');
          },
        }
    )

    const imprint = await callWrapper(
        arianeeProtocolClient,
        configuration.network,
        {
          protocolV1Action: async (protocolV1) => protocolV1.smartAssetContract.tokenImprint(certificateId),
          protocolV2Action: async (protocolV2) => {
            throw new Error('not yet implemented');
          },
        }
    )


    const createCertificateIfTokenIdExist = async () => {
      try {
          // case of reserved token
          if (imprint === '0x0000000000000000000000000000000000000000000000000000000000000000'
              && createWithoutValidationOnBC) {
            return successCallBackWithoutValidation();
          }

        const imprintCalculated= await calculateImprint(json);
        if (imprintCalculated === imprint) {
            return successCallBack();
        } else {
            return callback(getError(ErrorEnum.WRONGIMPRINT));
        }
      } catch (e) {
        return callback(getError(ErrorEnum.WRONGIMPRINT));
      }

    }

    if (!isTokenIdExist && createWithoutValidationOnBC) {
      return successCallBackWithoutValidation()
    } else{
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
