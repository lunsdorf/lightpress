import { HttpError } from "../http-error.ts";
import { assertContentType } from "./assert-content-type.ts";

describe("assertContentType", () => {
	it("asserts a requests HTTP mthod", () => {
		expect(
			assertContentType(
				{ headers: { "content-type": "text/plain" } },
				"text/plain",
			),
		).toBeUndefined();
	});
	it("allows arbitrary content types", () => {
		expect(
			assertContentType(
				{ headers: { "content-type": "my/content" } },
				"my/content",
			),
		).toBeUndefined();
	});
	it("throws an HttpError with code 415", () => {
		expect(() =>
			assertContentType(
				{ headers: { "content-type": "text/plain" } },
				"text/html",
			),
		).toThrow(new HttpError(415));
	});
	it("expects exact match", () => {
		expect(() =>
			assertContentType(
				{ headers: { "content-type": "text/plain" } },
				"TEXT/PLAIN",
			),
		).toThrow();
		expect(() =>
			assertContentType(
				{ headers: { "content-type": "text/plain;charset=iso-8859-1" } },
				"text/plain",
			),
		).toThrow();
	});
});
