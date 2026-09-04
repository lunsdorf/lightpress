import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HttpError } from "../http-error.ts";
import { withErrorBoundary } from "./with-error-boundary.ts";

describe("withErrorBoundary()", () => {
	it("returns handler result without calling error handler", async (t) => {
		const request = {};
		const context = {};
		const resultFixture = { statusCode: 200 };
		const handlerMock = t.mock.fn(() => resultFixture);
		const errorHandlerMock = t.mock.fn();
		const handler = withErrorBoundary(handlerMock, errorHandlerMock);

		assert.deepEqual(await handler(request, context), resultFixture);
		assert.deepEqual(handlerMock.mock.calls[0].arguments, [request, context]);
		assert.equal(errorHandlerMock.mock.callCount(), 0);
	});

	it("calls error handler for thrown errors", async (t) => {
		const request = {};
		const context = {};
		const errorFixture = new Error("Oh no!");
		const boundaryResultFixture = { statusCode: 204 };
		const errorHandlerMock = t.mock.fn(() => boundaryResultFixture);
		const handler = withErrorBoundary((_request, _context) => {
			throw errorFixture;
		}, errorHandlerMock);

		assert.deepEqual(await handler(request, context), boundaryResultFixture);
		assert.deepEqual(errorHandlerMock.mock.calls[0].arguments, [
			errorFixture,
			request,
			context,
		]);
	});

	it("returns result from async error handler for rejected errors", async () => {
		const errorFixture = new Error("Oh no!");
		const boundaryResultFixture = { statusCode: 404 };
		const handler = withErrorBoundary(
			() => Promise.reject(errorFixture),
			() => Promise.resolve(boundaryResultFixture),
		);

		assert.deepEqual(await handler({}), boundaryResultFixture);
	});

	it("passes thrown HttpError to error handler", async (t) => {
		const request = {};
		const errorFixture = new HttpError(404);
		const boundaryResultFixture = { statusCode: 404 };
		const errorHandlerMock = t.mock.fn(() => boundaryResultFixture);
		const handler = withErrorBoundary(() => {
			throw errorFixture;
		}, errorHandlerMock);

		assert.deepEqual(await handler(request), boundaryResultFixture);
		assert.deepEqual(errorHandlerMock.mock.calls[0].arguments, [
			errorFixture,
			request,
		]);
	});

	it("passes rejected HttpError to error handler", async (t) => {
		const request = {};
		const errorFixture = new HttpError(404);
		const boundaryResultFixture = { statusCode: 404 };
		const errorHandlerMock = t.mock.fn(() => boundaryResultFixture);
		const handler = withErrorBoundary(
			() => Promise.reject(errorFixture),
			errorHandlerMock,
		);

		assert.deepEqual(await handler(request), boundaryResultFixture);
		assert.deepEqual(errorHandlerMock.mock.calls[0].arguments, [
			errorFixture,
			request,
		]);
	});

	it("propagates errors from error handler", async () => {
		const errorFixture = new Error("Oh no!");
		const errorHandlerErrorFixture = new Error("Not again!");
		const handler = withErrorBoundary(
			() => Promise.reject(errorFixture),
			() => {
				throw errorHandlerErrorFixture;
			},
		);

		await assert.rejects(handler({}), errorHandlerErrorFixture);
	});

	it("propagates async errors from error handler", async () => {
		const errorFixture = new Error("Oh no!");
		const errorHandlerErrorFixture = new Error("Not again!");
		const handler = withErrorBoundary(
			() => Promise.reject(errorFixture),
			() => Promise.reject(errorHandlerErrorFixture),
		);

		await assert.rejects(handler({}), errorHandlerErrorFixture);
	});
});
