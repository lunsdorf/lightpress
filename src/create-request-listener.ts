import type {
	IncomingMessage,
	OutgoingHttpHeaders,
	ServerResponse,
} from "node:http";
import { HttpError } from "./http-error.ts";
import { sendResult } from "./send-result.ts";

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

/** Generic composable handler that creates an {@link HttpResult}. */
export type GenericHttpHandler<TArgs extends unknown[]> = (
	...args: TArgs
) => HttpResult | Promise<HttpResult>;

/** An HTTP request handler that creates an {@link HttpResult}. */
export type HttpHandler = GenericHttpHandler<[request: IncomingMessage]>;

/** Wraps an {@link HttpHandler} and returns a NodeJS request listener. */
export function createRequestListener(
	handler: HttpHandler,
): (request: IncomingMessage, response: ServerResponse) => Promise<void> {
	if (typeof handler !== "function") {
		throw new TypeError("request handler must be a function");
	}

	return (request: IncomingMessage, response: ServerResponse) =>
		new Promise<HttpResult>((resolve) => resolve(handler(request)))
			.catch((error) => {
				// Instances of `HttpError` are send as response, all other error types
				// are considered unhandled and result in a response with status 500.
				if (error instanceof HttpError) {
					return error;
				}

				console.error(error);

				return { statusCode: 500 };
			})
			.then((result) => sendResult(response, result))
			.catch((error) => {
				console.error(error);

				// Headers or part of the body may have already been delivered. The
				// connection is closed without attempting another response.
				response.destroy();
			});
}
