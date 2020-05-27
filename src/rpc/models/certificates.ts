import {ArianeeTokenId} from "@arianee/arianeejs/dist/src/models/ArianeeTokenId";
import {RPCAuthtentification} from "./authentification";

export interface CertificatePayload { certificateId:ArianeeTokenId,authentification?:RPCAuthtentification }
export interface CertificatePayloadCreate extends CertificatePayload  {
    json:any }
