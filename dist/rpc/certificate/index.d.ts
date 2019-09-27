declare const certificateRPCFactory: (fetchItem: any) => {
    [x: string]: (data: any, callback: any) => void;
    add: (args: any, callback: any) => void;
};
export { certificateRPCFactory };
