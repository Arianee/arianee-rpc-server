import {CertificateId} from "@arianee/arianeejs/dist/src/models/CertificateId";
import {RPCAuthtentification} from "./authentification";

export interface CertificatePayload { certificateId:CertificateId,authentification?:RPCAuthtentification }
export interface CertificatePayloadCreate extends CertificatePayload  {
    json:any }
