import {RPCNAME} from "../rpc-name";
import axios from 'axios';
import {EventPayload, EventPayloadCreate} from "../models/events";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";
import {ArianeeApiClient} from "@arianee/arianee-api-client";
import {calculateImprint} from "../../helpers/calculateImprint";
import {ethers} from "ethers";

const arianeeApiClient = new ArianeeApiClient();


const eventRPCFactory = (configuration: ReadConfiguration) => {

    const {fetchItem, createItem, network, createWithoutValidationOnBC} = configuration;

    const create = async (data: EventPayloadCreate, callback) => {

        const [successCallBack, successCallbackWithoutValidation] = callBackFactory(callback)([
            () => createItem(eventId, json),
            () => createWithoutValidationOnBC(eventId, json),
        ]);

        const {eventId, json} = data;


        // To be changed as it is by token id not by event id
        const response = await arianeeApiClient.network.getNftArianeeEvents(
            configuration.network,
            'certificateId'
        ).catch(d => undefined);

           if (response === undefined && createWithoutValidationOnBC) {
            return successCallbackWithoutValidation()
        } else {

            try {
                // to be changed as it should not be an array
                const {imprint}= response[0];
                const calculatedImprint=await calculateImprint(json);
                if (imprint === calculatedImprint) {
                    return successCallBack();
                } else {
                    return callback(getError(ErrorEnum.MAINERROR));

                }
            } catch (err) {
                return callback(getError(ErrorEnum.MAINERROR));
            }
        }
    };

    const read = async (data: EventPayload, callback) => {
        const successCallBack = async () => {
            try {
                const content = await fetchItem(eventId);
                return callback(null, content);
            } catch (err) {
                return callback(getError(ErrorEnum.MAINERROR));

            }
        };


        const {certificateId, authentification, eventId} = data;
        const {message, signature, bearer} = authentification;

        const {issuer, owner, requestKey, viewKey, proofKey} = await arianeeApiClient.network.getNft(
            network,
            certificateId
        );

        if (bearer) {

            let payload;
            try {
                payload = ArianeeAccessToken.decodeJwt(bearer).payload;   // decode test that aat is valid and throw if not
            } catch (e) {
                return callback(getError(ErrorEnum.WRONGJWT));
            }

            if (payload.subId === certificateId && (payload.iss === owner || payload.iss === issuer)) {
                return successCallBack();
            } else if (payload.sub === 'wallet' && (payload.iss === owner || payload.iss === issuer)) {
                return successCallBack();
            } else {
                return callback(getError(ErrorEnum.WRONGJWT));
            }
        }

        if (message && signature) {
            const publicAddressOfSender = ethers.verifyMessage(message, signature);


            const parsedMessage = JSON.parse(message);

            if (parsedMessage.certificateId !== certificateId) {
                return callback(getError(ErrorEnum.MAINERROR));

            }

            const isSignatureTooOld =
                (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
                300;

            if (isSignatureTooOld) {
                return callback(getError(ErrorEnum.MAINERROR));

            }

            // Is the event exist
            try {
                await tempWallet.contracts.eventContract.methods.getEvent(eventId).call();
            } catch (err) {
                return callback(getError(ErrorEnum.MAINERROR));
            }

            // Is user the owner of this certificate

            if (owner === publicAddressOfSender) {
                return successCallBack();
            }

            // Is user the issuer of this certificate

            if (issuer === publicAddressOfSender) {
                return successCallBack();
            }

            const lowercasedKeys = [requestKey, viewKey, proofKey].map((k) => (k ?? '').toLowerCase());
            if (lowercasedKeys.includes(publicAddressOfSender.toLowerCase())) {
                return successCallBack();
            }
        }

        return callback(getError(ErrorEnum.MAINERROR));

    };

    return {
        [RPCNAME.event.create]: create,
        [RPCNAME.event.read]: read
    };
};

export {eventRPCFactory};
