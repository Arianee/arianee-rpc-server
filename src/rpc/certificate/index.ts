import { RPCNAME } from "../rpc-name";
import { isObjectMatchingModel } from "isobjectmatchingmodel";
import { MAINERROR } from "../errors/error";

const certificateRPCFactory = fetchItem => {
  const create = (data, callback) => {
    callback(null, data);
  };

  let userHasRight = true;


  const read = async (data, callback) => {
    console.log('ici')
    if (userHasRight === true) {
      const content = await fetchItem();
      callback(null, content);
    } else {
      callback(MAINERROR);
    }
  };

  const HELLOWORLD = function(args, callback) {
    const neededArguments = {
      a: "",
      b: ""
    };

    console.assert(
      isObjectMatchingModel(neededArguments, args),
      "wrong paramters"
    );

    const { a, b } = args;
    callback(null, a + b);
  };

  return {
    [RPCNAME.certificate.create]: create,
    [RPCNAME.certificate.read]: read,
    add: HELLOWORLD
  };
};

export { certificateRPCFactory };
