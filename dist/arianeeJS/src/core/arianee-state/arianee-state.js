"use strict";
const arianee_contract_builder_1 = require("./arianee-contract-builder");
class ArianeeStateBuilder {
    setHttpClient(httpClient) {
        this.httpClient = httpClient;
        return this;
    }
    setConfig(ArianeeConfig) {
        this.contracts = new arianee_contract_builder_1.ArianeeContractBuilder(ArianeeConfig);
    }
    build() {
        return new ArianeeState(this.contracts, this.httpClient);
    }
}
exports.ArianeeStateBuilder = ArianeeStateBuilder;
class ArianeeState {
    constructor(_contracts, _httpClient) {
        this._contracts = _contracts;
        this._httpClient = _httpClient;
    }
    get arianeeConfig() {
        return this._contracts.arianeeConfig;
    }
    get httpClient() {
        return this._httpClient;
    }
    get web3() {
        return this._contracts.web3;
    }
    get contracts() {
        return this._contracts;
    }
}
exports.ArianeeState = ArianeeState;
//# sourceMappingURL=arianee-state.js.map