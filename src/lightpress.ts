import { IncomingMessage, ServerResponse } from "http";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressContext } from "./types/lightpress-context";
import { createContext as defaultCreateContext } from "./create-context";
import { sendError } from "./send-error";
import { sendResult } from "./send-result";

export type LightpressOptions<T extends LightpressContext> = {
  createContext?: (request: IncomingMessage, response: ServerResponse) => T | Promise<T>;
};

export function lightpress<T extends LightpressContext = LightpressContext>(
  handler: LightpressHandler,
  options: LightpressOptions<T> = {}
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  if ("function" !== typeof handler) {
    throw new TypeError("handler must be a function");
  }

  const createContext = options.createContext || defaultCreateContext;

  return (request: IncomingMessage, response: ServerResponse) => {
    // IMPORTANT: This promise is returned so it can be awaited directly inside
    // unit tests, instead of using a timeout.
    return Promise.resolve<LightpressContext>(createContext(request, response))
      .then(context => handler(context))
      .then(result => sendResult(response, result))
      .catch(error => sendError(response, error));
  };
}
