import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';

describe('Certificate', () => {
    let certificateId;
    let passphrase;
    let arianee: ArianeeWalletBuilder;
    let walletOwner:  ArianeeWallet;
    let walletIssuer:ArianeeWallet;
    let walletRandom:ArianeeWallet;

    beforeAll(async () => {
        try {

            arianee = await new Arianee()
                .setStore({
                    // be sure to not get from cache
                    hasItem: () => Promise.resolve(false),
                    getStoreItem:(key)=>Promise.resolve(undefined),
                    setStoreItem:(key,value)=>Promise.resolve(undefined)
                })
                .init(NETWORK.testnet);

            walletIssuer = arianee.fromPrivateKey(process.env.privateKey);
            walletOwner =  arianee.fromRandomMnemonic();
            walletRandom =  arianee.fromRandomMnemonic();
            console.info("preparing wallets:FAUCET");
            const [result] = await Promise.all([
                walletIssuer.methods.createCertificate({
                    content: certificateContent
                }),
                walletIssuer.methods.requestPoa(),
                walletIssuer.methods.requestAria(),
                walletOwner.methods.requestPoa(),
            ]);

            walletIssuer.methods.buyCredits('certificate', 2);

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

        test('should be able to store content if tokenId does not exist in BC', async (done) => {
            await walletOwner.methods.storeContentInRPCServer(-1, {}, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });
    });
    describe('read', () => {

        test('owner should be able get content', async (done) => {
            const result = await walletOwner.methods.getCertificate(
                certificateId,
                undefined,
            {content: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});


        expect(result.content.data).toEqual(certificateContent);
        done()
        });
        test('not owner should NOT be able get content', async (done) => {


            const result = await walletRandom.methods.getCertificate(certificateId, undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content).toBeUndefined();
            done()
        });

        test('valid arianeeJWT should be able to get content', async (done) => {

            const arianeeJWT = walletOwner.methods.createCertificateArianeeAccessToken(certificateId);


            const result = await walletRandom.methods.getCertificateFromArianeeAccessToken(arianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content.data).toEqual(certificateContent);
            done()
        });

        test('unvalid arianeeJWT should NOT be able to get content', async (done) => {

            const unvalidArianeeJWT = arianee.fromRandomMnemonic().methods.createCertificateArianeeAccessToken(certificateId);

            const result = await walletRandom.methods.getCertificateFromArianeeAccessToken(unvalidArianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content).toBeUndefined();

            done()
        });

        test('issuer should be able to get content even if not owner', async (done) => {

            const result = await walletIssuer.methods.getCertificate(certificateId,
                undefined,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});

            expect(result.content).toBeDefined();
            expect(result.content.data).toEqual(certificateContent);

            done()
        })
    })

});







