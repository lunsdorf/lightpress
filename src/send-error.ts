import { ServerResponse } from "http";
import { LightpressInfo } from "./types/lightpress-info";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

export function sendError<T extends LightpressInfo = LightpressInfo>(response: ServerResponse, info: T, error: Error): void {
  sendResult(response, info, {
    statusCode: HttpError.fromError(error).code
  });
}
