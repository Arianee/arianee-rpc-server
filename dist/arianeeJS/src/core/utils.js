"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const cert_1 = require("@0xcert/cert");
class Utils {
    constructor(web3) {
        this.web3 = web3;
    }
    signProofForRequestToken(tokenId, publicKeyNextOwner, privateKeyPreviousOwner) {
        const data = this.web3.utils.keccak256(this.web3.eth.abi.encodeParameters(["uint", "address"], [tokenId, publicKeyNextOwner]));
        return this.signProof(data, privateKeyPreviousOwner);
    }
    createPassphrase() {
        return (Math.random()
            .toString(36)
            .substring(2, 8) +
            Math.random()
                .toString(36)
                .substring(2, 8));
    }
    signProof(data, privateKey) {
        return this.web3.eth.accounts.sign(data, privateKey);
    }
    cert(schema, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(schema, data);
            const cert = new cert_1.Cert({
                schema: schema
            });
            const cleanData = this.cleanObject(data);
            const certif = yield cert.imprint(cleanData);
            return "0x" + certif;
        });
    }
    cleanObject(obj) {
        for (var propName in obj) {
            if (obj[propName] &&
                obj[propName].constructor === Array &&
                obj[propName].length === 0) {
                delete obj[propName];
            }
        }
        return obj;
    }
}
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map