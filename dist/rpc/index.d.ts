declare const RPCMethods: Readonly<{
    certificateRPCFactory: (fetchItem: any) => {
        [x: string]: (data: any, callback: any) => void;
        add: (args: any, callback: any) => void;
    };
    eventRPCFactory: (fetchItem: any, createItem: any) => {
        [x: string]: (data: any, callback: any) => Promise<any>;
    };
}>;
export { RPCMethods };
