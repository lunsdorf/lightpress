import type { ServerResponse } from "node:http";
import { Readable } from "node:stream";
import type { HttpResult } from "./create-request-listener.ts";

/** Passes the given {@link HttpResult} to the given {@link ServerResponse}. */
export function sendResult(response: ServerResponse, result: HttpResult): void {
	const statusCode = result?.statusCode ?? 200;

	if (result?.headers) {
		response.writeHead(statusCode, result.headers);
	} else {
		response.statusCode = statusCode;
	}

	if (result?.body instanceof Readable) {
		result.body.pipe(response);
	} else {
		response.end(result?.body ?? null);
	}
}
