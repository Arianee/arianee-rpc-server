import { PrivacyGatewayErrorEnum } from "@arianee/common-types";



const errorLog={
   [PrivacyGatewayErrorEnum.MAINERROR]  : { code: 0, message: "unauthorized" },
   [PrivacyGatewayErrorEnum.CALLBACKIMPLEMENTATION]  : { code: 1, message: "callback implementation throw error" },
   [PrivacyGatewayErrorEnum.WRONGCERTIFICATEID]  : { code: 2, message: "certificateId in header and data are not the same " },
   [PrivacyGatewayErrorEnum.SIGNATURETOOOLD]  : { code: 3, message: "signature authorization is too old " },
   [PrivacyGatewayErrorEnum.WRONGIMPRINT]  : { code: 4, message: "Imprint does not match content" },
   [PrivacyGatewayErrorEnum.JSONSCHEMA]  : { code: 5, message: "JSON Schema is unreachable" },
   [PrivacyGatewayErrorEnum.WRONGMESSAGEID]  : { code: 6, message: "messageId in header and data are not the same " },
   [PrivacyGatewayErrorEnum.WRONGJWT]  : { code: 7, message: "the JWT is not valid" },
   [PrivacyGatewayErrorEnum.NOCERTIFICATE]  : { code: 8, message: "the certificate doesn\'t exist" },
   [PrivacyGatewayErrorEnum.NOTOWNERORISSUER]  : { code: 9, message: "the issuer of the JWT is neither the owner nor the issuer of the nft" }

}

export const getError=(error:PrivacyGatewayErrorEnum)=>{
    return errorLog[error];
}
