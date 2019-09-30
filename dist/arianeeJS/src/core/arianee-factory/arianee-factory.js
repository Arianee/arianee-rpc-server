"use strict";
const configProd = require("../../arianee-configuration/prod");
const protocol_configuration_setter_1 = require("../protocol-configuration-setter/protocol-configuration-setter");
exports.Arianee = (confOverride) => {
    const conf = confOverride ? confOverride : configProd;
    return new protocol_configuration_setter_1.ProtocolConfigurationSetter()
        .setConfig(conf.arianJSON)
        .setIdentityAbi(conf.arianeeIdentity)
        .setStoreAbi(conf.arianeeStore)
        .setTokenAbi(conf.arianeeToken)
        .setAria(conf.arianeeAria)
        .setCreditHistory(conf.arianeeCreditHistory)
        .setStaking(conf.airaneeStacking)
        .setWhiteList(conf.arianeeWhiteList)
        .build();
};
//# sourceMappingURL=arianee-factory.js.map