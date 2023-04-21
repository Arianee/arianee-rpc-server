import {RPCNAME} from "../rpc-name";
import axios from 'axios';
import {MessagePayload, MessagePayloadCreate} from "../models/messages";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";
import {ReadConfiguration} from "../models/readConfiguration";
import {ContractName} from "@arianee/arianeejs/dist/src/core/wallet/services/contractService/contractsService";


const messageRPCFactory = (configuration: ReadConfiguration) => {

    const {fetchItem, createItem, arianeeWallet, createWithoutValidationOnBC} = configuration;

    const create = async (data: MessagePayloadCreate, callback) => {

        const [successCallBack, sucessCallBackWithoutValidationOnBC] = callBackFactory(callback)([
            () => createItem(messageId, json),
            () => createWithoutValidationOnBC(messageId, json),

        ]);

        const {messageId, json} = data;

        const tempWallet =await arianeeWallet;

        const message = await tempWallet.contracts.messageContract.methods.messages(messageId)
            .call()
            .catch(d => undefined);

        if (message.imprint === '0x0000000000000000000000000000000000000000000000000000000000000000' && createWithoutValidationOnBC) {
            return sucessCallBackWithoutValidationOnBC()
        } else {
            try {
                axios.get(json.$schema)
                    .then(async (response) => {
                        const schema = response.data;
                        const imprint = await tempWallet.utils.cert(schema, json);
                        if (message[0] === imprint) {
                            return successCallBack();
                        } else {
                            return callback(getError(ErrorEnum.WRONGIMPRINT));
                        }
                    });
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

        const tempWallet =await arianeeWallet;

        const { authentification, messageId } = data;
        const { message, signature, bearer } = authentification;

        const messageBc = await tempWallet.contracts[ContractName.messageContract].methods
            .messages(messageId)
            .call();

        if (bearer) {
            const isJWTValid = await tempWallet.methods.isArianeeAccessTokenValid(bearer);
            const {payload} = await tempWallet.methods.decodeArianeeAccessToken(bearer);
            if (isJWTValid && payload.subId === messageBc.to && payload.iss === messageBc.to) {
                return successCallBack();
            }
            else if(isJWTValid && payload.sub === 'wallet' && payload.iss === messageBc.to){
                return successCallBack();
            }
            else {
                return callback(getError(ErrorEnum.WRONGJWT));
            }
        }

        const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(
            message,
            signature
        );

        const parsedMessage = JSON.parse(message);
        const isSignatureTooOld =
            (new Date().getTime() - new Date(parsedMessage.timestamp).getTime()) / 1000 >
            300;

        if (isSignatureTooOld) {
            return callback(getError(ErrorEnum.MAINERROR));
        }

        // Is the message exist
        try {
            const arianeeMessage = await tempWallet.contracts.messageContract.methods.messages(messageId).call();

            if (arianeeMessage.to !== publicAddressOfSender && arianeeMessage.sender !== publicAddressOfSender) {
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

export { messageRPCFactory };
