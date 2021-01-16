import { IncomingMessage } from "http";
import { LightpressResult } from "./lightpress-result";

export type LightpressRecoveryHandler = (
  request: IncomingMessage,
  error: Error
) => LightpressResult | Promise<LightpressResult>;
