import type { ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { HttpResult } from "./create-request-listener.ts";

/** Passes the given {@link HttpResult} to the given {@link ServerResponse}. */
export async function sendResult(
	response: ServerResponse,
	result: HttpResult,
): Promise<void> {
	const statusCode = result?.statusCode ?? 200;

	if (result?.headers) {
		response.writeHead(statusCode, result.headers);
	} else {
		response.statusCode = statusCode;
	}

	if (result?.body instanceof Readable) {
		await pipeline(result.body, response);
	} else {
		response.end(result?.body ?? null);
	}
}
