import { IncomingMessage, ServerResponse } from "http";
import { LightpressContext } from "./types/lightpress-context";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressRecoveryHandler } from "./types/lightpress-recovery-handler";
import { LightpressResult } from "./types/lightpress-result";
import { recoverError } from "./recover-error";
import { sendResult } from "./send-result";

/**
 * Wraps a `LightpressHandler` into a function that directly be bound as handler
 * for an HTTP server's incoming `request` events.
 */
export function lightpress(
  handler: LightpressHandler<LightpressContext>,
  recover?: LightpressRecoveryHandler
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  if (typeof handler !== "function") {
    throw new TypeError("request handler must be a function");
  }
  if (recover && typeof recover !== "function") {
    throw new TypeError("recovery handler must be a function");
  }

  // Although it requires a little bit more boilerplate code, it is expected
  // that the given recover handler cares about `LightpressError`s itself. This
  // provides more control over the error recovery.
  const innerRecover = recover || recoverError(() => ({ statusCode: 500 }));

  return (request: IncomingMessage, response: ServerResponse) =>
    // Directly return the promise so that it's resolution can be tracked
    // outside, e.g. in unit tests.
    new Promise<LightpressResult>((resolve) => resolve(handler({ request })))
      // Instead of the context object, the request is passed to the recovery
      // handler as we cannot know if the reference to the context has changed
      // during handler invokation. Assumably, it would lead to more confussion
      // about possibly missing properties than it would help.
      .catch((error) => innerRecover(request, error))
      .then((result) => sendResult(response, result))
      // Fallback guard to prevent the application to crash if error recovery
      // or sending the response have failed.
      .catch((error) => {
        console.error(error);

        try {
          // TODO: investigate if closing the connection is a better option
          request.pause();
          response.end();
        } catch (exception) {
          console.error(exception);
        }
      });
}
