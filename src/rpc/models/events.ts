import {ArianeeTokenId} from "@arianee/arianeejs/dist/src/models/ArianeeTokenId";
import {RPCAuthtentification} from "./authentification";

export interface EventPayload { certificateId:ArianeeTokenId, eventId:string, authentification:RPCAuthtentification }
export interface EventPayloadCreate extends EventPayload  {
    json:any }
