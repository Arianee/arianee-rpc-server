import {ArianeeRPCCustom} from "../arianeeRPCServer";
import {Arianee, NETWORK} from "@arianee/arianeejs/dist/src";

const certificatesDB={};
const eventsDB={};
const messagesDB={};
const updateDB={};


export const SessionDBRPC = async (network=NETWORK.testnet)=> {
    const arianee = await new Arianee().init();
    const wallet = arianee.readOnlyWallet();

    return new ArianeeRPCCustom(wallet)
        .setCertificateContentMethods(
            (certificateid: string) => {
                return Promise.resolve(certificatesDB[certificateid.toString()])
            },
            (certificateid: string, data) => {
                certificatesDB[certificateid.toString()] = data;
                return Promise.resolve();
            },
            (certificateid: string, data) => {
                certificatesDB[certificateid] = data;
                return Promise.resolve();
            },
        )
        .setEventContentMethods(
            (certificateid) => {
                return Promise.resolve(eventsDB[certificateid.toString()])
            },
            (certificateid: string, data) => {
                eventsDB[certificateid.toString()] = data;
                return Promise.resolve();
            },
            (certificateid: string, data) => {
                eventsDB[certificateid.toString()] = data;
                return Promise.resolve();
            }
        )
        .setMessageContentMethods(
            (messageId) => {
                return Promise.resolve(messagesDB[messageId.toString()])
            },
            (messageId: string, data) => {
                messagesDB[messageId.toString()] = data;
                return Promise.resolve();
            },
            (messageId: string, data) => {
                messagesDB[messageId.toString()] = data;
                return Promise.resolve();
            })
        .setUpdateContentMethods(
            (updateId) => {
                let data = updateDB[updateId.toString()];
                if (!data) {
                    data = certificatesDB[updateId.toString()]
                }
                return Promise.resolve(data)
            },
            (updateId: string, data) => {
                updateDB[updateId.toString()] = data;
                return Promise.resolve();
            },
            (updateId: string, data) => {
                updateDB[updateId.toString()] = data;
                return Promise.resolve();
            })
        .build();
};
