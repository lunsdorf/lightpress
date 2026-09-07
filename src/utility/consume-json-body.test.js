import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { HttpError } from "../http-error.ts";
import { consumeJsonBody } from "./consume-json-body.ts";

describe("consumeJsonBody", () => {
	it("accepts JSON at the default maximum byte length", async () => {
		const json = `"${"a".repeat(1024 * 1024 - 2)}"`;
		const request = Readable.from([Buffer.from(json)]);

		assert.equal(await consumeJsonBody(request), JSON.parse(json));
	});

	it("rejects JSON over the default maximum byte length", async () => {
		const json = `"${"a".repeat(1024 * 1024 - 1)}"`;
		const request = Readable.from([Buffer.from(json)]);

		await assert.rejects(
			consumeJsonBody(request),
			(error) => error instanceof HttpError && error.statusCode === 413,
		);
	});

	it("throws an HttpError with status code 400 for malformed JSON", async () => {
		const request = Readable.from([Buffer.from("{")]);

		await assert.rejects(
			consumeJsonBody(request),
			(error) =>
				error instanceof HttpError &&
				error.statusCode === 400 &&
				error.cause instanceof SyntaxError,
		);
	});
});
