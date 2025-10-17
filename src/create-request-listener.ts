import type {
	IncomingMessage,
	OutgoingHttpHeaders,
	ServerResponse,
} from "node:http";
import { sendResult } from "./send-result";
import { HttpError } from "./http-error";

/** An object that is used to be send as HTTP response. */
export type HttpResult =
	| null
	| undefined
	| {
			/** Optional response status code (defaults to `200`). */
			statusCode?: null | number;

			/** Optional response body. */
			body?: null | string | Buffer | NodeJS.ReadableStream;

			/** Optional HTTP response headers. */
			headers?: null | OutgoingHttpHeaders;
	  };

/** An HTTP request handler that creates an {@link HttpResult}. */
export type HttpHandler = (
	request: IncomingMessage,
) => HttpResult | Promise<HttpResult>;

/** A handler to recover from unhandled errors by the {@link HttpHandler}. */
export type RecoverHandler = (
	request: IncomingMessage,
	error: unknown,
) => HttpResult | Promise<HttpResult>;

/** Wraps an {@link HttpHandler} and returns a NodeJS request listener. */
export function createRequestListener(
	handler: HttpHandler,
	recover?: RecoverHandler,
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
	if (typeof handler !== "function") {
		throw new TypeError("request handler must be a function");
	}

	return (request: IncomingMessage, response: ServerResponse) =>
		new Promise<HttpResult>((resolve) => resolve(handler(request)))
			.catch((error) => {
				// Instances of `HttpError` are send as response, all other error types
				// are considered unhandled.
				if (error instanceof HttpError) {
					return error;
				}

				if (recover) {
					return recover(request, error);
				}

				throw error;
			})
			.catch((error) => {
				// Log unhandled error if no recover handler is defined or an error was
				// thrown from the recover handler itself.
				console.error(error);

				return { statusCode: 500 };
			})
			.then((result) => sendResult(response, result));
}
