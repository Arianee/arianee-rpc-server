import {ArianeeRPCCustom} from "../src";
import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";

describe("arianeeRPCServer", () => {
    test('should be created with network', () => {
        new ArianeeRPCCustom(NETWORK.testnet);
    });
    test('should be created with network', async (done) => {
        const arianee = await new Arianee().init();
        const wallet = arianee.readOnlyWallet();
        new ArianeeRPCCustom(wallet);
        done()
    })
});
