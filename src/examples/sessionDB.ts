import {ArianeeRPCCustom} from "../arianeeRPCServer";

const certificatesDB={};
const eventsDB={};
const messagesDB={};
const updateDB={};


export const SessionDBRPC = async (network="arianeeTestnet")=> {

    return new ArianeeRPCCustom(network)
        .setCertificateContentMethods(
            (certificateid: string) => {
                return Promise.resolve(certificatesDB[certificateid])
            },
            (certificateid: string, data) => {
                certificatesDB[certificateid] = data;
                return Promise.resolve();
            },
            (certificateid: string, data) => {
                certificatesDB[certificateid] = data;
                return Promise.resolve();
            },
        )
        .setEventContentMethods(
            (certificateid) => {
                return Promise.resolve(eventsDB[certificateid])
            },
            (certificateid: string, data) => {
                eventsDB[certificateid] = data;
                return Promise.resolve();
            },
            (certificateid: string, data) => {
                eventsDB[certificateid] = data;
                return Promise.resolve();
            }
        )
        .setMessageContentMethods(
            (messageId) => {
                return Promise.resolve(messagesDB[messageId])
            },
            (messageId: string, data) => {
                messagesDB[messageId] = data;
                return Promise.resolve();
            },
            (messageId: string, data) => {
                messagesDB[messageId] = data;
                return Promise.resolve();
            })
        .setUpdateContentMethods(
            (updateId) => {
                let data = updateDB[updateId];
                if (!data) {
                    data = certificatesDB[updateId]
                }
                return Promise.resolve(data)
            },
            (updateId: string, data) => {
                updateDB[updateId] = data;
                return Promise.resolve();
            },
            (updateId: string, data) => {
                updateDB[updateId] = data;
                return Promise.resolve();
            })
        .build();
};
