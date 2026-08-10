import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { sendResult } from "./send-result.ts";

function createResponse(t) {
	return {
		statusCode: undefined,
		writeHead: t.mock.fn(),
		end: t.mock.fn(),
	};
}

describe("sendResult", () => {
	it("sends defaults", (t) => {
		const response = createResponse(t);

		sendResult(response, null);

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends status code", (t) => {
		const response = createResponse(t);
		const statusCodeFixture = 400;

		sendResult(response, { statusCode: statusCodeFixture });

		assert.equal(response.statusCode, statusCodeFixture);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends headers", (t) => {
		const response = createResponse(t);
		const headersFixture = {};

		sendResult(response, { headers: headersFixture });

		assert.equal(response.statusCode, undefined);
		assert.deepEqual(response.writeHead.mock.calls[0].arguments, [
			200,
			headersFixture,
		]);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends headers and status code", (t) => {
		const response = createResponse(t);
		const statusCodeFixture = 400;
		const headersFixture = {};

		sendResult(response, {
			statusCode: statusCodeFixture,
			headers: headersFixture,
		});

		assert.equal(response.statusCode, undefined);
		assert.deepEqual(response.writeHead.mock.calls[0].arguments, [
			statusCodeFixture,
			headersFixture,
		]);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends body string", (t) => {
		const response = createResponse(t);
		const bodyFixture = "Hello World!";

		sendResult(response, { body: bodyFixture });

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [bodyFixture]);
	});

	it("sends body buffer", (t) => {
		const response = createResponse(t);
		const bodyFixture = Buffer.from("Hello World!");

		sendResult(response, { body: bodyFixture });

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [bodyFixture]);
	});

	it("sends body stream", (t) => {
		const response = createResponse(t);
		const bodyFixture = new Readable();

		bodyFixture.pipe = t.mock.fn();

		sendResult(response, { body: bodyFixture });

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.equal(response.end.mock.callCount(), 0);
		assert.deepEqual(bodyFixture.pipe.mock.calls[0].arguments, [response]);
	});
});
