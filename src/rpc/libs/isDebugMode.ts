export const isDebug=process.env.DEBUG && process.env.DEBUG.toLowerCase() ===true.toString();

export const debugLog=(message)=>isDebug && console.log(message)
