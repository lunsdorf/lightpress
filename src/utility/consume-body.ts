import type { IncomingMessage } from "node:http";
import { HttpError } from "../http-error";

export async function consumeBody(
	request: IncomingMessage,
	maxByteLength?: number,
) {
	const chunks: Buffer[] = [];
	let chunksBytes = 0;

	for await (const chunk of request.iterator()) {
		chunks.push(chunk);
		chunksBytes = chunksBytes + chunk.byteLength;

		if (maxByteLength && chunksBytes > maxByteLength) {
			chunks.length = 0;
			chunksBytes = 0;

			throw new HttpError(413);
		}
	}

	return Buffer.concat(chunks, chunksBytes);
}
