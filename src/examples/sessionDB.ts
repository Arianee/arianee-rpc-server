import { ArianeeRPCCustom } from "../arianeeRPCServer";
import {NETWORK} from "@arianee/arianeejs/dist/src";

const certificatesDB={};
const eventsDB={}

export const SessionDBRPC = (network=NETWORK.arianeeTestnet)=> new ArianeeRPCCustom(network)
    .setCertificateContentMethods(
        (certificateid:string)=>{
      return Promise.resolve(certificatesDB[certificateid])
    },
        (certificateid:string, data)=>{
      certificatesDB[certificateid] = data;
      return Promise.resolve();
    })
    .setEventContentMethods(
        (certificateid)=>{
      return Promise.resolve(eventsDB[certificateid])
    },
        (certificateid:string, data)=>{
            eventsDB[certificateid] = data;
      return Promise.resolve();
    })
  .build();
