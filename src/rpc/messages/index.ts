import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import axios from 'axios';
import {MessagePayload, MessagePayloadCreate} from "../models/messages";
import {ErrorEnum, getError} from "../errors/error";
import {callBackFactory} from "../libs/callBackFactory";


const messageRPCFactory = (configuration: { fetchItem, createItem, network, createWithoutValidationOnBC? }) => {

    const {fetchItem, createItem, network, createWithoutValidationOnBC} = configuration;

    const create = async (data: MessagePayloadCreate, callback) => {

        const [successCallBack, sucessCallBackWithoutValidationOnBC] = callBackFactory(callback)([
            () => createItem(messageId, json),
            () => createWithoutValidationOnBC(messageId, json),

        ]);

        const {messageId, json} = data;

        const arianee = await new Arianee().init(network);
        const tempWallet = arianee.fromRandomKey();

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

        const arianee = await new Arianee().init(network);
        const tempWallet = arianee.fromRandomKey();

        const { authentification, messageId } = data;
        const { message, signature } = authentification;

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
