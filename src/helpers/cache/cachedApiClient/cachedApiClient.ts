/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArianeeApiClient } from '@arianee/arianee-api-client';
import memoizee from 'memoizee';

const arianeeApiClient = new ArianeeApiClient();

const _memoizee = <F extends (...args: any[]) => any>(f: F) =>
  memoizee(f, {
    promise: true,
    maxAge: 10 * 1000, // 10 seconds
  });

/* retrieving a nft / message / event / identity requires many calls to arianee api within a short period of time
 * a 10 seconds cache is long enough to avoid multiple calls to the same endpoint and short enough not to reuse outdated data */

const cachedGetNft = _memoizee(arianeeApiClient.network.getNft);
const cachedGetArianeeEvent = _memoizee(arianeeApiClient.network.getArianeeEvent);
const cachedGetMessage = _memoizee(arianeeApiClient.network.getMessage);

const clearAllCachedFunctions = () => {
  cachedGetNft.clear();
  cachedGetArianeeEvent.clear();
  cachedGetMessage.clear();
};

export {
  arianeeApiClient,
  cachedGetArianeeEvent,
  cachedGetNft,
  cachedGetMessage,
  clearAllCachedFunctions,
};
