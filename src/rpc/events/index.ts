import {RPCNAME} from "../rpc-name";
import {Arianee} from "@arianee/arianeejs";
import axios from 'axios';
import {EventPayload, EventPayloadCreate} from "../models/events";
import {ErrorEnum, getError} from "../errors/error";


const eventRPCFactory = (fetchItem,createItem, network) => {
    const create = async (data: EventPayloadCreate, callback) => {

        const successCallBack = async (eventId) => {
            try {
                const content = await createItem(eventId, json);
                return callback(null, content);
            } catch (err) {
                return callback(getError(ErrorEnum.MAINERROR));
            }
        };

        const { eventId, json} = data;

      const arianee = await new Arianee().init(network);
      const tempWallet = arianee.fromRandomKey();
        try{
            const event = await tempWallet.contracts.eventContract.methods.getEvent(eventId).call();
            axios.get(json.$schema)
                .then(async (response)=> {
                    const schema = response.data;
                    const imprint = await tempWallet.utils.cert(schema, json);
                    if(event[1] === imprint){
                        return successCallBack(eventId);
                    }
                    else{
                        return callback(getError(ErrorEnum.MAINERROR));

                    }
                });
        }
        catch(err){

            return callback(getError(ErrorEnum.MAINERROR));

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

      const arianee = await new Arianee().connectToProtocol(network);
      const tempWallet = arianee.fromRandomKey();

        const { certificateId, authentification, eventId } = data;
        const { message, signature } = authentification;
        let errorCounter=0;

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
        tempWallet.contracts.smartAssetContract.methods
            .ownerOf(certificateId)
            .call().then((owner:string)=>{
                if (owner === publicAddressOfSender) {
                    return successCallBack();
                }
                else{
                    tryCallbackError();
                }
            });

        // Is the user provide a token access
        for (let tokenType = 0; tokenType < 4; tokenType++) {
            tempWallet.contracts.smartAssetContract.methods
                .tokenHashedAccess(certificateId, tokenType)
                .call()
                .then((data:string)=>{
                    if (publicAddressOfSender === data) {
                        return successCallBack();
                    }
                    else{
                        tryCallbackError();
                    }
                });
        }


        function tryCallbackError(){
            errorCounter++;
            if(errorCounter === 5){
                return callback(getError(ErrorEnum.MAINERROR));
            }
        }

    };

    return {
        [RPCNAME.event.create]: create,
        [RPCNAME.event.read]: read
    };
};

export { eventRPCFactory };
