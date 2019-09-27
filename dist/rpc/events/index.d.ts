interface Payload {
    tokenId: number;
    eventId: number;
    json: any;
    schemaUrl: string;
    uri: string;
    issuer: string;
    authentification: {
        hash: string;
        signature: string;
        message: any;
    };
}
declare const eventRPCFactory: (fetchItem: any, createItem: any) => {
    [x: string]: (data: Payload, callback: any) => Promise<any>;
};
export { eventRPCFactory };
