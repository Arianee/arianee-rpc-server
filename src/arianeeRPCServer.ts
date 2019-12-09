import * as jayson from "jayson";
import { RPCMethods } from "./rpc";

export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  private network;

  constructor(network:string){
    this.network = network;
  }

  public setFetchCertificateContent(func) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(func, this.network);
    return this;
  }

  public setFetchEventContent(funcFetch, funcCreate) {
    this.eventRPC = RPCMethods.eventRPCFactory(funcFetch, funcCreate, this.network);
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
