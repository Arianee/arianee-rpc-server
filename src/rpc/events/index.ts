import { RPCNAME } from "../rpc-name";
import { isObjectMatchingModel } from "isobjectmatchingmodel";
import { MAINERROR } from "../errors/error";
import { Arianee } from "@arianee/arianeejs";
import axios from 'axios';


/*
{ certificateId: 3838065,
    eventId:333,
    json:{},
    authentification:
     { hash:
        '0xd5a77c8b8e828fb7669f67f726d813f1686b403a6bfc45a3cf7ca670961c9cf6',
       signature:
        '0x7fa947e468575a779ef02f9654a664b22c2571553571594417d8d8282b2c22047ee63781f33078b17b6da7dcb3f7c983a3f58913b2d2aa3edf209845991109201b',
       message: '{"certificateId":3838065,"timestamp":"2019-09-13T10:56:59.264Z"}' } }
*/
/*interface Payload {
    certificateId: number;
    eventId: number;
    json: any;
    schemaUrl:string;
    uri:string;
    issuer:string;
    authentification: {
        hash: string;
        signature: string;
        message: any;
    };
}*/

const eventRPCFactory = (fetchItem,createItem) => {
    const create = async (data: any, callback) => {

        const successCallBack = async (eventId) => {
            try {
                const content = await createItem(eventId, json);
                return callback(null, content);
            } catch (err) {
                return callback(MAINERROR);
            }
        };

        const { authentification, eventId, json} = data;

      const arianee = await new Arianee().connectToProtocol();
      const tempWallet = arianee.fromRandomKey();
        try{
            const event = await tempWallet.eventContract.methods.getEvent(eventId).call();
            axios.get(json.$schema)
                .then(async (response)=> {
                    const schema = response.data;
                    const imprint = await tempWallet.utils.cert(schema, json);
                    if(event[1] === imprint){
                        return successCallBack(eventId);
                    }
                    else{
                        return callback(MAINERROR);
                    }
                });
        }
        catch(err){

            return callback(MAINERROR);
        }

    };

    const read = async (data: any, callback) => {
        const successCallBack = async () => {
            try {
                const content = await fetchItem(eventId);
                return callback(null, content);
            } catch (err) {
                return callback(MAINERROR);
            }
        };

      const arianee = await new Arianee().connectToProtocol();
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
            return callback(MAINERROR);
        }

        const isSignatureTooOld =
            (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
            300;

        if (isSignatureTooOld) {
            return callback(MAINERROR);
        }

        // Is the event exist
        try {
            await tempWallet.eventContract.methods.getEvent(eventId).call();
        } catch (err) {
            return callback(MAINERROR);
        }

        // Is user the owner of this certificate
        tempWallet.smartAssetContract.methods
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
            tempWallet.smartAssetContract.methods
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
                return callback(MAINERROR);
            }
        }

    };

    return {
        [RPCNAME.event.create]: create,
        [RPCNAME.event.read]: read
    };
};

export { eventRPCFactory };
