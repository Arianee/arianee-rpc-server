import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import axios from 'axios';

describe('Certificate', () => {
    const certificateId = 7371300;
    let arianee: ArianeeWalletBuilder;
    let wallet: ArianeeWallet;
    beforeAll(async () => {
        arianee = await new Arianee().init(NETWORK.testnet);
        wallet = arianee.fromPrivateKey(process.env.privateKey)
    });

    beforeEach(async () => {
        await axios(process.env.resetURL);
    });

    describe('create content', () => {

        test('should be able create content if content is equal to imprint', async (done) => {
            await wallet.methods.storeContentInRPCServer(certificateId, certificateContent, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });

        test('should be able create content if content is equal to imprint (even if not owner)', async (done) => {
            await arianee.fromRandomMnemonic().methods.storeContentInRPCServer(certificateId, certificateContent, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        });

        test('should NOT be able create content if content is not equal to imprint', async (done) => {
            let isInError = false;
            const certificateClone = cloneDeep(certificateContent);
            certificateClone.name = 'anotherName';

            try {

                await wallet.methods.storeContentInRPCServer(certificateId, certificateClone, `${process.env.rpcURL}`);
            } catch (e) {
                isInError = true;
            }
            expect(isInError).toBeTruthy();
            done()


        });

        test('should be able to store content if tokenId does not exist in BC', async (done) => {
            await wallet.methods.storeContentInRPCServer(-1, {}, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();
            done()
        })

        test('should be able to store content ONCE if tokenId does not exist in BC', async (done) => {
            await wallet.methods.storeContentInRPCServer(-1, {}, `${process.env.rpcURL}`);
            expect(true).toBeTruthy();

            let inError = false;
            try {
                // not allowed to create if already exist
                await wallet.methods.storeContentInRPCServer(-1, {}, `${process.env.rpcURL}`);
            } catch (e) {
                inError = true;
            }

            expect(inError).toBeTruthy();
            done()
        })
    });

    describe('read', () => {

        beforeEach(async () => {
            await wallet.methods.storeContentInRPCServer(certificateId, certificateContent, process.env.rpcURL);
        });

        test('owner should be able get content', async (done) => {

            const result = await wallet.methods.getCertificate(certificateId, undefined,
            {content: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});

        expect(result.content.data).toEqual(certificateContent);
        done()
        });

        test('not owner should NOT be able get content', async (done) => {
            const notOwnerWallet = arianee.fromRandomMnemonic();


            const result = await notOwnerWallet.methods.getCertificate(certificateId, undefined,
                {content: true, issuer: {rpcURI:process.env.rpcURL}});


            expect(result.content).toBeUndefined();
            done()
        });

        test('valid arianeeJWT should be able to get content', async (done) => {

            const arianeeJWT = wallet.methods.createCertificateArianeeProofToken(certificateId);
            const notOwnerWallet = arianee.fromRandomMnemonic();


            const result = await notOwnerWallet.methods.getCertificateFromArianeeProofToken(arianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content.data).toEqual(certificateContent);
            done()
        });

        test('unvalid arianeeJWT should NOT be able to get content', async (done) => {

            const unvalidArianeeJWT = arianee.fromRandomMnemonic().methods.createCertificateArianeeProofToken(certificateId);
            const notOwnerWallet = arianee.fromRandomMnemonic();


            const result = await notOwnerWallet.methods.getCertificateFromArianeeProofToken(unvalidArianeeJWT,
                {content: true, issuer: {rpcURI: process.env.rpcURL}});


            expect(result.content).toBeUndefined();

            done()
        })
    })

});







