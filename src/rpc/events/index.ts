import { RPCNAME } from '../rpc-name';
import { EventPayload, EventPayloadCreate } from '../models/events';
import { getError } from '../errors/error';
import { callBackFactory } from '../libs/callBackFactory';
import { ReadConfiguration } from '../models/readConfiguration';
import { ArianeeAccessToken } from '@arianee/arianee-access-token';
import { calculateImprint } from '../../helpers/calculateImprint';
import { ethers } from 'ethers';
import { ArianeeProtocolClient, callWrapper } from '@arianee/arianee-protocol-client';
import Core from '@arianee/core';
import { PrivacyGatewayErrorEnum } from '@arianee/common-types';
import {
  cachedGetArianeeEvent,
  cachedGetNft,
} from '../../helpers/cache/cachedApiClient/cachedApiClient';

const eventRPCFactory = (configuration: ReadConfiguration) => {
  const { fetchItem, createItem, network, createWithoutValidationOnBC } = configuration;
  const core = Core.fromRandom();
  const arianeeProtocolClient = new ArianeeProtocolClient(core);
  const create = async (data: EventPayloadCreate, callback) => {
    const { eventId, json } = data;

    const [successCallBack, successCallbackWithoutValidation] = callBackFactory(callback)([
      () => createItem(eventId, json),
      () => createWithoutValidationOnBC(eventId, json),
    ]);

    const event = await callWrapper(arianeeProtocolClient, configuration.network, {
      protocolV1Action: async (protocolV1) =>
        protocolV1.eventContract
          .getFunction('getEvent')(eventId)
          .catch(() => undefined),
      protocolV2Action: async (protocolV2) => {
        throw new Error('not yet implemented');
      },
    });

    if (event === undefined && createWithoutValidationOnBC) {
      return successCallbackWithoutValidation();
    } else {
      try {
        const imprint = event[1];
        const calculatedImprint = await calculateImprint(json);
        if (imprint === calculatedImprint) {
          return successCallBack();
        } else {
          return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
        }
      } catch (err) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }
    }
  };

  const read = async (data: EventPayload, callback) => {
    const successCallBack = async () => {
      try {
        const content = await fetchItem(eventId);
        return callback(null, content);
      } catch (err) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }
    };

    const { certificateId, authentification, eventId } = data;
    const { message, signature, bearer } = authentification;

    const { issuer, owner, requestKey, viewKey, proofKey } = await cachedGetNft(
      network,
      certificateId
    );

    if (bearer) {
      let payload;
      try {
        payload = ArianeeAccessToken.decodeJwt(bearer).payload; // decode test that aat is valid and throw if not
      } catch (e) {
        return callback(getError(PrivacyGatewayErrorEnum.WRONGJWT));
      }

      const payloadIssuerLowerCase = payload.iss.toLowerCase();
      const nftOwnerLowerCase = owner.toLowerCase();
      const nftIssuerLowerCase = issuer.toLowerCase();

      if (
        payload.subId === certificateId &&
        (payloadIssuerLowerCase === nftOwnerLowerCase ||
          payloadIssuerLowerCase === nftIssuerLowerCase)
      ) {
        return successCallBack();
      } else if (
        payload.sub === 'wallet' &&
        (payloadIssuerLowerCase === nftOwnerLowerCase ||
          payloadIssuerLowerCase === nftIssuerLowerCase)
      ) {
        return successCallBack();
      } else {
        return callback(getError(PrivacyGatewayErrorEnum.WRONGJWT));
      }
    }

    if (message && signature) {
      const publicAddressOfSender = ethers.verifyMessage(message, signature);

      const parsedMessage = JSON.parse(message);

      if (parsedMessage.certificateId !== certificateId) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }

      const isSignatureTooOld =
        (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 > 300;

      if (isSignatureTooOld) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }

      // Is the event exist
      try {
        await cachedGetArianeeEvent(configuration.network, eventId);
      } catch (err) {
        return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
      }

      // Is user the owner of this certificate
      if (owner.toLowerCase() === publicAddressOfSender.toLowerCase()) {
        return successCallBack();
      }

      // Is user the issuer of this certificate

      if (issuer.toLowerCase() === publicAddressOfSender.toLowerCase()) {
        return successCallBack();
      }

      const lowercasedKeys = [requestKey, viewKey, proofKey].map((k) => (k ?? '').toLowerCase());
      if (lowercasedKeys.includes(publicAddressOfSender.toLowerCase())) {
        return successCallBack();
      }
    }

    return callback(getError(PrivacyGatewayErrorEnum.MAINERROR));
  };

  return {
    [RPCNAME.event.create]: create,
    [RPCNAME.event.read]: read,
  };
};

export { eventRPCFactory };
