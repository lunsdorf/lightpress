import { ServerResponse } from "http";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError(response: ServerResponse, error: Error): void {
  if (error instanceof HttpError) {
    sendResult(response, error.toResult());
    return;
  }

  // TODO: evaluate alternative implementations that don't rely on NODE_ENV
  if (process.env.NODE_ENV === "development") {
    console.error(error);

    sendResult(response, {
      statusCode: 500,
      body: `Unhandled error: ${error}`,
    });

    return;
  }

  sendResult(response, new HttpError(500).toResult());
}
