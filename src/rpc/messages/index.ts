import {RPCNAME} from "../rpc-name";
import axios from 'axios';
import {MessagePayload, MessagePayloadCreate} from "../models/messages";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";
import {ArianeeApiClient} from "@arianee/arianee-api-client";
import {ethers} from "ethers";
import {calculateImprint} from "../../helpers/calculateImprint";

const arianeeApiClient = new ArianeeApiClient();


const messageRPCFactory = (configuration: ReadConfiguration) => {

    const {fetchItem, createItem, network, createWithoutValidationOnBC} = configuration;

    const create = async (data: MessagePayloadCreate, callback) => {

        const [successCallBack, sucessCallBackWithoutValidationOnBC] = callBackFactory(callback)([
            () => createItem(messageId, json),
            () => createWithoutValidationOnBC(messageId, json),

        ]);

        const {messageId, json} = data;

        const response = await arianeeApiClient.network.getMessage(
            configuration.network,
            messageId
        ).catch(d => undefined);


        if (response.imprint === '0x0000000000000000000000000000000000000000000000000000000000000000' && createWithoutValidationOnBC) {
            return sucessCallBackWithoutValidationOnBC()
        } else {
            try {
                const imprint = calculateImprint(json);
                if (response.imprint === imprint) {
                    return successCallBack();
                } else {
                    return callback(getError(ErrorEnum.WRONGIMPRINT));
                }
            } catch (err) {
                return callback(getError(ErrorEnum.WRONGMESSAGEID));
            }
        }
    };

    const read = async (data: MessagePayload, callback) => {
        const successCallBack = async () => {
            try {
                const content = await fetchItem(messageId);
                return callback(null, content);
            } catch (err) {
                return callback(getError(ErrorEnum.MAINERROR));

            }
        };


        const {authentification, messageId} = data;
        const {message, signature, bearer} = authentification;

        const messageBc = await arianeeApiClient.network.getMessage(
            configuration.network,
            messageId
        )


        if (bearer) {
            let payload;
            try {
                payload = ArianeeAccessToken.decodeJwt(bearer).payload;   // decode test that aat is valid and throw if not
            } catch (e) {
                return callback(getError(ErrorEnum.WRONGJWT));
            }
            if (payload.subId === messageBc.receiver && payload.iss === messageBc.receiver) {
                return successCallBack();
            } else if (payload.sub === 'wallet' && payload.iss === messageBc.receiver) {
                return successCallBack();
            } else {
                return callback(getError(ErrorEnum.WRONGJWT));
            }
        }

        const publicAddressOfSender = ethers.verifyMessage(message, signature);


        const parsedMessage = JSON.parse(message);
        const isSignatureTooOld =
            (new Date().getTime() - new Date(parsedMessage.timestamp).getTime()) / 1000 >
            300;

        if (isSignatureTooOld) {
            return callback(getError(ErrorEnum.MAINERROR));
        }

        // Is the message exist
        try {

            const arianeeMessage = await arianeeApiClient.network.getMessage(
                configuration.network,
                messageId
            )
            if (!arianeeMessage && arianeeMessage.receiver !== publicAddressOfSender && arianeeMessage.sender !== publicAddressOfSender) {
                return callback(getError(ErrorEnum.MAINERROR));
            } else {
                return successCallBack();
            }

        } catch (err) {
            return callback(getError(ErrorEnum.MAINERROR));
        }

    };

    return {
        [RPCNAME.message.create]: create,
        [RPCNAME.message.read]: read
    };
};

export {messageRPCFactory};
