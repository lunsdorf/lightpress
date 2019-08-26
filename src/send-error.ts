import { ServerResponse } from "http";
import { LightpressContext } from "./types/lightpress-context";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError<T extends LightpressContext = LightpressContext>(
  response: ServerResponse,
  context: T,
  error: Error
): void {
  sendResult(response, context, {
    statusCode: HttpError.fromError(error).code
  });
}
