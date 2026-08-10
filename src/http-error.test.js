import assert from "node:assert/strict";
import { STATUS_CODES } from "node:http";
import { describe, it } from "node:test";
import { HttpError } from "./http-error.ts";

describe("HttpError", () => {
	it("constructs to an instance of `Error`", () => {
		assert.ok(new HttpError(400) instanceof Error);
	});

	it("supports `cause`", () => {
		const causeFixture = new Error("my fault");

		assert.equal(
			new HttpError(400, { cause: causeFixture }).cause,
			causeFixture,
		);
	});

	it("defaults to standard HTTP message", () => {
		assert.equal(new HttpError(400).message, STATUS_CODES[400]);
	});

	it("supports construction from HTTP status code", () => {
		const statusCodeFixture = 400;

		const subject = new HttpError(statusCodeFixture);

		assert.equal(subject.statusCode, statusCodeFixture);
		assert.equal(subject.body, undefined);
		assert.equal(subject.headers, undefined);
	});

	it("supports construction from HttpResult", () => {
		const statusCodeFixture = 400;
		const bodyFixture = "__http_result_body__";
		const headersFixture = {};

		const subject = new HttpError({
			statusCode: statusCodeFixture,
			headers: headersFixture,
			body: bodyFixture,
		});

		assert.equal(subject.statusCode, statusCodeFixture);
		assert.equal(subject.body, bodyFixture);
		assert.equal(subject.headers, headersFixture);
	});

	it("supports construction from empty HttpResult", () => {
		const subject = new HttpError();

		assert.equal(subject.statusCode, 500);
		assert.equal(subject.body, undefined);
		assert.equal(subject.headers, undefined);
	});
});
