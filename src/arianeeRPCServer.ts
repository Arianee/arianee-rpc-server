import * as jayson from "jayson";
import { RPCMethods } from "./rpc";

export class ArianeeRPCCustom {
  private certificateRPC;

  public setFetchCertificateContent(func) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(func);
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
