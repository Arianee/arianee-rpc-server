import {getWallet, prepareWallets} from "./wallet.helper";
const {spawn}=require("child_process");

let serverProcess;
jest.setTimeout(20000);
const env={
    ...process.env
};
env.PORT='3000';

// process.env.MODE='TEST';


beforeAll(async (done) => {
    const wallets=await getWallet([0]);
    const preparingWallets= prepareWallets(wallets);

    const server = new Promise(resolve => {
        if(process.env.MODE==='dev'){
            console.warn("you need a dev server");
            return resolve();
        }else{
            serverProcess = spawn("node",['./dist/examples/express.example.js'],{env:env});
            return serverProcess.stdout.on('data',resolve);
        }
    });

      Promise.all([preparingWallets,server])
        .finally(()=>{
        console.log('server launch on', env.PORT);
        done();
    });
});

afterAll(()=>{
    if(process.env.MODE!=='dev'){
        serverProcess.kill();
    }
})

