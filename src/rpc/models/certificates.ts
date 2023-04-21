
import {RPCAuthtentification} from "./authentification";

export interface CertificatePayload { certificateId:string,authentification?:RPCAuthtentification }
export interface CertificatePayloadCreate extends CertificatePayload  {
    json:any }
