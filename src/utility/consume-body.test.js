import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { HttpError } from "../http-error.ts";
import { consumeBody } from "./consume-body.ts";

function createRequest(...chunks) {
	return Readable.from(chunks.map((chunk) => Buffer.from(chunk)));
}

describe("consumeBody", () => {
	it("rejects invalid maximum byte lengths", async () => {
		for (const maxByteLength of [
			undefined,
			null,
			Number.NaN,
			-1,
			1.5,
			Number.MAX_SAFE_INTEGER + 1,
			"123",
		]) {
			await assert.rejects(consumeBody(createRequest("body"), maxByteLength), {
				name: "TypeError",
				message: "maxByteLength must be a non-negative integer",
			});
		}
	});

	it("rejects a non-empty body when the maximum byte length is zero", async () => {
		await assert.rejects(
			consumeBody(createRequest("a"), 0),
			(error) => error instanceof HttpError && error.statusCode === 413,
		);
	});

	it("accepts a body at the maximum byte length", async () => {
		const body = await consumeBody(createRequest("ab", "cd"), 4);

		assert.deepEqual(body, Buffer.from("abcd"));
	});

	it("rejects a body over the maximum byte length", async () => {
		await assert.rejects(
			consumeBody(createRequest("ab", "cde"), 4),
			(error) => error instanceof HttpError && error.statusCode === 413,
		);
	});

	it("propagates errors from an aborted request stream", async () => {
		const request = createRequest("body");
		const error = new Error("aborted");
		request.destroy(error);

		await assert.rejects(consumeBody(request, 4), error);
	});
});
