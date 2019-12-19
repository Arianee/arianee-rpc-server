import {SessionDBRPC} from "./sessionDB";

const RPC= SessionDBRPC();

exports.helloHttp = (req, res) =>RPC(req,res);
