import {CertificateId} from "@arianee/arianeejs/dist/src/models/CertificateId";
import {RPCAuthtentification} from "./authentification";

export interface EventPayload { certificateId:CertificateId, eventId:string, authentification:RPCAuthtentification }
export interface EventPayloadCreate extends EventPayload  {
    json:any }
