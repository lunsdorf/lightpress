import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../http-error.ts";
import { assertContentType } from "./assert-content-type.ts";

describe("assertContentType", () => {
	it("asserts a requests HTTP mthod", () => {
		assert.equal(
			assertContentType(
				{ headers: { "content-type": "text/plain" } },
				"text/plain",
			),
			undefined,
		);
	});

	it("allows arbitrary content types", () => {
		assert.equal(
			assertContentType(
				{ headers: { "content-type": "my/content" } },
				"my/content",
			),
			undefined,
		);
	});

	it("throws an HttpError with code 415", () => {
		assert.throws(
			() =>
				assertContentType(
					{ headers: { "content-type": "text/plain" } },
					"text/html",
				),
			(error) => error instanceof HttpError && error.statusCode === 415,
		);
	});

	it("compares normalized media-type essences", () => {
		for (const [incomingContentType, assertedContentType] of [
			["TEXT/PLAIN", "text/plain"],
			["text/plain", "text/plain;charset=iso-8859-1"],
			["text/plain;charset=iso-8859-1", " Text/Plain "],
			[" Text/Plain ; charset=utf-8", "TEXT/PLAIN"],
		]) {
			assert.equal(
				assertContentType(
					{ headers: { "content-type": incomingContentType } },
					assertedContentType,
				),
				undefined,
			);
		}
	});
});
