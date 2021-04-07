import {AsyncFunc} from "./func";
import {NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";

export interface ReadConfiguration{
  fetchItem:AsyncFunc,
  createItem:AsyncFunc,
  arianeeWallet: Promise<ArianeeWallet>,
  createWithoutValidationOnBC?:AsyncFunc,
}
