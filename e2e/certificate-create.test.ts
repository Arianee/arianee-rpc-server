import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {certificateContent} from "./mocks/certificateContent";
import {cloneDeep} from 'lodash';

describe('Certificate', () => {
    const certificateId = 7371300;
    let arianee: ArianeeWalletBuilder;
    let wallet: ArianeeWallet;
    beforeAll(async () => {
        arianee = await new Arianee().init(NETWORK.testnet);
        wallet = arianee.fromPrivateKey(process.env.privateKey)
    });
    test('should be able create content if content is equal to imprint', async (done) => {
        await wallet.methods.storeContentInRPCServer(certificateId, certificateContent, 'http://localhost:3000/rpc');
        expect(true).toBeTruthy();
        done()
    });


    test('should NOT be able create content if content is not equal to imprint', async (done) => {
        let isInError = false;
        const certificateClone = cloneDeep(certificateContent);
        certificateClone.name = 'anotherName';

        try {

            await wallet.methods.storeContentInRPCServer(certificateId, certificateClone, 'http://localhost:3000/rpc');
        } catch (e) {
            isInError = true;
        }
        expect(isInError).toBeTruthy();
        done()


    });

    test('should be able get content', async (done) => {
        await wallet.methods.storeContentInRPCServer(certificateId, certificateContent, 'http://localhost:3000/rpc');
        const result = await wallet.methods.getCertificate(certificateId, undefined,
            {content: true, issuer: {rpcURI: 'http://localhost:3000/rpc'}});


        expect(result.content.data).toEqual(certificateContent);
        done()

    })
});







