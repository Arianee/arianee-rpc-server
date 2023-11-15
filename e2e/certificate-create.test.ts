import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {ArianeeAccessToken} from "@arianee/arianee-access-token";
import Core from "@arianee/core";
import {ArianeePrivacyGatewayClient}
    from "@arianee/arianee-privacy-gateway-client";
import Wallet from "@arianee/wallet";
import Creator from "@arianee/creator";


describe('Certificate', () => {
    let certificateId;
    let passphrase;

    let arianeePrivacyGatewayClientRandom:ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientOwner:ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientIssuer:ArianeePrivacyGatewayClient;

    let arianeeAccessTokenOwner:ArianeeAccessToken;
    let arianeeAccessTokenIssuer:ArianeeAccessToken;
    let arianeeAccessTokenRandom:ArianeeAccessToken;

    const ownerMnemonic = process.env.OWNERMNEMONIC;
    const issuerMnemonic = process.env.ISSUERMNEMONIC;


    beforeAll(async () => {
        try {
            const issuerCore = Core.fromMnemonic(issuerMnemonic)
            const randomCore = Core.fromRandom();
            const ownerCore = Core.fromMnemonic(ownerMnemonic);

            arianeePrivacyGatewayClientOwner = new ArianeePrivacyGatewayClient(ownerCore)
            arianeePrivacyGatewayClientRandom = new ArianeePrivacyGatewayClient(randomCore);
            arianeePrivacyGatewayClientIssuer = new ArianeePrivacyGatewayClient(issuerCore);

            arianeeAccessTokenOwner = new ArianeeAccessToken(ownerCore)
            arianeeAccessTokenIssuer = new ArianeeAccessToken(issuerCore)
            arianeeAccessTokenRandom = new ArianeeAccessToken(randomCore)

            console.info("preparing wallets:FAUCET");
            console.info("preparing wallets: creating certificate");


            certificateId = 51628187;
            passphrase = "5mwtxt2sesau"

            console.info(`preparing wallets:  ${certificateId} ${passphrase}`);

            console.log('preparing wallets: requesting ownership');
            await arianeePrivacyGatewayClientRandom.certificateCreate(process.env.rpcURL, {certificateId, content: certificateContent})

        } catch (e) {
            console.error(e);
        }
    });
    describe('create content', () => {
        test(' should be able create content if content is equal to imprint', async () => {
            await arianeePrivacyGatewayClientRandom.certificateCreate(process.env.rpcURL, {certificateId, content: certificateContent});
            expect(true).toBeTruthy();

        });
        test('should be able create content if content is equal to imprint (even if not owner)', async () => {
            await arianeePrivacyGatewayClientRandom.certificateCreate(process.env.rpcURL, {certificateId, content: certificateContent});
            expect(true).toBeTruthy();

        });

        test('should NOT be able create content if content is not equal to imprint', async () => {
            const certificateClone = cloneDeep(certificateContent);
            certificateClone.name = 'anotherName';

            const result = await arianeePrivacyGatewayClientRandom.certificateCreate(process.env.rpcURL, {certificateId, content: certificateClone});
            expect(result.error.message).toEqual("Imprint does not match content")
        });

    });
    describe('read', () => {

        test('owner should be able get content', async () => {
            const result = await arianeePrivacyGatewayClientOwner.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toEqual(certificateContent);
        });
        test('not owner should NOT be able get content', async () => {
            const result = await arianeePrivacyGatewayClientRandom.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeUndefined();

        });

        test('valid arianeeJWT should be able to get content', async () => {
            const jwt = await arianeeAccessTokenOwner.createCertificateArianeeAccessToken(certificateId, 'mainnet')
            const aatapgc = new ArianeePrivacyGatewayClient(jwt);
            const result = await aatapgc.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toEqual(certificateContent);

        });

        test('unvalid arianeeJWT should NOT be able to get content', async () => {
            const arianeeAccessTokenRandom = new ArianeeAccessToken(Core.fromRandom())
            const unvalidArianeeJWT = await arianeeAccessTokenRandom.createCertificateArianeeAccessToken(certificateId, 'mainnet');
            const aatapgc = new ArianeePrivacyGatewayClient(unvalidArianeeJWT);
            const result = await aatapgc.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeUndefined();


        });

        test('valid arianeeAccessToken with prefix should be able to get content', async () => {

            const arianeeJWT = await arianeeAccessTokenOwner.createWalletAccessToken({}, "the prefix")
            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)

            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId});

            expect(result).toEqual(certificateContent);

        });

        test('valid arianeeAccessToken without prefix should be able to get content', async () => {

            const core = Core.fromMnemonic(ownerMnemonic);
            const aat = new ArianeeAccessToken(core)
            const arianeeJWT = await aat.createWalletAccessToken()
            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)

            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId});

            expect(result).toEqual(certificateContent);

        });

        test('issuer should be able to get content even if not owner', async () => {
            const result = await arianeePrivacyGatewayClientIssuer.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeDefined();
            expect(result).toEqual(certificateContent);


        })

        test('owner should be able to get content with WalletAccessToken from owner', async () => {
            const arianeeJWT = await arianeeAccessTokenOwner.createWalletAccessToken();

            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)
            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeDefined();
            expect(result).toEqual(certificateContent);
        })

        test('owner should be able to get content with WalletAccessToken from issuer', async () => {
            const arianeeJWT = await arianeeAccessTokenIssuer.createWalletAccessToken();

            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)
            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeDefined();
            expect(result).toEqual(certificateContent);
        })

        test('random shouldn\'t be able to get content with WalletAccessToken', async () => {
            const arianeeJWT = await arianeeAccessTokenRandom.createWalletAccessToken()

            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)
            const result = await  apgClient.certificateRead(process.env.rpcURL, {certificateId})

            expect(result).toBeUndefined();
        })

    })

});







