jest.mock("./send-result");

import { createRequestListener } from "./create-request-listener";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

describe("createRequestListener()", () => {
	let requestFixture = {};
	let responseFixture = {};

	afterEach(() => {
		requestFixture = {};
		responseFixture = {};

		jest.resetAllMocks();
	});

	it("throws if no handler was given", () => {
		expect(() => createRequestListener()).toThrow();
	});

	it("returns a function", () => {
		expect(typeof createRequestListener(() => void 0)).toBe("function");
	});

	it("calls handler", async () => {
		const handlerMock = jest.fn();

		await createRequestListener(handlerMock)(requestFixture, responseFixture);

		expect(handlerMock).toHaveBeenCalledTimes(1);
		expect(handlerMock).toHaveBeenCalledWith(requestFixture);
	});

	it("calls `sendResult`", async () => {
		const resultFixture = {};

		await createRequestListener(() => resultFixture)(
			requestFixture,
			responseFixture,
		);

		expect(sendResult).toHaveBeenCalledTimes(1);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
	});

	it("supports async results", async () => {
		const resultFixture = {};

		await createRequestListener(() => Promise.resolve(resultFixture))(
			requestFixture,
			responseFixture,
		);

		expect(sendResult).toHaveBeenCalledTimes(1);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
	});

	it("sends `HttpError` as result", async () => {
		const errorFixture = new HttpError(400);

		await createRequestListener(() => {
			throw errorFixture;
		})(requestFixture, responseFixture);

		expect(sendResult).toHaveBeenCalledTimes(1);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, errorFixture);
	});

	it("supports async `HttpError` as result", async () => {
		const errorFixture = new HttpError(400);

		await createRequestListener(() => Promise.reject(errorFixture))(
			requestFixture,
			responseFixture,
		);

		expect(sendResult).toHaveBeenCalledTimes(1);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, errorFixture);
	});

	it("calls recover handler for unhandled errors", async () => {
		const errorFixture = new Error("Oh no!");
		const recoverFixture = {};
		const recoverMock = jest.fn(() => recoverFixture);

		await createRequestListener(() => {
			throw errorFixture;
		}, recoverMock)(requestFixture, responseFixture);

		expect(recoverMock).toHaveBeenCalledWith(requestFixture, errorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, recoverFixture);
	});

	it("sends result from recovered unhandled error", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");
		const recoverFixture = { statusCode: 404 };

		await createRequestListener(
			() => {
				throw errorFixture;
			},
			() => recoverFixture,
		)(requestFixture, responseFixture);

		expect(errorSpy).not.toHaveBeenCalledWith(errorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, recoverFixture);
	});

	it("sends result from recovered unhandled async error", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");
		const recoverFixture = { statusCode: 404 };

		await createRequestListener(
			() => Promise.reject(errorFixture),
			() => recoverFixture,
		)(requestFixture, responseFixture);

		expect(errorSpy).not.toHaveBeenCalledWith(errorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, recoverFixture);
	});

	it("sends status 500 if recover handler throws an error", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");
		const recoverErrorFixture = new Error("Not again!");

		await createRequestListener(
			() => Promise.reject(errorFixture),
			() => {
				throw recoverErrorFixture;
			},
		)(requestFixture, responseFixture);

		expect(errorSpy).toHaveBeenCalledWith(recoverErrorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, {
			statusCode: 500,
		});
	});

	it("sends status 500 if recover handler throws an error async", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");
		const recoverErrorFixture = new Error("Not again!");

		await createRequestListener(
			() => Promise.reject(errorFixture),
			() => Promise.reject(recoverErrorFixture),
		)(requestFixture, responseFixture);

		expect(errorSpy).toHaveBeenCalledWith(recoverErrorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, {
			statusCode: 500,
		});
	});

	it("sends status 500 for unhandled errors without recover handler", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");

		await createRequestListener(() => {
			throw errorFixture;
		})(requestFixture, responseFixture);

		expect(errorSpy).toHaveBeenCalledWith(errorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, {
			statusCode: 500,
		});
	});

	it("sends status 500 for unhandled async errors without recover handler", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		const errorFixture = new Error("Oh no!");

		await createRequestListener(() => Promise.reject(errorFixture))(
			requestFixture,
			responseFixture,
		);

		expect(errorSpy).toHaveBeenCalledWith(errorFixture);
		expect(sendResult).toHaveBeenCalledWith(responseFixture, {
			statusCode: 500,
		});
	});
});
