import * as jayson from "jayson";
import { RPCMethods } from "./rpc";
import {AsyncFunc} from "./rpc/models/func";
import {isDebug} from "./rpc/libs/isDebugMode";

if(isDebug) {
  console.warn('!!!!!!!!!!!!!!!!!!!!!!')
  console.warn('YOU ARE IN DEBUG MODE. DO NOT USE IN PRODUCTION. It is a security breach')
}
export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  private messageRPC;
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
  public setFetchCertificateContent(fetch:AsyncFunc,create:AsyncFunc) {
    console.warn('setFetchCertificateContent is deprecated');
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
  public setFetchEventContent(fetch:AsyncFunc, create:AsyncFunc) {
    console.warn('setEventContentMethods is deprecated');
    return this.setEventContentMethods(fetch,create);
  }

  private createServerMiddleWare() {
    const server = new jayson.Server({
      ...this.certificateRPC,
      ...this.eventRPC,
      ...this.messageRPC
    });

    return server.middleware();
  }


  /**
   * Set methods to fetch and create message content
   * @param fetch
   * @param create
   */
  public setMessageContentMethods(fetch:AsyncFunc, create:AsyncFunc) {
    this.messageRPC = RPCMethods.messageRPCFactory(fetch, create, this.network);
    return this;
  }

 


  /**
   * Create a RPC server middleware
   */
  public build() {
    return this.createServerMiddleWare();
  }
}
