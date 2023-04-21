import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWalletBuilder} from "@arianee/arianeejs/dist/src/core/wallet/walletBuilder";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
import {ArianeeRPCCustom} from "../src";

describe('init', () => {

    let arianee: ArianeeWalletBuilder;
    let walletRandom:ArianeeWallet;


    beforeAll(async () => {
            arianee = await new Arianee()
                .setStore({
                    // be sure to not get from cache
                    hasItem: () => Promise.resolve(false),
                    getStoreItem:(key)=>Promise.resolve(undefined),
                    setStoreItem:(key,value)=>Promise.resolve(undefined)
                })
                .init(NETWORK.arianeeTestnet);

            walletRandom =  arianee.fromRandomMnemonic();
    });

    describe("arianeeRPCServer", () => {
        test('should be created with network', () => {
            new ArianeeRPCCustom(NETWORK.testnet);
        });
        test('should be created with wallet', async () => {
            new ArianeeRPCCustom(walletRandom);
        })
    });

});







