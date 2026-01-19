import { STATUS_CODES } from "node:http";
import { HttpError } from "./http-error";

describe("HttpError", () => {
	it("constructs to an instance of `Error`", () => {
		expect(new HttpError(400)).toBeInstanceOf(Error);
	});

	it("supports `cause`", () => {
		const causeFixture = new Error("my fault");

		expect(new HttpError(400, { cause: causeFixture }).cause).toBe(
			causeFixture,
		);
	});

	it("defaults to standard HTTP message", () => {
		expect(new HttpError(400).message).toBe(STATUS_CODES[400]);
	});

	it("supports construction from HTTP status code", () => {
		const statusCodeFixture = 400;

		const subject = new HttpError(statusCodeFixture);

		expect(subject.statusCode).toBe(statusCodeFixture);
		expect(subject.body).toBeUndefined();
		expect(subject.headers).toBeUndefined();
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

		expect(subject.statusCode).toBe(statusCodeFixture);
		expect(subject.body).toBe(bodyFixture);
		expect(subject.headers).toBe(headersFixture);
	});

	it("supports construction from empty HttpResult", () => {
		const subject = new HttpError();

		expect(subject.statusCode).toBe(500);
		expect(subject.body).toBeUndefined();
		expect(subject.headers).toBeUndefined();
	});
});
