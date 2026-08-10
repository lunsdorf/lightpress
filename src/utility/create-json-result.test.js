import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createJsonResult } from "./create-json-result.ts";

describe("createJsonResult", () => {
	it("creates a JSON result", () => {
		assert.deepEqual(createJsonResult({ greet: "world" }), {
			statusCode: 200,
			headers: {
				"content-type": "application/json",
				"content-length": "17",
			},
			body: Buffer.from(JSON.stringify({ greet: "world" })),
		});
	});

	it("applies result initialization", () => {
		assert.deepEqual(
			createJsonResult(null, {
				statusCode: 123,
				headers: { "content-language": "en" },
			}),
			{
				statusCode: 123,
				headers: {
					"content-language": "en",
					"content-type": "application/json",
					"content-length": "4",
				},
				body: Buffer.from(JSON.stringify(null)),
			},
		);
	});

	it("overrides relevant content headers", () => {
		const result = createJsonResult(
			{},
			{
				statusCode: 200,
				headers: {
					"CoNtEnt-TyPe": "text/html",
					"content-length": 100,
				},
			},
		);

		assert.deepEqual(result.headers, {
			"content-type": "application/json",
			"content-length": "2",
		});
	});
});
