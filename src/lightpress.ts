import { IncomingMessage, ServerResponse } from "http";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressContext } from "./types/lightpress-context";
import { sendError } from "./send-error";
import { sendResult } from "./send-result";

export function lightpress(
  handler: LightpressHandler<LightpressContext>
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  if ("function" !== typeof handler) {
    throw new TypeError("request handler must be a function");
  }

  return (request: IncomingMessage, response: ServerResponse) => {
    // Directly return the promise so that it's resolution can be tracked
    // outside, e.g. in unit tests.
    return Promise.resolve({ request })
      .then((context) => handler(context))
      .then((result) => sendResult(response, result))
      .catch((error) => sendError(response, error));
  };
}
