import {isDebug} from "../libs/isDebugMode";

export enum ErrorEnum {
    MAINERROR='MAINERROR',
    CALLBACKIMPLEMENTATION='CALLBACKIMPLEMENTATION',
    WRONGCERTIFICATEID='WRONGCERTIFICATEID',
    SIGNATURETOOOLD='SIGNATURETOOOLD',
    WRONGIMPRINT='WRONGIMPRINT',
    JSONSCHEMA='JSONSCHEMA',
    WRONGMESSAGEID='WRONGMESSAGEID',
    WRONGJWT = "WRONGJWT",
    NOCERTIFICATE = "NOCERTIFICATE",
    NOTOWNERORISSUER = "NOTOWNERORISSUER"

}

const errorLog={
   [ErrorEnum.MAINERROR]  : { code: 0, message: "unauthorized" },
   [ErrorEnum.CALLBACKIMPLEMENTATION]  : { code: 1, message: "callback implementation throw error" },
   [ErrorEnum.WRONGCERTIFICATEID]  : { code: 2, message: "certificateId in header and data are not the same " },
   [ErrorEnum.SIGNATURETOOOLD]  : { code: 3, message: "signature authorization is too old " },
   [ErrorEnum.WRONGIMPRINT]  : { code: 4, message: "Imprint does not match content" },
   [ErrorEnum.JSONSCHEMA]  : { code: 5, message: "JSON Schema is unreachable" },
   [ErrorEnum.WRONGMESSAGEID]  : { code: 6, message: "messageId in header and data are not the same " },
   [ErrorEnum.WRONGJWT]  : { code: 7, message: "the JWT is not valid" },
   [ErrorEnum.NOCERTIFICATE]  : { code: 8, message: "the certificate doesn\'t exist" },
   [ErrorEnum.NOTOWNERORISSUER]  : { code: 9, message: "the issuer of the JWT is neither the owner nor the issuer of the nft" }

}

export const getError=(error:ErrorEnum)=>{
    return errorLog[error];
}
