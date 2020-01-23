import { ServerResponse } from "http";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError(response: ServerResponse, error: Error): void {
  // TODO: investigate alternatives for application specific debugging/logging
  if (process.env.LIGHTPRESS_ERROR === "verbose") {
    console.error(error);
  }

  if (error instanceof HttpError) {
    sendResult(response, error.toResult());
  } else {
    sendResult(response, { statusCode: 500 });
  }
}
