"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const arianee_wallet_1 = require("./arianee-wallet");
const arianee_factory_1 = require("../arianee-factory/arianee-factory");
const util_1 = require("util");
const certificate_summary_1 = require("../certificate-summary/certificate-summary");
class EnrichedWallet extends arianee_wallet_1.ArianeeWallet {
    constructor() {
        super(...arguments);
        /**
         * Simplified request token
         * @param tokenId
         * @param passphrase
         */
        this.customRequestToken = (tokenId, passphrase, isTest = false) => __awaiter(this, void 0, void 0, function* () {
            const temporaryWallet = arianee_factory_1.Arianee().fromPassPhrase(passphrase);
            const proof = this.utils.signProofForRequestToken(tokenId, this.publicKey, temporaryWallet.privateKey);
            const requestMethod = this.storeContract.methods.requestToken(tokenId, proof.messageHash, true, this.brandDataHubRewardAddress, proof.signature);
            if (isTest) {
                return requestMethod.call();
            }
            else {
                return requestMethod.send();
            }
        });
        this.getCertificate = (tokenId, passphrase) => __awaiter(this, void 0, void 0, function* () {
            /*
                      00. Un objet certificat
                      1. this.smartAssetContract.methods.tokenURI => j'ai l'url du certificat
                      2. this.smartAssetContract.methods.tokenImprint => signature du contract
                      3. Vérifier la signature du Certificate
                      4. this.smartAssetContract.methods.ownerOf
                      4. { content: le Certificate, isValidHash:true/false, ownerOf:publicKey, isOwner:true/false}
                  
                      Getwallet=> tous les certificat qui appartiennent à un wallet
                      */
            const tokenURI = yield this.smartAssetContract.methods
                .tokenURI(tokenId)
                .call();
            console.log(tokenURI);
            const certificateContent = yield this.arianeeState.httpClient.get(tokenURI, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const certificateContentData = certificateContent.data;
            console.log(certificateContentData.$schema);
            const certificateSchema = yield this.arianeeState.httpClient.get(certificateContentData.$schema, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const hash = yield this.utils.cert(certificateSchema.data, certificateContentData);
            const tokenImprint = yield this.smartAssetContract.methods
                .tokenImprint(tokenId)
                .call();
            const owner = yield this.smartAssetContract.methods.ownerOf(tokenId).call();
            //    const isTokenValid=await this.smartAssetContract.methods.isTokenValid(tokenId)
            return new certificate_summary_1.CertificateSummaryBuilder(this)
                .setContent(certificateContentData)
                .setOwner(owner)
                .setIsCertificateValid(hash === tokenImprint)
                .build();
        });
        this.customHydrateToken = (data) => __awaiter(this, void 0, void 0, function* () {
            let { uri, hash, tokenId, passphrase, tokenRecoveryTimestamp, initialKeyIsRequestKey, certificate } = data;
            // hash=
            // si il passe un complexe hash avec uri.
            // Cert => est une alternative au hash.
            tokenId = tokenId || Math.ceil(Math.random() * 10000000);
            const now = new Date();
            tokenRecoveryTimestamp =
                tokenRecoveryTimestamp ||
                    Math.round(now.setDate(now.getDate()) / 1000) + 90 * 60 * 60 * 24;
            initialKeyIsRequestKey =
                initialKeyIsRequestKey === undefined ? initialKeyIsRequestKey : true;
            passphrase = passphrase || this.utils.createPassphrase();
            const temporaryWallet = arianee_factory_1.Arianee().fromPassPhrase(passphrase);
            console.assert(hash && certificate, "you should choose between hash and certificate");
            console.assert(util_1.isNullOrUndefined(hash) && util_1.isNullOrUndefined(certificate), "you should pass at least on parameter");
            if (certificate) {
                const certificateSchema = yield this.arianeeState.httpClient.get("https://cert.arianee.org/version1/ArianeeAsset.json", {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                hash = yield this.utils.cert(certificateSchema.data, certificate);
            }
            return this.storeContract.methods
                .hydrateToken(tokenId, hash, uri, temporaryWallet.publicKey, 0, true, this.brandDataHubRewardAddress)
                .send()
                .then(i => (__assign({}, i, { passphrase,
                tokenId })));
        });
        this.getFaucet = () => {
            return this.arianeeState.httpClient.get(this.arianeeState.arianeeConfig.faucetUrl +
                "&address=" +
                this.account.address);
        };
        this.getAria = () => {
            return this.arianeeState.httpClient.get(this.arianeeState.arianeeConfig.faucetUrl +
                "&address=" +
                this.account.address +
                "&aria=true");
        };
        this.getAriaBalance = () => __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.arianeeState.contracts.ariaContract.methods
                .balanceOf(this.publicKey)
                .call();
            return balance / 100000000;
        });
    }
    get overridedMethods() {
        return {
            requestToken: this.customRequestToken,
            hydrateToken: this.customHydrateToken
        };
    }
    get methods() {
        return __assign({ balanceOfAria: this.ariaContract.methods.balanceOf, balanceOfGas: this.arianeeState.web3.eth.getBalance }, this.overridedMethods);
    }
}
exports.EnrichedWallet = EnrichedWallet;
//# sourceMappingURL=enriched-wallet.js.map