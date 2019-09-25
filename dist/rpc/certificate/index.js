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
const isobjectmatchingmodel_1 = require("isobjectmatchingmodel");
const error_1 = require("../errors/error");
const arianeejs_1 = require("@arianee/arianeejs");
arianeejs_1.Arianee();
const certificateRPCFactory = fetchItem => {
    const create = (data, callback) => {
        callback(null, data);
    };
    /*
   { tokenId: 3838065,
    authentification:
     { hash:
        '0xd5a77c8b8e828fb7669f67f726d813f1686b403a6bfc45a3cf7ca670961c9cf6',
       signature:
        '0x7fa947e468575a779ef02f9654a664b22c2571553571594417d8d8282b2c22047ee63781f33078b17b6da7dcb3f7c983a3f58913b2d2aa3edf209845991109201b',
       message: '{"tokenId":3838065,"timestamp":"2019-09-13T10:56:59.264Z"}' } }
  
  */
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
        const { tokenId, authentification } = data;
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
    const HELLOWORLD = function (args, callback) {
        const neededArguments = {
            a: "",
            b: ""
        };
        console.assert(isobjectmatchingmodel_1.isObjectMatchingModel(neededArguments, args), "wrong paramters");
        const { a, b } = args;
        callback(null, a + b);
    };
    return {
        [rpc_name_1.RPCNAME.certificate.create]: create,
        [rpc_name_1.RPCNAME.certificate.read]: read,
        add: HELLOWORLD
    };
};
exports.certificateRPCFactory = certificateRPCFactory;
//# sourceMappingURL=index.js.map