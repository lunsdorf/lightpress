import type { IncomingMessage } from "node:http";
import { HttpError } from "../http-error";
import { consumeBody } from "./consume-body";

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
