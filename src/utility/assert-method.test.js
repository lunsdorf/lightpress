import { HttpError } from "../http-error";
import { assertMethod } from "./assert-method";

describe("assertMethod", () => {
	it("asserts a request HTTP method", () => {
		expect(assertMethod({ method: "GET" }, "GET")).toBeUndefined();
	});
	it("allows arbitrary HTTP methods", () => {
		expect(assertMethod({ method: "SOMETHING" }, "SOMETHING")).toBeUndefined();
	});
	it("throws an HttpError with code 405", () => {
		expect(() => assertMethod({ method: "POST" }, "GET")).toThrow(
			new HttpError(405),
		);
	});
	it("expects exact match", () => {
		expect(() => assertMethod({ method: "GET" }, "get")).toThrow();
	});
});
