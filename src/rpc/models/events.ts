
import {RPCAuthtentification} from "./authentification";

export interface EventPayload { certificateId:string, eventId:string, authentification:RPCAuthtentification }
export interface EventPayloadCreate extends EventPayload  {
    json:any }
