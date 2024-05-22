import {CertificatePayload, CertificatePayloadCreate} from "../models/certificates";
import {SyncFunc} from "../models/func";
import { getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {RPCNAME} from "../rpc-name";
import {readCertificate} from "../../helpers/readCertificate";
import {ReadConfiguration} from "../models/readConfiguration";
import {calculateImprint} from "../../helpers/calculateImprint";
import Core from "@arianee/core";
import {ArianeeProtocolClient, callWrapper} from "@arianee/arianee-protocol-client";
import { PrivacyGatewayErrorEnum } from "@arianee/common-types";

const updateRPCFactory = (configuration: ReadConfiguration) => {

    const {createItem, network, createWithoutValidationOnBC} = configuration;
    const core = Core.fromRandom();
    const arianeeProtocolClient = new ArianeeProtocolClient(core)
    const create = async (data: CertificatePayloadCreate, callback: SyncFunc) => {
        const {certificateId, json} = data;

        const [successCallBack, successCallBackWithoutValidation] = callBackFactory(callback)(
            [
                () => createItem(certificateId, json),
                () => createWithoutValidationOnBC(certificateId, json)
            ]);


        try {
            const update = await callWrapper(arianeeProtocolClient, configuration.network, {
                protocolV1Action: async (protocolV1) =>
                    protocolV1.updateSmartAssetContract.getUpdate(certificateId)
                        .catch(() => undefined),
                protocolV2Action: async (protocolV2) => {
                    throw new Error('not yet implemented');
                },
            });

            if (!update || !update[0]) {
                return successCallBackWithoutValidation();
            }

            const imprint = update[1];
            const calculatedImprint = calculateImprint(json);
            if (calculatedImprint === imprint) {
                return successCallBack();
            } else if (successCallBackWithoutValidation) {
                return successCallBackWithoutValidation();
            }

            return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
        } catch (e) {
            return callback(getError(PrivacyGatewayErrorEnum.NOCERTIFICATE));
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
