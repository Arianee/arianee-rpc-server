import {AsyncFunc} from "./func";

export interface ReadConfiguration{
  fetchItem:AsyncFunc,
  createItem:AsyncFunc,
  createWithoutValidationOnBC?:AsyncFunc,
  network:string
}
