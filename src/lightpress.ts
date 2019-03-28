import { IncomingMessage, ServerResponse } from "http";
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
): (request: IncomingMessage, response: ServerResponse) => void {
  const sendError = options.sendError || defaultSendError;
  const sendResult = options.sendResult || defaultSendResult;

  return (request: IncomingMessage, response: ServerResponse) => {
    const timestamp = Date.now();
    const info = { timestamp, request } as T;

    new Promise<LightpressResult>(resolve => resolve(handler(info)))
      .then(result => sendResult(response, info, result))
      .catch(error => sendError(response, info, error));
  };
}
