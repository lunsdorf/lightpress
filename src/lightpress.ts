import { IncomingMessage, ServerResponse } from "http";
import { createRequestContext as defaultCreateRequestContext } from "./create-request-context";
import { createRequestHandle as defaultCreateRequestHandle, LightpressRequestHandle } from "./create-request-handle";
import { createErrorResult as defaultCreateErrorResult } from "./create-error-result";
import { sendResult as defaultSendResult, LightpressResult } from "./send-result";

export type LightpressHandlerReturn = undefined | null | LightpressResult;
export type LightpressHandler<T extends object = {}> = (req: IncomingMessage, ctx: T) => LightpressHandlerReturn | Promise<LightpressHandlerReturn>;

export type LightpressOptions<TCtx extends object, THandle extends LightpressRequestHandle> = {
  createErrorResult?: (handle: THandle, error: Error) => LightpressResult;
  createRequestContext?: (handle: THandle) => TCtx | Promise<TCtx>;
  createRequestHandle?: (timestamp: number, request: IncomingMessage, response: ServerResponse) => THandle | Promise<THandle>;
  sendResult?: (handle: THandle, result: LightpressResult) => LightpressResult;
};

export function lightpress<TCtx extends object = {}, THandle extends LightpressRequestHandle = LightpressRequestHandle>(
  handler: LightpressHandler<TCtx>,
  options: LightpressOptions<TCtx, THandle> = {}
): (req: IncomingMessage, res: ServerResponse) => void {
  const createRequestContext = options.createRequestContext || defaultCreateRequestContext;
  const createRequestHandle = options.createRequestHandle || defaultCreateRequestHandle;
  const createErrorResult = options.createErrorResult || defaultCreateErrorResult;
  const sendResult = options.sendResult || defaultSendResult;

  return (req: IncomingMessage, res: ServerResponse) => {
    const ts = Date.now();

    Promise.resolve()
      .then(() => createRequestHandle(ts, req, res) as THandle | Promise<THandle>)
      .then(handle => Promise.all([handle, createRequestContext(handle) as TCtx | Promise<TCtx>]))
      .then(([handle, ctx]) => Promise.resolve(handler(handle.request, ctx)).then(
        result => sendResult(handle, result || {}),
        error => sendResult(handle, createErrorResult(handle, error))
      ));
  };
}
