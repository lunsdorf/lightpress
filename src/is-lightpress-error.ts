import { LightpressError } from "./types/lightpress-error";

export function isLightpressError(error: any): error is LightpressError {
  return Boolean(error && typeof error.toResult === "function");
}
