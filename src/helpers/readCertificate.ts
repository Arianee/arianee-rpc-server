import { CertificatePayload } from '../rpc/models/certificates';
import { SyncFunc } from '../rpc/models/func';
import { getError } from '../rpc/errors/error';
import { ReadConfiguration } from '../rpc/models/readConfiguration';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { ethers } from 'ethers';
import { PrivacyGatewayErrorEnum } from '@arianee/common-types';
import { cachedGetNft } from './cache/cachedApiClient/cachedApiClient';

export const readCertificate = async (
  data: CertificatePayload,
  callback: SyncFunc,
  configuration: ReadConfiguration
) => {
  try {
    const {fetchItem, network} = configuration;

    const {certificateId, authentification} = data;
    const {message, signature, bearer} = authentification;

    const {issuer, owner, requestKey, viewKey, proofKey, imprint} =
        await cachedGetNft(network, certificateId);

    const successCallBack = async () => {
      try {
        const content = await fetchItem(certificateId, imprint);
        return callback(null, content);
      } catch (err) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }
    };

    const lowercasedKeys = [requestKey, viewKey, proofKey].map((k) => (k ?? '').toLowerCase());

    const lowercasedOwner = owner.toLowerCase();
    const lowercasedIssuer = issuer.toLowerCase();

    if (bearer) {
      let payload;
      try {
        payload = ArianeeAccessToken.decodeJwt(bearer).payload; // decode test that aat is valid and throw if not
      } catch (e) {
        return callback(getError(PrivacyGatewayErrorEnum.WRONGJWT));
      }

      const lowercasedPayloadIssuer = payload.iss.toLowerCase();
      const isOwnerOrIssuerOfNft =
          lowercasedPayloadIssuer === lowercasedOwner || lowercasedPayloadIssuer === lowercasedIssuer;

      if (!isOwnerOrIssuerOfNft) {
        return callback(getError(PrivacyGatewayErrorEnum.NOTOWNERORISSUER));
      }

      if (+payload.subId === +certificateId) {
        return successCallBack();
      } else if (payload.sub === 'wallet') {
        return successCallBack();
      } else {
        return callback(getError(PrivacyGatewayErrorEnum.WRONGJWT));
      }
    }

    if (message && signature) {
      const lowercasedPublicKeyOfSigner = (
          ethers.verifyMessage(message, signature) ?? ''
      ).toLowerCase();

      const parsedMessage = JSON.parse(message);

      if (+parsedMessage.certificateId !== +certificateId) {
        return callback(getError(PrivacyGatewayErrorEnum.WRONGCERTIFICATEID));
      }

      const isSignatureTooOld =
          (new Date().getTime() - new Date(parsedMessage.timestamp).getTime()) / 1000 > 300;

      if (isSignatureTooOld) {
        return callback(getError(PrivacyGatewayErrorEnum.SIGNATURETOOOLD));
      }

      if (lowercasedOwner === lowercasedPublicKeyOfSigner) {
        return successCallBack();
      } else if (lowercasedIssuer === lowercasedPublicKeyOfSigner) {
        return successCallBack();
      } else if (lowercasedKeys.includes(lowercasedPublicKeyOfSigner)) {
        return successCallBack();
      } else {
        return callback(getError(PrivacyGatewayErrorEnum.NOTOWNERORISSUER));
      }
    }

    return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
  }
  catch (e) {
    return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
  }
};
