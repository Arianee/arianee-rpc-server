import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {RPCNAME} from "../rpc-name";
import {readCertificate} from "../../helpers/readCertificate";
import {ReadConfiguration} from "../models/readConfiguration";
import {ArianeeApiClient} from "@arianee/arianee-api-client";
import {calculateImprint} from "../../helpers/calculateImprint";

const arianeeApiClient = new ArianeeApiClient();


const updateRPCFactory = (configuration: ReadConfiguration) => {

    const {createItem, network, createWithoutValidationOnBC} = configuration;

    const create = async (data: CertificatePayloadCreate, callback: SyncFunc) => {
        const {certificateId, json} = data;

        const [successCallBack, successCallBackWithoutValidation] = callBackFactory(callback)(
            [
                () => createItem(certificateId, json),
                () => createWithoutValidationOnBC(certificateId, json)
            ]);


        try {
            const response = await arianeeApiClient.network.getNft(
                network,
                certificateId
            ).catch(() => undefined);

            if (!response) {
                return successCallBackWithoutValidation();
            }

            const {imprint} = response;
            const calculatedImprint = calculateImprint(json);
            if (calculatedImprint === imprint) {
                return successCallBack();
            } else if (successCallBackWithoutValidation) {
                return successCallBackWithoutValidation();
            }

            return callback(getError(ErrorEnum.MAINERROR));
        } catch (e) {
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


export {updateRPCFactory};
