import {getWallet} from "./wallet.helper";
import {RpcCallHTTP} from "./rpcCallHTTP";
import {RPCNAME} from "../src/rpc/rpc-name";

describe('Create Certificate',()=>{

test('should be able create content if content is equal to imprint',async(done)=>{

    const certificateId=1;
    const passphrase='cert1passphrase';
    const [wallet]=await getWallet([0]);

    const certificateSummary= await wallet.methods.getCertificate(certificateId,passphrase,{content:true});

    try{
        const rpcCaller=new RpcCallHTTP();

        await rpcCaller.RPCCall('http://localhost:3000/rpc',
            RPCNAME.certificate.create,
            {
                json:certificateSummary.content.data,
                certificateId
            });

        expect(true).toBeTruthy()
    }

    catch (e) {
        expect(true).toBeFalsy()
    }finally {
        done()
    }
});


test('should NOT be able create content if content is not equal to imprint',async(done)=>{
    const certificateId=1;

    try{
        const rpcCaller=new RpcCallHTTP();

   const resp= await rpcCaller.RPCCall('http://localhost:3000/rpc',
        RPCNAME.certificate.create,
       {
        json:{},
           certificateId
    });
        expect(true).toBeFalsy()
    }

    catch (e) {
        expect(true).toBeTruthy()
    }finally {
        done()
    }
})
})
