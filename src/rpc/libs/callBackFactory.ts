import { PrivacyGatewayErrorEnum } from '@arianee/common-types';
import { getError } from '../errors/error';

export const callBackFactory = (RPCCallback) => (functionToCalls: any[]) => {
  return functionToCalls.map((functionToCall) => async () => {
    try {
      const result = await functionToCall();
      return RPCCallback(null, result);
    } catch (err) {
      console.log('err', err);
      return RPCCallback(getError(PrivacyGatewayErrorEnum.CALLBACKIMPLEMENTATION));
    }
  });
};
