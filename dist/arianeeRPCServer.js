"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const jayson = __importStar(require("jayson"));
const rpc_1 = require("./rpc");
class ArianeeRPCCustom {
    setFetchCertificateContent(func) {
        this.certificateRPC = rpc_1.RPCMethods.certificateRPCFactory(func);
        return this;
    }
    setFetchEventContent(funcFetch, funcCreate) {
        this.eventRPC = rpc_1.RPCMethods.eventRPCFactory(funcFetch, funcCreate);
        return this;
    }
    createServerMiddleWare() {
        const server = new jayson.Server(Object.assign({}, this.certificateRPC, this.eventRPC));
        return server.middleware();
    }
    build() {
        return this.createServerMiddleWare();
    }
}
exports.ArianeeRPCCustom = ArianeeRPCCustom;
//# sourceMappingURL=arianeeRPCServer.js.map