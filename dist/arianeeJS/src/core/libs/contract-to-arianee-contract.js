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
const flat_promise_1 = require("./flat-promise");
class ArianeeContract {
    constructor(contract, wallet, arianeeState) {
        this.contract = contract;
        this.wallet = wallet;
        this.arianeeState = arianeeState;
        this.overideSend = (transaction, data) => __awaiter(this, void 0, void 0, function* () {
            const nonce = yield this.arianeeState.web3.eth
                .getTransactionCount(this.wallet.publicKey, "pending");
            const encodeABI = data.encodeABI();
            const defaultTransaction = {
                nonce,
                chainId: this.arianeeState.contracts.arianeeConfig.chainId,
                from: this.wallet.publicKey,
                data: encodeABI,
                to: this.contract.options.address,
                gasLimit: 2000000,
                gasPrice: this.arianeeState.web3.utils.toWei("1", "gwei"),
            };
            const mergedTransaction = __assign({}, defaultTransaction, transaction);
            const { resolve, reject, promise } = flat_promise_1.flatPromise();
            // if (this.arianeeProtocolInstance.isMetamaskProvider) {
            //     return this.arianeeSignMetamask(mergedTransaction);
            //} else {
            this.wallet.account
                .signTransaction(mergedTransaction)
                .then((result) => {
                return this.arianeeState.web3.eth.sendSignedTransaction(result.rawTransaction)
                    .once("confirmation", (confirmationNumber, receipt) => {
                    resolve({
                        result,
                        confirmationNumber,
                        receipt
                    });
                });
            }).catch((err) => {
                console.error(err);
                reject(err);
            });
            return promise;
            // }
        });
        if (contract === undefined) {
            throw new Error("contract is undefined");
        }
        this.key = contract;
        Object.keys(this.key.methods).forEach((method) => {
            const b = contract.methods[method];
            if (!method.startsWith("0")) {
                this.key.methods[method] = (...args) => {
                    return __assign({}, b.bind()(...args), { send: (transaction) => this.overideSend(transaction, b.bind()(...args)) });
                };
            }
        });
    }
    makeArianee() {
        return this.key;
    }
    /**
     * arianeeSignMetamask
     * @param nonce
     * @param contractAddress
     * @param data
     */
    arianeeSignMetamask(transaction) {
        const { resolve, promise, reject } = flat_promise_1.flatPromise();
        this.arianeeState.web3.eth.sendTransaction(transaction, function (err, result) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
        return promise;
    }
}
exports.ArianeeContract = ArianeeContract;
//# sourceMappingURL=contract-to-arianee-contract.js.map