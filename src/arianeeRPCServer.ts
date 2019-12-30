import * as jayson from "jayson";
import { RPCMethods } from "./rpc";
import {AsyncFunc} from "./rpc/models/func";
import {deprecated} from "./libs/deprecated-decorator";

export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  private network;

  constructor(network:string){
    this.network = network;
  }

  /**
   * Set methods to fetch and create certificate content
   * @param fetch
   * @param create
   */
  public setCertificateContentMethods(fetch:AsyncFunc,create:AsyncFunc) {
    this.certificateRPC = RPCMethods.certificateRPCFactory(fetch,create, this.network);
    return this;
  }

  /**
   * @deprecated use setCertificateContentMethods
   * @param fetch
   * @param create
   */
  @deprecated('setCertificateContentMethods')
  public setFetchCertificateContent(fetch:AsyncFunc,create:AsyncFunc) {
   return this.setCertificateContentMethods(fetch,create);
  }


  /**
   * Set methods to fetch and create event content
   * @param fetch
   * @param create
   */
  public setEventContentMethods(fetch:AsyncFunc, create:AsyncFunc) {
    this.eventRPC = RPCMethods.eventRPCFactory(fetch, create, this.network);
    return this;
  }

  /**
   * @deprecated use setCertificateContentMethods
   * @param fetch
   * @param create
   */
  @deprecated('setCertificateContentMethods')
  public setFetchEventContent(fetch:AsyncFunc, create:AsyncFunc) {
    console.warn('setEventContentMethods is deprecated');
    return this.setEventContentMethods(fetch,create);
  }

  private createServerMiddleWare() {
    const server = new jayson.Server({
      ...this.certificateRPC,
      ...this.eventRPC
    });

    return server.middleware();
  }

  /**
   * Create a RPC server middleware
   */
  public build() {
    return this.createServerMiddleWare();
  }
}
