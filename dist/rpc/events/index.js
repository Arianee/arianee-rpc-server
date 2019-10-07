"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rpc_name_1 = require("../rpc-name");
const error_1 = require("../errors/error");
const arianeejs_1 = require("@arianee/arianeejs");
const axios_1 = __importDefault(require("axios"));
/*
{ tokenId: 3838065,
    eventId:333,
    json:{},
    authentification:
     { hash:
        '0xd5a77c8b8e828fb7669f67f726d813f1686b403a6bfc45a3cf7ca670961c9cf6',
       signature:
        '0x7fa947e468575a779ef02f9654a664b22c2571553571594417d8d8282b2c22047ee63781f33078b17b6da7dcb3f7c983a3f58913b2d2aa3edf209845991109201b',
       message: '{"tokenId":3838065,"timestamp":"2019-09-13T10:56:59.264Z"}' } }
*/
/*interface Payload {
    tokenId: number;
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
arianeejs_1.Arianee();
const eventRPCFactory = (fetchItem, createItem) => {
    const create = (data, callback) => __awaiter(this, void 0, void 0, function* () {
        const successCallBack = (eventId) => __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield createItem(eventId, json);
                return callback(null, content);
            }
            catch (err) {
                return callback(error_1.MAINERROR);
            }
        });
        const { authentification, eventId, json } = data;
        const tempWallet = arianeejs_1.Arianee().fromRandomKey();
        try {
            const event = yield tempWallet.eventContract.methods.getEvent(eventId).call();
            axios_1.default.get(json.$schema)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                const schema = response.data;
                const imprint = yield tempWallet.utils.cert(schema, json);
                if (event[1] === imprint) {
                    return successCallBack(eventId);
                }
                else {
                    return callback(error_1.MAINERROR);
                }
            }));
        }
        catch (err) {
            return callback(error_1.MAINERROR);
        }
    });
    const read = (data, callback) => __awaiter(this, void 0, void 0, function* () {
        const successCallBack = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const content = yield fetchItem(eventId);
                return callback(null, content);
            }
            catch (err) {
                return callback(error_1.MAINERROR);
            }
        });
        const tempWallet = arianeejs_1.Arianee().fromRandomKey();
        const { tokenId, authentification, eventId } = data;
        const { message, signature } = authentification;
        let errorCounter = 0;
        const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(message, signature);
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.tokenId !== tokenId) {
            return callback(error_1.MAINERROR);
        }
        const isSignatureTooOld = (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 >
            300;
        if (isSignatureTooOld) {
            return callback(error_1.MAINERROR);
        }
        // Is the event exist
        try {
            yield tempWallet.eventContract.methods.getEvent(eventId).call();
        }
        catch (err) {
            return callback(error_1.MAINERROR);
        }
        // Is user the owner of this certificate
        tempWallet.smartAssetContract.methods
            .ownerOf(tokenId)
            .call().then((owner) => {
            if (owner === publicAddressOfSender) {
                return successCallBack();
            }
            else {
                tryCallbackError();
            }
        });
        // Is the user provide a token access
        for (let tokenType = 0; tokenType < 4; tokenType++) {
            tempWallet.smartAssetContract.methods
                .tokenHashedAccess(tokenId, tokenType)
                .call()
                .then((data) => {
                if (publicAddressOfSender === data) {
                    return successCallBack();
                }
                else {
                    tryCallbackError();
                }
            });
        }
        function tryCallbackError() {
            errorCounter++;
            if (errorCounter === 5) {
                return callback(error_1.MAINERROR);
            }
        }
    });
    return {
        [rpc_name_1.RPCNAME.event.create]: create,
        [rpc_name_1.RPCNAME.event.read]: read
    };
};
exports.eventRPCFactory = eventRPCFactory;
//# sourceMappingURL=index.js.map