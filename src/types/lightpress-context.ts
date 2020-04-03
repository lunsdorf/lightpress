import { IncomingMessage } from "http";

export type LightpressContext = {
  /** The incoming server request. */
  request: IncomingMessage;
};
