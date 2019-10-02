declare const eventRPCFactory: (fetchItem: any, createItem: any) => {
    [x: string]: (data: any, callback: any) => Promise<any>;
};
export { eventRPCFactory };
