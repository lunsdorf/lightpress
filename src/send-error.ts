import { ServerResponse } from "http";
import { isLightpressError } from "./is-lightpress-error";
import { sendResult } from "./send-result";

export function sendError(response: ServerResponse, error: Error): void {
  // TODO: investigate alternatives for application specific debugging/logging,
  // maybe by passing in an `unhandledError` callback function from lightpress
  // options object.
  // Consider if a `LightpressError` should be excluded here.
  if (process.env.LIGHTPRESS_ERROR === "verbose") {
    console.error(error);
  }

  if (isLightpressError(error)) {
    sendResult(response, error.toResult());
  } else {
    sendResult(response, { statusCode: 500 });
  }
}
