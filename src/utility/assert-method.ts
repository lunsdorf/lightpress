import type { IncomingMessage } from "node:http";
import { HttpError } from "../http-error.ts";

export function assertMethod<const TMethod extends string>(
	request: IncomingMessage,
	method: TMethod,
): asserts request is IncomingMessage & { method: TMethod } {
	if (request.method !== method) {
		throw new HttpError(405);
	}
}
