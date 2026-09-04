import type { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { HttpError } from "../http-error.ts";

export function assertContentType(
	request: IncomingMessage,
	contentType: string,
): asserts request is IncomingMessage & {
	headers: IncomingHttpHeaders & { "content-type": string };
} {
	const assertedContentType = contentType.split(";", 1)[0].trim().toLowerCase();
	const incomingContentType = request.headers["content-type"]
		?.split(";", 1)[0]
		.trim()
		.toLowerCase();

	if (incomingContentType !== assertedContentType) {
		throw new HttpError(415);
	}
}
