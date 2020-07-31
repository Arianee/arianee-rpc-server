import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import axios from 'axios';
import {EventPayload, EventPayloadCreate} from "../models/events";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";


const eventRPCFactory = (configuration: { fetchItem, createItem, network, createWithoutValidationOnBC? }) => {

    const {fetchItem, createItem, network, createWithoutValidationOnBC} = configuration;


    const createItemOnce=async (id,json)=>{
        const arianeeEvent = await fetchItem(id);
        if(arianeeEvent===undefined){
            return createItem(id, json);
        }else{
            throw new Error('Content already stored')
        }
    }

    const createWithoutValidationOnBCOnce=async (id,json)=>{
        const arianeeEvent = await fetchItem(id);
        if(arianeeEvent===undefined){
            return createWithoutValidationOnBC(id, json);
        }else{
            throw new Error('Content already stored')
        }
    };

    const create = async (data: EventPayloadCreate, callback) => {

        const [successCallBack, successCallbackWithoutValidation] = callBackFactory(callback)([
            () => createItemOnce(eventId, json),
            () => createWithoutValidationOnBCOnce(eventId, json),
        ]);

        const { eventId, json} = data;

        const arianee = await new Arianee().init(network);
        const tempWallet = arianee.fromRandomKey();
        const event = await tempWallet.contracts.eventContract.methods.getEvent(eventId).call()
            .catch(() => undefined);

        if (event === undefined && createWithoutValidationOnBC) {
            return successCallbackWithoutValidation()
        } else {

            try {
                const event = await tempWallet.contracts.eventContract.methods.getEvent(eventId).call();
                axios.get(json.$schema)
                    .then(async (response) => {
                        const schema = response.data;
                        const imprint = await tempWallet.utils.cert(schema, json);
                        if (event[1] === imprint) {
                            return successCallBack();
                        } else {
                            return callback(getError(ErrorEnum.MAINERROR));

                        }
                    });
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

        const arianee = await new Arianee().init(network);
        const tempWallet = arianee.fromRandomKey();

        const {certificateId, authentification, eventId} = data;
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
            const owner = await tempWallet.contracts.smartAssetContract.methods
                .ownerOf(certificateId)
                .call();

            if (owner === publicAddressOfSender) {
                return successCallBack();
            }

            // Is the user provide a token access
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
        [RPCNAME.event.create]: create,
        [RPCNAME.event.read]: read
    };
};

export { eventRPCFactory };
