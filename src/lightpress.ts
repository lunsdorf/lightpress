import { IncomingMessage, ServerResponse } from "http";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressContext } from "./types/lightpress-context";
import { createContext as defaultCreateContext } from "./create-context";
import { sendError } from "./send-error";
import { sendResult } from "./send-result";

export type LightpressOptions<T extends LightpressContext> = {
  createContext: (
    request: IncomingMessage,
    response: ServerResponse
  ) => T | Promise<T>;
  serve: LightpressHandler<T>;
};

export type LightpressRequestListener = (
  request: IncomingMessage,
  response: ServerResponse
) => Promise<void>;

export function lightpress<T extends LightpressContext>(
  options: LightpressOptions<T>
): LightpressRequestListener;
export function lightpress(
  handler: LightpressHandler<LightpressContext>
): LightpressRequestListener;
export function lightpress<T extends LightpressContext>(
  fnOrOpt: LightpressHandler<LightpressContext> | LightpressOptions<T>
): LightpressRequestListener {
  const { serve, createContext } =
    "function" === typeof fnOrOpt
      ? { createContext: defaultCreateContext, serve: fnOrOpt }
      : fnOrOpt;

  return (request: IncomingMessage, response: ServerResponse) => {
    // Directly return the promise so that it's resolution can be tracked
    // outside, e.g. in unit tests.
    return new Promise<T>((resolve, reject) => {
      try {
        resolve(createContext(request, response) as T | Promise<T>);
      } catch (error) {
        reject(error);
      }
    })
      .then((context) => serve(context))
      .then((result) => sendResult(response, result))
      .catch((error) => sendError(response, error));
  };
}
