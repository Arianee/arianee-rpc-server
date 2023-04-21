import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {messageContent} from "./mocks/messageContent";
import axios from "axios";
import {eventContent} from "./mocks/eventContent";

describe('Message', () => {
    let certificateId
    let messageId;
    let arianee: ArianeeWalletBuilder;
    let walletIssuer: ArianeeWallet;
    let walletOwner: ArianeeWallet;
    let walletRandom: ArianeeWallet;
    beforeAll(async () => {
        arianee = await new Arianee().init(NETWORK.arianeeTestnet);
        walletIssuer = arianee.fromMnemonic("magic direct wrist cook share cliff remember sport endorse march equip earth")
        walletOwner =  arianee.fromMnemonic("surge nice nose visa tiger will winner awkward dog admit response gospel");
        walletRandom = arianee.fromRandomMnemonic();
        const certificate = await walletIssuer.methods.createCertificate({content:certificateContent});
        certificateId = certificate.certificateId

        await walletOwner.methods.requestCertificateOwnership(certificateId, certificate.passphrase);

        const message = await walletIssuer.methods.createMessage({certificateId,content:messageContent});
        messageId = message.messageId
    });
    test('should be able create content if content is equal to imprint', async (done) => {
        await walletIssuer.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);
        expect(true).toBeTruthy();
        done()
    });


    test('should NOT be able create content if content is not equal to imprint', async (done) => {
        let isInError = false;
        const certificateClone = cloneDeep(messageContent);
        certificateClone.title = 'anothertitle';
        try {
            await walletIssuer.methods.storeMessage(messageId, certificateClone, `${process.env.rpcURL}`);
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

    test('issuer should be able get content', async (done) => {
        await walletIssuer.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);

        const result = await walletIssuer.methods.getMessage({
            messageId,
            query: {content: true},
            url: 'http://localhost:3000/rpc'
        });

        expect(result.content.data).toEqual(messageContent);
        done()

    })

    test('owner should be able get content', async (done) => {
        await walletIssuer.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);

        const result = await walletOwner.methods.getMessage({
            messageId,
            query: {content: true},
            url: 'http://localhost:3000/rpc'
        });

        expect(result.content.data).toEqual(messageContent);
        done()

    })

    test('random should not be able get content', async (done) => {
        await walletIssuer.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);

        const result = await walletRandom.methods.getMessage({
            messageId,
            query: {content: true},
            url: 'http://localhost:3000/rpc'
        }).catch(e=>undefined);

        expect(result).toBeUndefined();
        done()

    })


    test('random with wallet access token should be able get content', async (done) => {
        await walletIssuer.methods.storeMessage(messageId, messageContent, `${process.env.rpcURL}`);
        const arianeeJWT = await walletOwner.methods.createWalletAccessToken();

        const result = await axios.post('http://localhost:3000/rpc', {
            jsonrpc: '2.0',
            method: "message.read",
            params: {
                messageId,
                authentification: {bearer : arianeeJWT}
            },
            id: '1'
        })

        expect(result.data.result).toEqual(messageContent);
        done()
    })

});
