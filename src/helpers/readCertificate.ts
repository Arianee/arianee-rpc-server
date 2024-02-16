import {CertificatePayload} from '../rpc/models/certificates';
import {SyncFunc} from '../rpc/models/func';
import {ErrorEnum, getError} from '../rpc/errors/error';
import {ReadConfiguration} from '../rpc/models/readConfiguration';
import {ArianeeAccessToken} from '@arianee/arianee-access-token';
import {ArianeeApiClient} from '@arianee/arianee-api-client';
import {ethers} from 'ethers';
const arianeeApiClient = new ArianeeApiClient();

export const readCertificate = async (
    data: CertificatePayload,
    callback: SyncFunc,
    configuration: ReadConfiguration
) => {
    const {fetchItem, network} = configuration;



    const {certificateId, authentification} = data;
    const {message, signature, bearer} = authentification;

    const {issuer, owner, requestKey, viewKey, proofKey, imprint} = await arianeeApiClient.network.getNft(
        network,
        certificateId
    );

    const successCallBack = async () => {
        try {
            const content = await fetchItem(certificateId, imprint);
            return callback(null, content);
        } catch (err) {
            return callback(getError(ErrorEnum.MAINERROR));
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
            return callback(getError(ErrorEnum.WRONGJWT));
        }

        const lowercasedPayloadIssuer = payload.iss.toLowerCase();

        if (
            +payload.subId === +certificateId &&
            (lowercasedPayloadIssuer === lowercasedOwner || lowercasedPayloadIssuer === lowercasedIssuer)
        ) {
            return successCallBack();
        } else if (
            payload.sub === 'wallet' &&
            (lowercasedPayloadIssuer === lowercasedOwner || lowercasedPayloadIssuer === lowercasedIssuer)
        ) {
            return successCallBack();
        } else {
            return callback(getError(ErrorEnum.WRONGJWT));
        }
    }

    if (message && signature) {
        const lowercasedPublicKeyOfSigner = (
            ethers.verifyMessage(message, signature) ?? ''
        ).toLowerCase();

        const parsedMessage = JSON.parse(message);

        if (+parsedMessage.certificateId !== +certificateId) {
            return callback(getError(ErrorEnum.WRONGCERTIFICATEID));
        }

        const isSignatureTooOld =
            (new Date().getTime() - new Date(message.timestamp).getTime()) / 1000 > 300;

        if (isSignatureTooOld) {
            return callback(getError(ErrorEnum.SIGNATURETOOOLD));
        }

        if (lowercasedOwner === lowercasedPublicKeyOfSigner) {
            return successCallBack();
        }

        if (lowercasedIssuer === lowercasedPublicKeyOfSigner) {
            return successCallBack();
        }

        if (lowercasedKeys.includes(lowercasedPublicKeyOfSigner)) {
            return successCallBack();
        }
    }

    return callback(getError(ErrorEnum.MAINERROR));
};
