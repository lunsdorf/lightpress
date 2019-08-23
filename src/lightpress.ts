import { IncomingMessage, ServerResponse } from "http";
import { parse } from "url";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressInfo } from "./types/lightpress-info";
import { LightpressResult } from "./types/lightpress-result";
import { sendError as defaultSendError } from "./send-error";
import { sendResult as defaultSendResult } from "./send-result";

export type LightpressOptions<T extends LightpressInfo> = {
  sendError?: (response: ServerResponse, info: T, error: Error) => void;
  sendResult?: (response: ServerResponse, info: T, result: LightpressResult) => void;
};

export function lightpress<T extends LightpressInfo = LightpressInfo>(
  handler: LightpressHandler,
  options: LightpressOptions<T> = {}
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  if ("function" !== typeof handler) {
    throw new TypeError("handler must be a function");
  }

  const sendError = options.sendError || defaultSendError;
  const sendResult = options.sendResult || defaultSendResult;

  return (request: IncomingMessage, response: ServerResponse) => {
    const timestamp = Date.now();
    const url = parse(request.url || "/", true)
    const info = { request, timestamp, url } as T;

    // IMPORTANT: This promise is returned so it can be awaited directly inside
    // unit tests, instead of using a timeout.
    return new Promise<LightpressResult>(resolve => resolve(handler(info)))
      .then(result => sendResult(response, info, result))
      .catch(error => sendError(response, info, error));
  };
}
