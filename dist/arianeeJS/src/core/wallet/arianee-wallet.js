"use strict";
const contract_to_arianee_contract_1 = require("../libs/contract-to-arianee-contract");
const utils_1 = require("../utils");
class ArianeeWallet {
    constructor(arianeeState, _account) {
        this.arianeeState = arianeeState;
        this._account = _account;
        this.utils = new utils_1.Utils(this.arianeeState.web3);
        this.brandDataHubRewardAddress = "0xA79B29AD7e0196C95B87f4663ded82Fbf2E3ADD8";
        this.walletRewardAddress = "0x39da7e30d2D5F2168AE3B8599066ab122680e1ef";
        this.smartAssetContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.smartAssetContract, this, this.arianeeState).makeArianee();
        this.identityContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.identityContract, this, this.arianeeState).makeArianee();
        this.ariaContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.ariaContract, this, this.arianeeState).makeArianee();
        this.storeContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.storeContract, this, this.arianeeState).makeArianee();
        this.creditHistoryContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.creditHistoryContract, this, this.arianeeState).makeArianee();
        this.whitelistContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.whitelistContract, this, this.arianeeState).makeArianee();
        this.stakingContract = new contract_to_arianee_contract_1.ArianeeContract(this.arianeeState.contracts.stakingContract, this, this.arianeeState).makeArianee();
    }
    get publicKey() {
        return this.account.address;
    }
    get privateKey() {
        return this.account.privateKey;
    }
    get web3() {
        return this.arianeeState.web3;
    }
    get account() {
        return this._account;
    }
}
exports.ArianeeWallet = ArianeeWallet;
//# sourceMappingURL=arianee-wallet.js.map