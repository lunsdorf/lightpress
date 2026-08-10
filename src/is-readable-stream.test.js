import assert from "node:assert/strict";
import { Duplex, PassThrough, Readable, Writable } from "node:stream";
import { describe, it } from "node:test";
import { isReadableStream } from "./is-readable-stream.ts";

describe("isReadableStream", () => {
	it("returns `true` when a readable stream was given", () => {
		assert.equal(isReadableStream(), false);
		assert.equal(isReadableStream(void 0), false);
		assert.equal(isReadableStream(null), false);
		assert.equal(isReadableStream("test"), false);
		assert.equal(isReadableStream(1), false);
		assert.equal(isReadableStream([]), false);
		assert.equal(isReadableStream(new Writable()), false);
		assert.equal(isReadableStream(new Duplex()), true);
		assert.equal(isReadableStream(new PassThrough()), true);
		assert.equal(isReadableStream(new Readable()), true);
	});
});
