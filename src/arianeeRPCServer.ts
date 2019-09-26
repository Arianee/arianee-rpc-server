import * as jayson from "jayson";
import { RPCMethods } from "./rpc";

export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  
  public setFetchCertificateContent(func) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(func);
    return this;
  }

  public setFetchEventContent(funcFetch, funcCreate) {
    this.eventRPC = RPCMethods.eventRPCFactory(funcFetch, funcCreate);
    return this;
  }

  private createServerMiddleWare() {
    const server = new jayson.Server({
      ...this.certificateRPC,
      ...this.eventRPC
    });

    return server.middleware();
  }

  public build() {
    return this.createServerMiddleWare();
  }
}
