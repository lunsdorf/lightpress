import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createRequestListener } from "./create-request-listener.ts";
import { HttpError } from "./http-error.ts";

function createResponse(t) {
	return {
		statusCode: undefined,
		writeHead: t.mock.fn(),
		end: t.mock.fn(),
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
});
