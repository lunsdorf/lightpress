import assert from "node:assert/strict";
import { ServerResponse } from "node:http";
import { Readable, Writable } from "node:stream";
import { describe, it } from "node:test";
import { createRequestListener } from "./create-request-listener.ts";
import { HttpError } from "./http-error.ts";

function createResponse(t) {
	return {
		statusCode: undefined,
		writeHead: t.mock.fn(),
		end: t.mock.fn(),
		destroy: t.mock.fn(),
	};
}

function assertResponse(response, statusCode, body = null) {
	assert.equal(response.statusCode, statusCode);
	assert.equal(response.writeHead.mock.callCount(), 0);
	assert.equal(response.end.mock.callCount(), 1);
	assert.deepEqual(response.end.mock.calls[0].arguments, [body]);
}

describe("createRequestListener()", () => {
	it("throws if no handler was given", () => {
		assert.throws(() => createRequestListener());
	});

	it("returns a function", () => {
		assert.equal(typeof createRequestListener(() => void 0), "function");
	});

	it("calls handler", async (t) => {
		const request = {};
		const response = createResponse(t);
		const handlerMock = t.mock.fn();

		await createRequestListener(handlerMock)(request, response);

		assert.equal(handlerMock.mock.callCount(), 1);
		assert.deepEqual(handlerMock.mock.calls[0].arguments, [request]);
	});

	it("sends the handler result", async (t) => {
		const response = createResponse(t);

		await createRequestListener(() => ({
			statusCode: 201,
			body: "created",
		}))({}, response);

		assertResponse(response, 201, "created");
	});

	it("supports async results", async (t) => {
		const response = createResponse(t);

		await createRequestListener(() =>
			Promise.resolve({ statusCode: 201, body: "created" }),
		)({}, response);

		assertResponse(response, 201, "created");
	});

	it("sends `HttpError` as result", async (t) => {
		const response = createResponse(t);
		const errorFixture = new HttpError(400);

		await createRequestListener(() => {
			throw errorFixture;
		})({}, response);

		assertResponse(response, 400);
	});

	it("supports async `HttpError` as result", async (t) => {
		const response = createResponse(t);
		const errorFixture = new HttpError(400);

		await createRequestListener(() => Promise.reject(errorFixture))(
			{},
			response,
		);

		assertResponse(response, 400);
	});

	it("sends status 500 for unhandled errors", async (t) => {
		const response = createResponse(t);
		const errorSpy = t.mock.method(console, "error", () => {});
		const errorFixture = new Error("Oh no!");

		await createRequestListener(() => {
			throw errorFixture;
		})({}, response);

		assert.deepEqual(errorSpy.mock.calls[0].arguments, [errorFixture]);
		assertResponse(response, 500);
	});

	it("sends status 500 for unhandled async errors", async (t) => {
		const response = createResponse(t);
		const errorSpy = t.mock.method(console, "error", () => {});
		const errorFixture = new Error("Oh no!");

		await createRequestListener(() => Promise.reject(errorFixture))(
			{},
			response,
		);

		assert.deepEqual(errorSpy.mock.calls[0].arguments, [errorFixture]);
		assertResponse(response, 500);
	});

	for (const method of ["writeHead", "end"]) {
		it(`logs and destroys the response when ${method} throws`, async (t) => {
			const response = createResponse(t);
			const errorSpy = t.mock.method(console, "error", () => {});
			const errorFixture = new Error(`${method} failed`);
			response[method] = t.mock.fn(() => {
				throw errorFixture;
			});

			await createRequestListener(() => ({ headers: {}, body: "body" }))(
				{},
				response,
			);

			assert.equal(errorSpy.mock.callCount(), 1);
			assert.deepEqual(errorSpy.mock.calls[0].arguments, [errorFixture]);
			assert.equal(response.writeHead.mock.callCount(), 1);
			assert.equal(response.end.mock.callCount(), method === "end" ? 1 : 0);
			assert.equal(response.destroy.mock.callCount(), 1);
			assert.deepEqual(response.destroy.mock.calls[0].arguments, []);
		});
	}

	for (const result of [
		{ headers: { "invalid header": "value" } },
		{ statusCode: 0 },
	]) {
		it(`handles an invalid HTTP result: ${JSON.stringify(result)}`, async (t) => {
			const response = new ServerResponse({ method: "GET" });
			const errorSpy = t.mock.method(console, "error", () => {});

			await createRequestListener(() => result)({}, response);

			assert.equal(errorSpy.mock.callCount(), 1);
			assert.equal(response.destroyed, true);
			assert.equal(response.headersSent, false);
		});
	}

	it("handles a failure while delivering a generated 500 response", async (t) => {
		const response = createResponse(t);
		const errorSpy = t.mock.method(console, "error", () => {});
		const handlerError = new Error("handler failed");
		const deliveryError = new Error("delivery failed");
		response.end = t.mock.fn(() => {
			throw deliveryError;
		});

		await createRequestListener(() => {
			throw handlerError;
		})({}, response);

		assert.deepEqual(
			errorSpy.mock.calls.map((call) => call.arguments),
			[[handlerError], [deliveryError]],
		);
		assertResponse(response, 500);
		assert.equal(response.destroy.mock.callCount(), 1);
	});

	it("logs a body stream failure after a partial response without sending again", async (t) => {
		const errorFixture = new Error("body stream failed");
		const errorSpy = t.mock.method(console, "error", () => {});
		const body = Readable.from(
			(async function* () {
				yield "partial body";
				throw errorFixture;
			})(),
		);
		const chunks = [];
		const response = new Writable({
			write(chunk, _encoding, callback) {
				chunks.push(chunk);
				callback();
			},
		});
		response.writeHead = t.mock.fn();
		const endSpy = t.mock.method(response, "end");

		await createRequestListener(() => ({ headers: {}, body }))({}, response);

		assert.equal(errorSpy.mock.callCount(), 1);
		assert.deepEqual(errorSpy.mock.calls[0].arguments, [errorFixture]);
		assert.equal(Buffer.concat(chunks).toString(), "partial body");
		assert.equal(response.writeHead.mock.callCount(), 1);
		assert.equal(endSpy.mock.callCount(), 0);
		assert.equal(response.destroyed, true);
		assert.equal(body.destroyed, true);
	});
});
