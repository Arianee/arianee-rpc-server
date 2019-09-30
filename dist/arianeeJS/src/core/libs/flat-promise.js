"use strict";
function flatPromise() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
exports.flatPromise = flatPromise;
//# sourceMappingURL=flat-promise.js.map