import type {
  IncomingMessage,
  OutgoingHttpHeaders,
  ServerResponse,
} from "node:http";
import { sendResult } from "./send-result";
import { HttpError } from "./http-error";

/** An object that is used to be send as HTTP response. */
export type HttpResult = void | null | {
  /** Optional response status code (defaults to `200`). */
  statusCode?: null | number;

  /** Optional response body. */
  body?: null | string | Buffer | NodeJS.ReadableStream;

  /** Optional HTTP response headers. */
  headers?: null | OutgoingHttpHeaders;
};

/** An HTTP request handler that creates an {@link HttpResult}. */
export type HttpHandler<T extends object> = (
  request: IncomingMessage,
  context: T,
) => HttpResult | Promise<HttpResult>;

/** Wraps an {@link HttpHandler} and returns an HTTP request listener. */
export function createRequestListener(
  handler: HttpHandler<{}>,
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
  if (typeof handler !== "function") {
    throw new TypeError("request handler must be a function");
  }

  return async (request: IncomingMessage, response: ServerResponse) => {
    let result: HttpResult = null;

    try {
      result = await handler(request, {});
    } catch (error) {
      // Instances of HttpError are send as response, all other error types are
      // considered unhandled and be re-thrown.
      if (error instanceof HttpError) {
        result = error;
      } else {
        throw error;
      }
    }

    sendResult(response, result);
  };
}
