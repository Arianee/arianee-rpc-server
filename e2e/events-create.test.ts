import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';
import {eventContent} from "./mocks/eventContent";
import axios from "axios";
import Core from "@arianee/core";
import Creator from "@arianee/creator";
import Wallet from "@arianee/wallet";
import {ArianeePrivacyGatewayClient} from "@arianee/arianee-privacy-gateway-client";
import {ArianeeAccessToken} from "@arianee/arianee-access-token";
import { PrivacyGatewayError } from "@arianee/arianee-privacy-gateway-client/src/lib/errors/PrivacyGatewayError";

describe('Event', () => {

    let certificateId;
    let passphrase;
    let arianeePrivacyGatewayClientOwner: ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientRandom: ArianeePrivacyGatewayClient;
    let arianeePrivacyGatewayClientIssuer: ArianeePrivacyGatewayClient;
    let arianeeAccessTokenOwner: ArianeeAccessToken;
    let arianeeAccessTokenIssuer: ArianeeAccessToken;

    let arianeeEventId;

    const ownerMnemonic = process.env.OWNERMNEMONIC;
    const issuerMnemonic = process.env.ISSUERMNEMONIC;

    beforeAll(async () => {
        try {
            const issuerCore = Core.fromMnemonic(issuerMnemonic!)
            const randomCore = Core.fromRandom();
            const ownerCore = Core.fromMnemonic(ownerMnemonic!);

            arianeePrivacyGatewayClientOwner = new ArianeePrivacyGatewayClient(ownerCore)
            arianeePrivacyGatewayClientRandom = new ArianeePrivacyGatewayClient(randomCore);
            arianeePrivacyGatewayClientIssuer = new ArianeePrivacyGatewayClient(issuerCore);

            arianeeAccessTokenOwner = new ArianeeAccessToken(ownerCore)
            arianeeAccessTokenIssuer = new ArianeeAccessToken(issuerCore)

            certificateId = 51628187;
            passphrase = "5mwtxt2sesau"

            console.info(`preparing wallets: DONE ${certificateId} ${passphrase}`);
            console.log('preparing wallets: requesting ownership');

            arianeeEventId = "388334045"
            await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent});

            await arianeePrivacyGatewayClientRandom.certificateCreate(process.env.rpcURL!, {certificateId, content: certificateContent});
        } catch (e) {
            console.error(e);
        }
    });

    test('should be able create content if content is equal to imprint', async () => {
        await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})
        expect(true).toBeTruthy();
    });


    test('should NOT be able create content if content is not equal to imprint', async () => {
        const eventContentClone  = {"$schema":"https://cert.arianee.org/version1/ArianeeEvent-i18n.json","title":"anothertitle"}

        try {
            await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, {
                eventId: arianeeEventId,
                content: eventContentClone
            });
        } catch (e) {
            expect(e).toBeInstanceOf(PrivacyGatewayError);
            expect((e as PrivacyGatewayError).message).toEqual("unauthorized")
        }

    });

    test('should be able create content if tokenId or arianeeEventId does not exist on BC', async () => {

        let isInError = false;
        const eventContentClone = cloneDeep(eventContent);
        eventContentClone.title = 'anotherTitle';
        await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: "-1", content: eventContentClone})
        expect(true).toBeTruthy();
    });
    test('should be able get content (owner wallet)', async () => {
        await arianeePrivacyGatewayClientOwner.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})
        const result = await arianeePrivacyGatewayClientOwner.eventRead(process.env.rpcURL!, {certificateId, eventId:arianeeEventId})
        expect(result).toEqual(eventContent);

    })
    test('should be able get content (issuer wallet)', async () => {
        await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})
        const result = await arianeePrivacyGatewayClientIssuer.eventRead(process.env.rpcURL!, {certificateId, eventId:arianeeEventId})
        expect(result).toEqual(eventContent);
    })


    test('should NOT be able get content (random wallet)', async () => {
        await arianeePrivacyGatewayClientRandom.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})

        try {
            await arianeePrivacyGatewayClientRandom.eventRead(process.env.rpcURL!, {certificateId, eventId:arianeeEventId})
        } catch (e) {
            expect(e).toBeInstanceOf(PrivacyGatewayError);
            expect((e as PrivacyGatewayError).message).toEqual("the JWT is not valid")
        }
    })

    test('should be able get content with wallet access token from owner', async () => {
        await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})
        const jwt = await arianeeAccessTokenOwner.createWalletAccessToken();
        const aatapgc = new ArianeePrivacyGatewayClient(jwt);
        const result = await aatapgc.eventRead(process.env.rpcURL!, {certificateId, eventId:arianeeEventId})

        expect(result).toEqual(eventContent);
    })

    test('should be able get content with wallet access token from issuer', async () => {
        await arianeePrivacyGatewayClientIssuer.eventCreate(process.env.rpcURL!, { eventId: arianeeEventId, content: eventContent})
        const jwt = await arianeeAccessTokenIssuer.createWalletAccessToken();
        const aatapgc = new ArianeePrivacyGatewayClient(jwt);
        const result = await aatapgc.eventRead(process.env.rpcURL!, {certificateId, eventId:arianeeEventId})

        expect(result).toEqual(eventContent);
    })

});
