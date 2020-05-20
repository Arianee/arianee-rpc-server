import { ArianeeRPCCustom } from "../arianeeRPCServer";
import {NETWORK} from "@arianee/arianeejs/dist/src";

const certificatesDB={};
const eventsDB={}
const messagesDB={}


export const SessionDBRPC = (network=NETWORK.testnet)=> new ArianeeRPCCustom(network)
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
    .setMessageContentMethods(
      (messageId)=>{
    return Promise.resolve(messagesDB[messageId])
  },
      (messageId:string, data)=>{
          messagesDB[messageId] = data;
    return Promise.resolve();
  })    
  .build();