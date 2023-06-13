import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {ArianeeAccessToken} from "@arianee/arianee-access-token";
import Core from "@arianee/core";
import ArianeePrivacyGatewayClient
    from "@arianee/arianee-privacy-gateway-client/src/lib/arianee-privacy-gateway-client";

describe('Certificate', () => {
    let certificateId;
    let passphrase;
    let arianee: ArianeeWalletBuilder;
    let walletOwner:  ArianeeWallet;
    let walletIssuer:ArianeeWallet;
    let walletRandom:ArianeeWallet;

    const ownerMnemonic = "surge nice nose visa tiger will winner awkward dog admit response gospel"


    beforeAll(async () => {
        try {

            arianee = await new Arianee()
                .setStore({
                    // be sure to not get from cache
                    hasItem: () => Promise.resolve(false),
                    getStoreItem:(key)=>Promise.resolve(undefined),
                    setStoreItem:(key,value)=>Promise.resolve(undefined)
                })
                .init(NETWORK.arianeeTestnet);

            walletIssuer = arianee.fromMnemonic("magic direct wrist cook share cliff remember sport endorse march equip earth");
            walletOwner =  arianee.fromMnemonic(ownerMnemonic);
            walletRandom =  arianee.fromRandomMnemonic();
            console.info("preparing wallets:FAUCET");
            const result = await walletIssuer.methods.createCertificate({
                    content: certificateContent
                });


            console.info("preparing wallets: creating certificate");


            certificateId = result.certificateId;
            passphrase = result.passphrase;

            console.info(`preparing wallets: DONE ${certificateId} ${passphrase}`);

            console.log('preparing wallets: requesting ownership');
            await Promise.all([
                walletOwner.methods.requestCertificateOwnership(certificateId, passphrase),
                walletRandom.methods.storeContentInRPCServer(certificateId, certificateContent, process.env.rpcURL)
            ])

        } catch (e) {
            console.error(e);
        }
    });
    describe('create content', () => {
        test(' should be able create content if content is equal to imprint', async (done) => {
            await walletRandom.methods.storeContentInRPCServer(certificateId, certificateContent, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });
        test('should be able create content if content is equal to imprint (even if not owner)', async (done) => {
            await walletRandom.methods.storeContentInRPCServer(certificateId, certificateContent, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });

        test('should NOT be able create content if content is not equal to imprint', async (done) => {
            let isInError = false;
            const certificateClone = cloneDeep(certificateContent);
            certificateClone.name = 'anotherName';

            try {

                await walletRandom.methods.storeContentInRPCServer(certificateId, certificateClone, `${process.env.rpcURL}`);
            } catch (e) {
                isInError = true;
            }
            expect(isInError).toBeTruthy();
            done()


        });

        /*test('should be able to store content if tokenId does not exist in BC', async (done) => {
            await walletOwner.methods.storeContentInRPCServer(-1, {}, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });*/
    });
    describe('read', () => {

        test('owner should be able get content', async (done) => {

            const result = await walletOwner.methods.getCertificate(
                certificateId,
                undefined,
            {content: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});


            expect(result.content.raw).toEqual(certificateContent);
        done()
        });
        test('not owner should NOT be able get content', async (done) => {
            const result = await walletRandom.methods.getCertificate(certificateId, undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});

            expect(result.content.raw).toBeUndefined();
            done()
        });

        test('valid arianeeJWT should be able to get content', async (done) => {
            const arianeeJWT = await walletOwner.methods.createCertificateArianeeAccessToken(certificateId);

            const result = await walletRandom.methods.getCertificateFromArianeeAccessToken(arianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});

            expect(result.content.raw).toEqual(certificateContent);
            done()
        });

        test('unvalid arianeeJWT should NOT be able to get content', async (done) => {
            const unvalidArianeeJWT = await arianee.fromRandomMnemonic().methods.createCertificateArianeeAccessToken(certificateId);
            const result = await walletRandom.methods.getCertificateFromArianeeAccessToken(unvalidArianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content.raw).toBeUndefined();

            done()
        });

        test('valid arianeeAccessToken with prefix should be able to get content', async (done) => {

            const core = Core.fromMnemonic(ownerMnemonic);
            const aat = new ArianeeAccessToken(core)
            const arianeeJWT = await aat.createWalletAccessToken({}, "the prefix")
            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)

            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId});

            expect(result).toEqual(certificateContent);
            done()
        });

        test('valid arianeeAccessToken without prefix should be able to get content', async (done) => {

            const core = Core.fromMnemonic(ownerMnemonic);
            const aat = new ArianeeAccessToken(core)
            const arianeeJWT = await aat.createWalletAccessToken()
            const apgClient = new ArianeePrivacyGatewayClient(arianeeJWT)

            const result = await apgClient.certificateRead(process.env.rpcURL, {certificateId});

            expect(result).toEqual(certificateContent);
            done()
        });

        test('issuer should be able to get content even if not owner', async (done) => {

            const result = await walletIssuer.methods.getCertificate(certificateId,
                undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});

            expect(result.content).toBeDefined();
            expect(result.content.raw).toEqual(certificateContent);

            done()
        })

        test('owner should be able to get content with WalletAccessToken from owner', async (done) => {
            const arianeeJWT = await walletOwner.methods.createWalletAccessToken();

            const result = await walletRandom.methods.getCertificate(
                certificateId,
                undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}, advanced:{arianeeProofToken:arianeeJWT}});

            expect(result.content).toBeDefined();
            expect(result.content.raw).toEqual(certificateContent);
            done()

        })

        test('owner should be able to get content with WalletAccessToken from issuer', async (done) => {
            const arianeeJWT = await walletIssuer.methods.createWalletAccessToken();

            const result = await walletRandom.methods.getCertificate(
                certificateId,
                undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}, advanced:{arianeeProofToken:arianeeJWT}});

            expect(result.content).toBeDefined();
            expect(result.content.raw).toEqual(certificateContent);
            done()

        })

        test('random shouldn\'t be able to get content with WalletAccessToken', async (done) => {
            const arianeeJWT = await walletRandom.methods.createWalletAccessToken();

            const result = await walletRandom.methods.getCertificate(
                certificateId,
                undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}, advanced:{arianeeProofToken:arianeeJWT}});

            expect(result.content.raw).toBeUndefined();
            done()

        })

    })

});







