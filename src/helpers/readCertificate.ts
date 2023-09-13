import { CertificatePayload } from '../rpc/models/certificates';
import { SyncFunc } from '../rpc/models/func';
import { ErrorEnum, getError } from '../rpc/errors/error';
import { ReadConfiguration } from '../rpc/models/readConfiguration';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ArianeeApiClient } from '@arianee/arianee-api-client';

export const readCertificate = async (
  data: CertificatePayload,
  callback: SyncFunc,
  configuration: ReadConfiguration
) => {
  const { fetchItem, arianeeWallet } = configuration;
  const arianeeApiClient = new ArianeeApiClient();
  const successCallBack = async () => {
    try {
      const content = await fetchItem(certificateId);
      return callback(null, content);
    } catch (err) {
      return callback(getError(ErrorEnum.MAINERROR));
    }
  };

  const tempWallet = await arianeeWallet;

  const { certificateId, authentification } = data;
  const { message, signature, bearer } = authentification;

  const { issuer, owner, requestKey, viewKey, proofKey } = await arianeeApiClient.network.getNft(
    tempWallet.configuration.networkName,
    certificateId
  );
  const keys = [requestKey, viewKey, proofKey];

  if (bearer) {
    let payload;
    try {
      payload = ArianeeAccessToken.decodeJwt(bearer).payload; // decode test that aat is valid and throw if not
    } catch (e) {
      return callback(getError(ErrorEnum.WRONGJWT));
    }

    const payloadIssuer = payload.iss.toLowerCase();
    const ownerAddress = owner.toLowerCase();
    const issuerAddress = issuer.toLowerCase();

    if (
      +payload.subId === +certificateId &&
      (payloadIssuer === ownerAddress || payloadIssuer === issuerAddress)
    ) {
      return successCallBack();
    } else if (
      payload.sub === 'wallet' &&
      (payloadIssuer === ownerAddress || payloadIssuer === issuerAddress)
    ) {
      return successCallBack();
    } else {
      return callback(getError(ErrorEnum.WRONGJWT));
    }
  }

  if (message && signature) {
    const publicAddressOfSender = tempWallet.web3.eth.accounts.recover(message, signature);

    const parsedMessage = JSON.parse(message);

    if (+parsedMessage.certificateId !== +certificateId) {
      return callback(getError(ErrorEnum.WRONGCERTIFICATEID));
    }

    const isSignatureTooOld =
      (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 > 300;

    if (isSignatureTooOld) {
      return callback(getError(ErrorEnum.SIGNATURETOOOLD));
    }

    if (owner === publicAddressOfSender) {
      return successCallBack();
    }

    if (issuer === publicAddressOfSender) {
      return successCallBack();
    }

    if (keys.includes(publicAddressOfSender)) {
      return successCallBack();
    }
  }

  return callback(getError(ErrorEnum.MAINERROR));
};
