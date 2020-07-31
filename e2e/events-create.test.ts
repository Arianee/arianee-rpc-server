import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {eventContent} from "./mocks/eventContent";
import axios from 'axios';

describe('Event', () => {
    const arianeeEventId = 4254908;
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

    test('should be able create content if content is equal to imprint', async (done) => {
        await wallet.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);
        expect(true).toBeTruthy();
        done()
    });


    test('should NOT be able create content if content is not equal to imprint', async (done) => {
        let isInError = false;
        const eventContentClone = cloneDeep(eventContent);
        eventContentClone.title = 'anotherTitle';

        try {
            await wallet.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContentClone, `${process.env.rpcURL}`);

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

        await wallet.methods.storeArianeeEvent(-1, -3, eventContentClone, `${process.env.rpcURL}`);

        expect(true).toBeTruthy();
        done()


    });

    test('should be able to store content ONCE if arianeeEventId does not exist in BC', async (done) => {
        let isInError = false;
        const eventContentClone = cloneDeep(eventContent);
        eventContentClone.title = 'anotherTitle';

        await wallet.methods.storeArianeeEvent(-1, -3, eventContentClone, `${process.env.rpcURL}`);

        expect(true).toBeTruthy();

        let inError = false;
        try {
            // not allowed to create if already exist
            await wallet.methods.storeArianeeEvent(-1, -3, eventContentClone, `${process.env.rpcURL}`);
        } catch (e) {
            inError = true;
        }

        expect(inError).toBeTruthy();
        done()
    })


    test('should be able get content', async (done) => {
        await wallet.methods.storeArianeeEvent(certificateId, arianeeEventId, eventContent, `${process.env.rpcURL}`);

        const result = await wallet.methods.getCertificate(certificateId, undefined,
            {arianeeEvents: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});

        const arianeeEvent = result.events.arianeeEvents.find(d => d.arianeeEventId.toString() === arianeeEventId.toString());

        expect(arianeeEvent.content.data).toEqual(eventContent);
        done()

    })
});
