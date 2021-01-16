import { LightpressResult } from "./lightpress-result";

/**
 * Represents a handled error result that fits the dataflow of promises and can
 * be recoverd from.
 * NOTE: Intentionally, this is not designed as a common result factory as it
 * would make dataflow overly complicated and can already be archieved through
 * the use of promises itself.
 */
export interface LightpressError extends Error {
  toResult(): LightpressResult;
}
