import { IncomingMessage, ServerResponse } from "http";
import { LightpressContext } from "./types/lightpress-context";
import { LightpressHandler } from "./types/lightpress-handler";
import { LightpressRecoveryHandler } from "./types/lightpress-recovery-handler";
import { LightpressResult } from "./types/lightpress-result";
import { recoverError } from "./recover-error";
import { sendResult } from "./send-result";

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

  const innerRecover = recover || recoverError(() => ({ statusCode: 500 }));

  return (request: IncomingMessage, response: ServerResponse) => {
    // Directly return the promise so that it's resolution can be tracked
    // outside, e.g. in unit tests.
    return (
      new Promise<LightpressResult>((resolve) => resolve(handler({ request })))
        .catch(innerRecover)
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
        })
    );
  };
}
