import type { IncomingMessage } from "node:http";
import { HttpError } from "../http-error.ts";
import { consumeBody } from "./consume-body.ts";

export async function consumeJsonBody(
	request: IncomingMessage,
	maxByteLength?: number,
) {
	const buffer = await consumeBody(request, maxByteLength);

	try {
		return JSON.parse(buffer.toString("utf8"));
	} catch (error) {
		throw new HttpError(400, {
			cause: error,
		});
	}
}
