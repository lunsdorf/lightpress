import { LightpressContext } from "./lightpress-context";
import { LightpressResult } from "./lightpress-result";

/**
 * Describes a function that creates a `LightpressResult` for incoming HTTP
 * requests.
 */
export type LightpressHandler<T extends LightpressContext> = (
  context: T
) => LightpressResult | Promise<LightpressResult>;
