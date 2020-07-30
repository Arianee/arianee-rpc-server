import {ErrorEnum, getError} from "../errors/error";

export const callBackFactory = (RPCCallback) => (functionToCalls: any[]) => {
    return functionToCalls
        .map(functionToCall => async () => {
            try {
                const result = await functionToCall();
                return RPCCallback(null, result);
            } catch (err) {
                return RPCCallback(getError(ErrorEnum.CALLBACKIMPLEMENTATION));
            }
        })

};
