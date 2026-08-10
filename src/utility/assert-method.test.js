import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../http-error.ts";
import { assertMethod } from "./assert-method.ts";

describe("assertMethod", () => {
	it("asserts a request HTTP method", () => {
		assert.equal(assertMethod({ method: "GET" }, "GET"), undefined);
	});

	it("allows arbitrary HTTP methods", () => {
		assert.equal(assertMethod({ method: "SOMETHING" }, "SOMETHING"), undefined);
	});

	it("throws an HttpError with code 405", () => {
		assert.throws(
			() => assertMethod({ method: "POST" }, "GET"),
			(error) => error instanceof HttpError && error.statusCode === 405,
		);
	});

	it("expects exact match", () => {
		assert.throws(() => assertMethod({ method: "GET" }, "get"));
	});
});
