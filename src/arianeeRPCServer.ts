import * as jayson from "jayson";
import { RPCMethods } from "./rpc";
import {AsyncFunc} from "./rpc/models/func";
import {isDebug} from "./rpc/libs/isDebugMode";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {Arianee, NETWORK} from "@arianee/arianeejs";

if(isDebug) {
  console.warn('!!!!!!!!!!!!!!!!!!!!!!')
  console.warn('YOU ARE IN DEBUG MODE. DO NOT USE IN PRODUCTION. It is a security breach')
}
export class ArianeeRPCCustom {
  private certificateRPC;
  private eventRPC;
  private messageRPC;
  private updateRPC;
  private arianeeWallet: Promise<ArianeeWallet>;

  constructor(private network: string){

  }


  /**
   * Set methods to fetch and create certificate content
   * @param fetchItem
   * @param createItem
   * @param createWithoutValidationOnBC
   */
  public setCertificateContentMethods(fetchItem: AsyncFunc, createItem: AsyncFunc, createWithoutValidationOnBC?: AsyncFunc) {
    this.certificateRPC = RPCMethods.certificateRPCFactory({
      fetchItem,
      createItem,
      createWithoutValidationOnBC,
      network:this.network
    });
    return this;
  }

  /**
   * Set methods to fetch and create event content
   * @param fetch
   * @param create
   */
  public setEventContentMethods(fetchItem: AsyncFunc, createItem: AsyncFunc, createWithoutValidationOnBC?: AsyncFunc) {
    this.eventRPC = RPCMethods.eventRPCFactory({
      fetchItem, createItem, createWithoutValidationOnBC,
      network:this.network

    });
    return this;
  }

  /**
   * Set methods to fetch and create message content
   * @param fetch
   * @param create
   */
  public setMessageContentMethods(fetchItem: AsyncFunc, createItem: AsyncFunc, createWithoutValidationOnBC?: AsyncFunc) {
    this.messageRPC = RPCMethods.messageRPCFactory(
        {
          fetchItem, createItem, createWithoutValidationOnBC,
          network:this.network

        }
    );
    return this;
  }

  public setUpdateContentMethods(fetchItem: AsyncFunc, createItem: AsyncFunc, createWithoutValidationOnBC?: AsyncFunc) {
    this.updateRPC = RPCMethods.updateRPCFactory(
      {
        fetchItem, createItem, createWithoutValidationOnBC,
        network:this.network
      }
    )
    return this;
  }

  private createServerMiddleWare() {
    const server = new jayson.Server({
      ...this.certificateRPC,
      ...this.eventRPC,
      ...this.messageRPC,
      ...this.updateRPC
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
