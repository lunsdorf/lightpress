import { ServerResponse } from "http";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError(response: ServerResponse, error: Error): void {
  sendResult(response, { statusCode: HttpError.fromError(error).code });
}
