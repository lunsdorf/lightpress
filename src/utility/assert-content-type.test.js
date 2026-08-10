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

	it("expects exact match", () => {
		assert.throws(() =>
			assertContentType(
				{ headers: { "content-type": "text/plain" } },
				"TEXT/PLAIN",
			),
		);
		assert.throws(() =>
			assertContentType(
				{ headers: { "content-type": "text/plain;charset=iso-8859-1" } },
				"text/plain",
			),
		);
	});
});
