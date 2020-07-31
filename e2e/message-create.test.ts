import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {cloneDeep} from 'lodash';
import {messageContent} from "./mocks/messageContent";

import axios from 'axios';


describe('Message', () => {
    const certificateId = 7371300;
    let messageId = 728720;
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
        await wallet.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);
        expect(true).toBeTruthy();
        done()
    });


    test('should NOT be able create content if content is not equal to imprint', async (done) => {
        let isInError = false;
        const certificateClone = cloneDeep(messageContent);
        certificateClone.title = 'anothertitle';

        try {
            await wallet.methods.storeMessage(messageId, certificateClone, `${process.env.rpcURL}`);
        } catch (e) {
            isInError = true;
        }
        expect(isInError).toBeTruthy();
        done()


    });

    test('should be able create content if messageId does not exist in bc', async (done) => {
        const certificateClone = cloneDeep(messageContent);

        await wallet.methods.storeMessage(-1, certificateClone, process.env.rpcURL);
        expect(true).toBeTruthy();
        done()
    });

    test('should be able create content ONCE if messageId does not exist in bc', async (done) => {
        const certificateClone = cloneDeep(messageContent);

        // allowed to create ONCE
        await wallet.methods.storeMessage(-2, certificateClone, process.env.rpcURL);

        let inError=false;
        try{
            // not allowed to create if already exist
            await wallet.methods.storeMessage(-2, certificateClone, process.env.rpcURL);
        }catch(e){
            inError=true;
        }

        expect(inError).toBeTruthy()
        done()
    });

    test('should be able get content', async (done) => {
        await wallet.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);

        const result = await wallet.methods.getMessage({
            messageId,
            query: {content: true},
            url: 'http://localhost:3000/rpc'
        });

        expect(result.content.data).toEqual(messageContent);
        done()

    })
});
