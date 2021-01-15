import { LightpressResult } from "./lightpress-result";

export type LightpressRecoverer = (
  error: Error
) => LightpressResult | Promise<LightpressResult>;
