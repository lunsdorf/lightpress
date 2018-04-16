import { ServerRequest, ServerResponse } from "http";
import convertRequest, { HttpRequest } from "./convert-request";
import sendError from "./send-error";
import sendResult, { HttpResult } from "./send-result";

// FIXME: function should take a context object instead of a request
export type HttpFunction = (request: HttpRequest) => Promise<HttpResult>;

export type LightpressOptions = {
  convertRequest?: typeof convertRequest;
  sendError?: typeof sendError;
  sendResult?: typeof sendResult;
};

export default function lightpress(
  handler: HttpFunction,
  options: LightpressOptions = {}
): (req: ServerRequest, res: ServerResponse) => void {
  const localConvertRequest = options.convertRequest || convertRequest;
  const localSendError = options.sendError || sendError;
  const localSendResult = options.sendResult || sendResult;

  return (req: ServerRequest, res: ServerResponse) => handler(localConvertRequest(req, res))
    .then(result => localSendResult(req, res, result))
    .catch(error => localSendError(req, res, error));
}
