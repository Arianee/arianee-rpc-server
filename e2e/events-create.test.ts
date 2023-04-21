import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {eventContent} from "./mocks/eventContent";
import axios from "axios";

describe('Event', () => {

    let certificateId;
    let passphrase;
    let arianee: ArianeeWalletBuilder;
    let walletOwner:  ArianeeWallet;
    let walletIssuer:ArianeeWallet;
    let walletRandom:ArianeeWallet;
    let arianeeEventId;

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
            walletOwner =  arianee.fromMnemonic("surge nice nose visa tiger will winner awkward dog admit response gospel");
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
            const arianeeEvent = await walletIssuer.methods.createAndStoreArianeeEvent({certificateId, content:eventContent}, process.env.rpcURL);
            await walletOwner.methods.requestCertificateOwnership(certificateId, passphrase);
            await walletRandom.methods.storeContentInRPCServer(certificateId, certificateContent, process.env.rpcURL);
            arianeeEventId = arianeeEvent.arianeeEventId
        } catch (e) {
            console.error(e);
        }
    });

    test('should be able create content if content is equal to imprint', async (done) => {
        await walletIssuer.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);
        expect(true).toBeTruthy();
        done()
    });


    test('should NOT be able create content if content is not equal to imprint', async (done) => {
        let isInError = false;
        const eventContentClone = cloneDeep(eventContent);
        eventContentClone.title = 'anotherTitle';

        try {
            await walletIssuer.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContentClone, `${process.env.rpcURL}`);
        } catch (e) {
            isInError = true;
        }
        expect(isInError).toBeTruthy();
        done()


    });

    test('should be able create content if tokenId or arianeeEventId does not exist on BC', async (done) => {
        let isInError = false;
        const eventContentClone = cloneDeep(eventContent);
        eventContentClone.title = 'anotherTitle';

        await walletIssuer.methods.storeArianeeEvent(-1, -3, eventContentClone, `${process.env.rpcURL}`);

        expect(true).toBeTruthy();
        done()


    });
    test('should be able get content (owner wallet)', async (done) => {
        await walletOwner.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);

        const result = await walletOwner.methods.getCertificate(certificateId, undefined,
            {arianeeEvents: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});

        const arianeeEvent = result.events.arianeeEvents.find(d => d.arianeeEventId.toString() === arianeeEventId.toString());

        expect(arianeeEvent.content.data).toEqual(eventContent);
        done()

    })
    test('should be able get content (issuer wallet)', async (done) => {
        await walletIssuer.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);

        const result = await walletIssuer.methods.getCertificate(certificateId, undefined,
            {arianeeEvents: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});

        const arianeeEvent = result.events.arianeeEvents.find(d => d.arianeeEventId.toString() === arianeeEventId.toString());

        expect(arianeeEvent.content.data).toEqual(eventContent);
        done()

    })


    test('should NOT be able get content (random wallet)', async (done) => {
        await walletRandom.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);

        const result = await walletRandom.methods.getCertificate(certificateId, undefined,
            {arianeeEvents: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});

        const arianeeEvent = result.events.arianeeEvents.find(d => d.arianeeEventId.toString() === arianeeEventId.toString());

        expect(arianeeEvent.content.data).toBeUndefined();
        done()

    })

    test('should be able get content with wallet access token from owner', async (done) => {
        await walletIssuer.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);
        const arianeeJWT = await walletOwner.methods.createWalletAccessToken();


        const result = await axios.post('http://localhost:3000/rpc', {
            jsonrpc: '2.0',
            method: "event.read",
            params: {
                certificateId: certificateId,
                eventId:arianeeEventId,
                authentification: {bearer : arianeeJWT}
            },
            id: '1'
        })

        expect(result.data.result).toEqual(eventContent);
        done()
    })

    test('should be able get content with wallet access token from issuer', async (done) => {
        await walletIssuer.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);
        const arianeeJWT = await walletIssuer.methods.createWalletAccessToken();


        const result = await axios.post('http://localhost:3000/rpc', {
            jsonrpc: '2.0',
            method: "event.read",
            params: {
                certificateId: certificateId,
                eventId:arianeeEventId,
                authentification: {bearer : arianeeJWT}
            },
            id: '1'
        })

        expect(result.data.result).toEqual(eventContent);
        done()
    })

});
