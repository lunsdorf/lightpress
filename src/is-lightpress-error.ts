import { LightpressError } from "./types/lightpress-error";

/**
 * Typeguard to test if the given object implements the `LightpressError`
 * interface.
 */
export function isLightpressError(error: any): error is LightpressError {
  return Boolean(error && typeof error.toResult === "function");
}
