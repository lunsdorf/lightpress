import { LightpressResult } from "./lightpress-result";

export type LightpressRecoveryHandler = (
  error: Error
) => LightpressResult | Promise<LightpressResult>;
