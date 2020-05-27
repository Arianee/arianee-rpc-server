import { certificateRPCFactory } from "./certificate";
import { eventRPCFactory } from "./events";
import { messageRPCFactory } from "./messages";

const RPCMethods = Object.freeze({
  certificateRPCFactory,
  eventRPCFactory,
  messageRPCFactory,

});

export { RPCMethods };
