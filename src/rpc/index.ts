import { certificateRPCFactory } from "./certificate";
import { eventRPCFactory } from "./events";
import { messageRPCFactory } from "./messages";
import {updateRPCFactory} from "./update";

const RPCMethods = Object.freeze({
  certificateRPCFactory,
  eventRPCFactory,
  messageRPCFactory,
  updateRPCFactory
});

export { RPCMethods };
