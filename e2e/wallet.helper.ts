import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";
import {ArianeeWallet} from "@arianee/arianeejs/dist/src/core/wallet";
const arianee$= new Arianee().init(NETWORK.testnet);

export const getWallet=async (num:number[]):Promise<Array<ArianeeWallet>> =>{
    const arianee=await arianee$;
    const mnemonics=[
        'chapter current truly toddler phrase receive behave team common treat under couch',
        'rose solve forum uphold drink into you shy boat apple goddess fiber',
        'wedding road tenant green stand retire long term term side obey ghost'
    ];

    return num.map(n=>arianee.fromMnemonic(mnemonics[n]))
}

export  const prepareWallets=async (wallets:Array<ArianeeWallet>):Promise<Array<ArianeeWallet>> =>{

    const prepare=async (wallet:ArianeeWallet)=>{
    //await wallet.requestPoa();
   // await wallet.requestAria();
   // await wallet.methods.approveStore();
    //await wallet.methods.buyCredits('certificate',1);

       return wallet;
    };
    return  Promise.all(wallets.map(wallet=>prepare(wallet)))

}
