import {isDebug} from "../libs/isDebugMode";

export const enum ErrorEnum {
    MAINERROR='MAINERROR',
    CALLBACKIMPLEMENTATION='CALLBACKIMPLEMENTATION',
    WRONGCERTIFICATEID='WRONGCERTIFICATEID',
    SIGNATURETOOOLD='SIGNATURETOOOLD',
    WRONGIMPRINT='WRONGIMPRINT',
    JSONSCHEMA='JSONSCHEMA',
    WRONGMESSAGEID='WRONGMESSAGEID',
    WRONGJWT = "WRONGJWT"


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

}

export const getError=(error:ErrorEnum)=>{
    if(!isDebug){
        return errorLog[ErrorEnum.MAINERROR]
    }else{
        console.log(error)
        return errorLog[error]
    }
}
