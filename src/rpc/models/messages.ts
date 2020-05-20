import {RPCAuthtentification} from "./authentification";

export interface MessagePayload { messageId:string, authentification:RPCAuthtentification }
export interface MessagePayloadCreate extends MessagePayload  {
    json:any }
