import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {messageContent} from "./mocks/messageContent";

describe('Message', () => {
    let certificateId
    let messageId;
    let arianee: ArianeeWalletBuilder;
    let wallet: ArianeeWallet;
    beforeAll(async () => {
        arianee = await new Arianee().init(NETWORK.arianeeTestnet);
        wallet = arianee.fromMnemonic("magic direct wrist cook share cliff remember sport endorse march equip earth")
        const certificate = await wallet.methods.createCertificate({content:certificateContent});
        certificateId = certificate.certificateId
        const message = await wallet.methods.createMessage({certificateId,content:messageContent});
        messageId = message.messageId
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
/*
    test('should be able create content if messageId does not exist in bc', async (done) => {
        const certificateClone = cloneDeep(messageContent);
console.log('start3')
        await wallet.methods.storeMessage(-1, certificateClone, process.env.rpcURL);
        expect(true).toBeTruthy();
        console.log('done3')
        done()
    });*/

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
