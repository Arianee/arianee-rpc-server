import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {messageContent} from "./mocks/messageContent";
import {eventContent} from "./mocks/eventContent";
import Core from "@arianee/core";
import Wallet from "@arianee/wallet";
import Creator from "@arianee/creator";
import {ArianeePrivacyGatewayClient} from "@arianee/arianee-privacy-gateway-client";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";

describe('Message', () => {
    let certificateId
    let messageId;
    let arianeePrivacyGatewayClientOwner:   ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientRandom: ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientIssuer: ArianeePrivacyGatewayClient;

    let arianeeAccessTokenOwner: ArianeeAccessToken
    const ownerMnemonic = process.env.OWNERMNEMONIC;
    const issuerMnemonic = process.env.ISSUERMNEMONIC;

    beforeAll(async () => {
        const issuerCore = Core.fromMnemonic(issuerMnemonic)
        const randomCore = Core.fromRandom();
        const ownerCore = Core.fromMnemonic(ownerMnemonic);


        arianeePrivacyGatewayClientOwner = new ArianeePrivacyGatewayClient(ownerCore);
        arianeePrivacyGatewayClientRandom = new ArianeePrivacyGatewayClient(randomCore);
        arianeePrivacyGatewayClientIssuer = new ArianeePrivacyGatewayClient(issuerCore);

        arianeeAccessTokenOwner = new ArianeeAccessToken(ownerCore);

        certificateId = 51628187;
        messageId =814092728

        await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: messageId, content: messageContent});


    });
    test('should be able create content if content is equal to imprint', async () => {
        arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: messageContent});
        expect(true).toBeTruthy();

    });


    test('should NOT be able create content if content is not equal to imprint', async () => {
        const certificateClone = cloneDeep(messageContent);
        certificateClone.title = 'anothertitle';
        const result = await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: certificateClone});
        expect(result.error.message).toEqual("Imprint does not match content")
    });
/*
    test('should be able create content if messageId does not exist in bc', async () => {
        const certificateClone = cloneDeep(messageContent);
console.log('start3')
        await wallet.methods.storeMessage(-1, certificateClone, process.env.rpcURL);
        expect(true).toBeTruthy();
        console.log('3')

    });*/

    test('issuer should be able get content', async () => {
        await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: messageContent});

        const result = await arianeePrivacyGatewayClientIssuer.messageRead(process.env.rpcURL, { messageId: messageId});
        expect(result).toEqual(messageContent);
    })

    test('owner should be able get content', async () => {
        await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: messageContent});

        const result = await arianeePrivacyGatewayClientOwner.messageRead(process.env.rpcURL, { messageId: ""+messageId});
        expect(result).toEqual(messageContent);
    })

    test('random should not be able get content', async () => {
        await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: messageContent});

        const result = await arianeePrivacyGatewayClientRandom.messageRead(process.env.rpcURL, { messageId: ""+messageId});
        expect(result).toBeUndefined();
    })


    test('random with wallet access token should be able get content', async () => {
        await arianeePrivacyGatewayClientIssuer.messageCreate(process.env.rpcURL, { messageId: ""+messageId, content: messageContent});
        const arianeeJWT = await arianeeAccessTokenOwner.createWalletAccessToken();
        const aatapgc = new ArianeePrivacyGatewayClient(arianeeJWT);
        const result = await aatapgc.messageRead(process.env.rpcURL, { messageId: ""+messageId});


        expect(result).toEqual(messageContent);
    })

});
