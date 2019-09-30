"use strict";
const Web3 = require("web3");
class ArianeeContractBuilder {
    constructor(arianeeConfig) {
        this.arianeeConfig = arianeeConfig;
        this.web3 = new Web3(this.arianeeConfig.provider);
        this.smartAssetContract = new this.web3.eth.Contract(this.arianeeConfig.token.abi, this.arianeeConfig.token.address);
        this.identityContract = new this.web3.eth.Contract(this.arianeeConfig.identity.abi, this.arianeeConfig.identity.address);
        this.ariaContract = new this.web3.eth.Contract(this.arianeeConfig.aria.abi, this.arianeeConfig.aria.address);
        this.storeContract = new this.web3.eth.Contract(this.arianeeConfig.store.abi, this.arianeeConfig.store.address);
        this.creditHistoryContract = new this.web3.eth.Contract(this.arianeeConfig.creditHistory.abi, this.arianeeConfig.creditHistory.address);
        this.whitelistContract = new this.web3.eth.Contract(this.arianeeConfig.whitelist.abi, this.arianeeConfig.whitelist.address);
        this.stakingContract = new this.web3.eth.Contract(this.arianeeConfig.staking.abi, this.arianeeConfig.staking.address);
    }
}
exports.ArianeeContractBuilder = ArianeeContractBuilder;
//# sourceMappingURL=arianee-contract-builder.js.map