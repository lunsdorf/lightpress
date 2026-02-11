import { createJsonResult } from "./create-json-result";

describe("createJsonResult", () => {
	it("creates a JSON result", () => {
		expect(createJsonResult({ greet: "world" })).toEqual({
			statusCode: 200,
			headers: {
				"content-type": "application/json",
				"content-length": "17",
			},
			body: Buffer.from(JSON.stringify({ greet: "world" })),
		});
	});
	it("applies result initialization", () => {
		expect(
			createJsonResult(null, {
				statusCode: 123,
				headers: { "content-language": "en" },
			}),
		).toEqual({
			statusCode: 123,
			headers: {
				"content-language": "en",
				"content-type": "application/json",
				"content-length": "4",
			},
			body: expect.any(Buffer),
		});
	});
	it("overrides relevant content headers", () => {
		expect(
			createJsonResult(
				{},
				{
					statusCode: 200,
					headers: {
						"CoNtEnt-TyPe": "text/html",
						"content-length": 100,
					},
				},
			),
		).toEqual(
			expect.objectContaining({
				headers: {
					"content-type": "application/json",
					"content-length": "2",
				},
			}),
		);
	});
});
