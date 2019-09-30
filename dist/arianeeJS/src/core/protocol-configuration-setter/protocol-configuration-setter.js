"use strict";
const util_1 = require("util");
const arianee_wallet_builder_1 = require("../wallet-maker/arianee-wallet-builder");
class ProtocolConfigurationSetter {
    constructor() {
        this.config = {
            identity: { abi: undefined, address: undefined },
            token: { abi: undefined, address: undefined },
            store: { abi: undefined, address: undefined },
            aria: { abi: undefined, address: undefined },
            creditHistory: { abi: undefined, address: undefined },
            staking: { abi: undefined, address: undefined },
            whitelist: { abi: undefined, address: undefined },
            provider: undefined,
            chainId: undefined,
            faucetUrl: undefined,
            walletReward: { address: undefined },
            brandDataHubReward: { address: undefined },
        };
    }
    setConfig(val) {
        Object.assign(this.config, val);
        return this;
    }
    setTokenAbi(val) {
        this.config.token.abi = val;
        return this;
    }
    setAria(val) {
        this.config.aria.abi = val;
        return this;
    }
    setIdentityAbi(val) {
        this.config.identity.abi = val;
        return this;
    }
    setStoreAbi(val) {
        this.config.store.abi = val;
        return this;
    }
    setCreditHistory(val) {
        this.config.creditHistory.abi = val;
        return this;
    }
    setWhiteList(val) {
        this.config.whitelist.abi = val;
        return this;
    }
    setStaking(val) {
        this.config.staking.abi = val;
        return this;
    }
    build() {
        if (this.isReadyForBuild().isValid) {
            const arianeeProtocol = new arianee_wallet_builder_1.ArianeeWalletBuilder(this.config);
            return arianeeProtocol;
        }
        else {
            throw new Error(`It is missing some settings: ${this.isReadyForBuild().missingProperties.join(" ")}`);
        }
    }
    isReadyForBuild() {
        const properties = ["store", "aria", "token", "identity", "staking", "whitelist", "creditHistory"];
        const missingProperties = properties.filter((property) => util_1.isNullOrUndefined(this.config[property].abi));
        return {
            missingProperties,
            isValid: missingProperties.length === 0,
        };
    }
}
exports.ProtocolConfigurationSetter = ProtocolConfigurationSetter;
//# sourceMappingURL=protocol-configuration-setter.js.map