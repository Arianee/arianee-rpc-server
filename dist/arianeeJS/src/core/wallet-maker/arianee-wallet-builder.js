"use strict";
const axios_1 = require("axios");
const ethers_1 = require("ethers");
const wallet_1 = require("../wallet");
const arianee_state_1 = require("../arianee-state/arianee-state");
const Web3 = require("web3");
class ArianeeWalletBuilder {
    constructor(arianeeConfig) {
        this.stateBuilder = new arianee_state_1.ArianeeStateBuilder();
        this.stateBuilder.setConfig(arianeeConfig);
        this.stateBuilder.setHttpClient(axios_1.default);
        this.web3 = this.stateBuilder.contracts.web3;
    }
    buildAriaWallet() {
        if (this.web3.utils.isAddress(this.account.address)) {
            const arianeeState = this.stateBuilder.build();
            return new wallet_1.ArianeeWallet(arianeeState, this.account);
        }
        throw new Error("invalid address");
    }
    fromPassPhrase(passphrase) {
        let privateKey = this.web3.utils.padLeft(this.web3.utils.toHex(passphrase), 64);
        return this.fromPrivateKey(privateKey);
    }
    /**
     * From a randomKey and return ArianeeProtocol
     */
    fromRandomKey() {
        const randomWallet = ethers_1.Wallet.createRandom();
        this.account = this.web3.eth.accounts.privateKeyToAccount(randomWallet.privateKey);
        return this.buildAriaWallet();
    }
    /**
     * Generate a mnemonic and return ArianeeProtocol
     * @param data
     */
    fromRandomMnemonic(data) {
        const mnemonic = this.generateMnemonic(data);
        this.fromMnemonic(mnemonic);
        return this.buildAriaWallet();
    }
    /**
     *  From a mnemonic and return ArianeeProtocol
     * @param mnemonic
     */
    fromMnemonic(mnemonic) {
        const isValidMnemonic = ethers_1.ethers.utils.HDNode.isValidMnemonic(mnemonic);
        if (isValidMnemonic) {
            const { privateKey } = ethers_1.Wallet.fromMnemonic(mnemonic);
            this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        }
        else {
            throw new Error("invalid mnemonic");
        }
        return this.buildAriaWallet();
    }
    /**
     *  From privatekey and return ArianeeProtocol
     * @param privateKey
     */
    fromPrivateKey(privateKey) {
        this.account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
        return this.buildAriaWallet();
    }
    setHttpProvider(httpClient) {
        this.stateBuilder.setHttpClient(httpClient);
        return this;
    }
    generateMnemonic(data) {
        if (data && data != "ko") {
            const encryptedKey = data;
            const mnemonic = JSON.parse(encryptedKey.toString()).signingKey.mnemonic;
            return mnemonic;
        }
        else {
            console.error("no data");
            return;
        }
    }
}
exports.ArianeeWalletBuilder = ArianeeWalletBuilder;
//# sourceMappingURL=arianee-wallet-builder.js.map