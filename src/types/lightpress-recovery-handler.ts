import { IncomingMessage } from "http";
import { LightpressResult } from "./lightpress-result";

/** Describes a function to convert an error to a `LightpressResult`. */
export type LightpressRecoveryHandler = (
  request: IncomingMessage,
  error: unknown
) => LightpressResult | Promise<LightpressResult>;
