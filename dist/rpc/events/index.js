"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rpc_name_1 = require("../rpc-name");
const error_1 = require("../errors/error");
const arianeejs_1 = require("@arianee/arianeejs");
const axios_1 = require("axios");
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
        const { authentification, eventId, json, schemaUrl, uri, issuer } = data;
        const tempWallet = arianeejs_1.Arianee().fromRandomKey();
        try {
            const event = yield tempWallet.eventContract.methods.events(eventId).call();
            axios_1.default.get(schemaUrl)
                .then((response) => __awaiter(this, void 0, void 0, function* () {
                const schema = response.data;
                const imprint = yield tempWallet.utils.cert(schema, json);
                if (event.imprint === imprint) {
                    successCallBack(eventId);
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
                const content = yield fetchItem(tokenId);
                return callback(null, content);
            }
            catch (err) {
                return callback(error_1.MAINERROR);
            }
        });
        const tempWallet = arianeejs_1.Arianee().fromRandomKey();
        const { tokenId, authentification, eventId } = data;
        const { message, signature } = authentification;
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
        // Is user the owner of this certificate
        const owner = yield tempWallet.smartAssetContract.methods
            .ownerOf(tokenId)
            .call();
        try {
            yield tempWallet.eventContract.methods.events(eventId).call();
        }
        catch (err) {
            return callback(error_1.MAINERROR);
        }
        if (owner === publicAddressOfSender) {
            return successCallBack();
        }
        // Is the user provide a token acces
        for (let tokenType = 0; tokenType < 4; tokenType++) {
            const data = yield tempWallet.smartAssetContract.methods
                .tokenHashedAccess(tokenId, tokenType)
                .call();
            if (publicAddressOfSender === data) {
                return successCallBack();
            }
        }
        return callback(error_1.MAINERROR);
    });
    return {
        [rpc_name_1.RPCNAME.event.create]: create,
        [rpc_name_1.RPCNAME.event.read]: read
    };
};
exports.eventRPCFactory = eventRPCFactory;
//# sourceMappingURL=index.js.map