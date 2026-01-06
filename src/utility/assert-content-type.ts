import type { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { HttpError } from "../http-error";

export function assertContentType<const TContentType extends string>(
	request: IncomingMessage,
	contentType: TContentType,
): asserts request is IncomingMessage & {
	headers: IncomingHttpHeaders & { ["content-type"]: TContentType };
} {
	if (request.headers["content-type"] !== contentType) {
		throw new HttpError(415);
	}
}
