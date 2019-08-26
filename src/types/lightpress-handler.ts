import { LightpressContext } from "./lightpress-context";
import { LightpressResult } from "./lightpress-result";

export type LightpressHandler<T extends LightpressContext = LightpressContext> = (context: T) => (
  LightpressResult | Promise<LightpressResult>
);
