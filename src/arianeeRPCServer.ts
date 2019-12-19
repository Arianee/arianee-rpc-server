import * as jayson from "jayson";
import { RPCMethods } from "./rpc";
import {AsyncFunc} from "./rpc/models/func";


export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  private network;

  constructor(network:string){
    this.network = network;
  }

  public setFetchCertificateContent(fetch:AsyncFunc,create:AsyncFunc) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(fetch,create, this.network);
    return this;
  }

  public setFetchEventContent(fetch:AsyncFunc, create:AsyncFunc) {
    this.eventRPC = RPCMethods.eventRPCFactory(fetch, create, this.network);
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
