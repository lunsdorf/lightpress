import assert from "node:assert/strict";
import { Readable, Writable } from "node:stream";
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
	it("sends defaults", async (t) => {
		const response = createResponse(t);

		await sendResult(response, null);

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends status code", async (t) => {
		const response = createResponse(t);
		const statusCodeFixture = 400;

		await sendResult(response, { statusCode: statusCodeFixture });

		assert.equal(response.statusCode, statusCodeFixture);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends headers", async (t) => {
		const response = createResponse(t);
		const headersFixture = {};

		await sendResult(response, { headers: headersFixture });

		assert.equal(response.statusCode, undefined);
		assert.deepEqual(response.writeHead.mock.calls[0].arguments, [
			200,
			headersFixture,
		]);
		assert.deepEqual(response.end.mock.calls[0].arguments, [null]);
	});

	it("sends headers and status code", async (t) => {
		const response = createResponse(t);
		const statusCodeFixture = 400;
		const headersFixture = {};

		await sendResult(response, {
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

	it("sends body string", async (t) => {
		const response = createResponse(t);
		const bodyFixture = "Hello World!";

		await sendResult(response, { body: bodyFixture });

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [bodyFixture]);
	});

	it("sends body buffer", async (t) => {
		const response = createResponse(t);
		const bodyFixture = Buffer.from("Hello World!");

		await sendResult(response, { body: bodyFixture });

		assert.equal(response.statusCode, 200);
		assert.equal(response.writeHead.mock.callCount(), 0);
		assert.deepEqual(response.end.mock.calls[0].arguments, [bodyFixture]);
	});

	it("sends the entire body stream before resolving", async () => {
		const chunks = [];
		const response = new Writable({
			write(chunk, _encoding, callback) {
				setImmediate(() => {
					chunks.push(chunk);
					callback();
				});
			},
		});

		await sendResult(response, { body: Readable.from(["Hello", " World!"]) });

		assert.equal(response.statusCode, 200);
		assert.equal(Buffer.concat(chunks).toString(), "Hello World!");
		assert.equal(response.writableFinished, true);
	});

	it("rejects and destroys the response when the body stream fails", async () => {
		const errorFixture = new Error("body stream failed");
		const body = new Readable({
			read() {
				setImmediate(() => this.destroy(errorFixture));
			},
		});
		const response = new Writable({
			write(_chunk, _encoding, callback) {
				callback();
			},
		});

		await assert.rejects(sendResult(response, { body }), errorFixture);

		assert.equal(body.destroyed, true);
		assert.equal(response.destroyed, true);
	});

	it("rejects and destroys the body when the response stream fails", async () => {
		const errorFixture = new Error("response stream failed");
		const body = new Readable({
			read() {
				this.push("body");
			},
		});
		const response = new Writable({
			write(_chunk, _encoding, callback) {
				callback(errorFixture);
			},
		});

		await assert.rejects(sendResult(response, { body }), errorFixture);

		assert.equal(body.destroyed, true);
		assert.equal(response.destroyed, true);
	});

	it("rejects and destroys the body when the response closes prematurely", async () => {
		const body = new Readable({
			read() {
				this.push("body");
			},
		});
		const response = new Writable({
			write() {
				this.destroy();
			},
		});

		await assert.rejects(sendResult(response, { body }), {
			code: "ERR_STREAM_PREMATURE_CLOSE",
		});

		assert.equal(body.destroyed, true);
		assert.equal(response.destroyed, true);
	});
});
