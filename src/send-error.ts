import { ServerResponse } from "http";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError(response: ServerResponse, error: Error): void {
  // TODO: investigate alternatives for application specific debugging/logging,
  // maybe by passing in an `unhandledError` callback function from lightpress
  // options object. also consider if an `HttpError` really is unhandled.
  if (process.env.LIGHTPRESS_ERROR === "verbose") {
    console.error(error);
  }

  // TODO: consider a generel check for `toResult` function to support other
  // custom error implementations
  if (error instanceof HttpError) {
    sendResult(response, error.toResult());
  } else {
    sendResult(response, { statusCode: 500 });
  }
}
