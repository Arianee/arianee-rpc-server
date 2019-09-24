import * as jayson from "jayson";
import { RPCMethods } from "./rpc";

export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  
  public setFetchCertificateContent(func) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(func);
    return this;
  }

  public setFetchEventContent(func) {
    this.eventRPC = RPCMethods.eventRPCFactory(func);
    return this;
  }

  private createServerMiddleWare() {
    const server = new jayson.Server({
      ...this.certificateRPC
    });

    return server.middleware();
  }

  public build() {
    return this.createServerMiddleWare();
  }
}
