import {AsyncFunc} from "./func";
import {NETWORK} from "@arianee/arianeejs/dist/src";

export interface ReadConfiguration{
  fetchItem:AsyncFunc,
  createItem:AsyncFunc,
  network: NETWORK,
  createWithoutValidationOnBC?:AsyncFunc
}
