import type { OutgoingHttpHeaders } from "node:http";
import type { HttpResult } from "../create-request-listener.ts";

const CONTENT_HEADER_RE = /^content-(?:type|length)$/i;

export type JsonResultInit = {
	statusCode?: NonNullable<HttpResult>["statusCode"];
	headers?: NonNullable<HttpResult>["headers"];
};

export function createJsonResult(data: unknown, init?: JsonResultInit) {
	const body = Buffer.from(JSON.stringify(data));
	const headers: OutgoingHttpHeaders = {
		"content-type": "application/json",
		"content-length": body.byteLength.toString(10),
	};

	if (init?.headers) {
		Object.entries(init.headers).forEach(([key, value]) => {
			if (!CONTENT_HEADER_RE.test(key)) {
				headers[key] = value;
			}
		});
	}

	return {
		statusCode: init?.statusCode ?? 200,
		headers,
		body,
	};
}
