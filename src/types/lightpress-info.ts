import { IncomingMessage } from "http";

export type LightpressInfo = {
  /** The incoming server request. */
  request: IncomingMessage;

  /** Unix timestamp when lightpress handler was invoked. */
  timestamp: number;
};
