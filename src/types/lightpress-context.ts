import { IncomingMessage } from "http";

/** Basic context object required by an HTTP handler to create a result. */
export type LightpressContext = {
  /** The incoming server request. */
  request: IncomingMessage;
};
