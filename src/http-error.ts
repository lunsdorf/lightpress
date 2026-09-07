import type { OutgoingHttpHeaders } from "node:http";
import { STATUS_CODES } from "node:http";
import type { Readable } from "node:stream";
import type { HttpResult } from "./create-request-listener.ts";

/** An error that can be send as an HTTP result. */
export class HttpError extends Error implements NonNullable<HttpResult> {
	name: string = "HttpError";

	statusCode: number;
	body?: null | string | Buffer | Readable;
	headers?: null | OutgoingHttpHeaders;

	constructor(result: HttpResult, options?: ErrorOptions);
	constructor(statusCode: number, options?: ErrorOptions);
	constructor(resultOrStatusCode: number | HttpResult, options?: ErrorOptions) {
		const [statusCode, result] =
			typeof resultOrStatusCode === "number"
				? [resultOrStatusCode, null]
				: [resultOrStatusCode?.statusCode ?? 500, resultOrStatusCode];

		super(STATUS_CODES[statusCode], options);

		// TODO: investigate if this is really needed
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}

		this.statusCode = statusCode;
		this.body = result?.body;
		this.headers = result?.headers;
	}
}
