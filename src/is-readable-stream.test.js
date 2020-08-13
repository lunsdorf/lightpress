const { isReadableStream } = require("./is-readable-stream");
const { Readable, Duplex, PassThrough } = require("stream");

describe("isReadableStream", () => {
  it("returns `true` when a readable stream was given", () => {
    expect(isReadableStream()).toBe(false);
    expect(isReadableStream(void 0)).toBe(false);
    expect(isReadableStream(null)).toBe(false);
    expect(isReadableStream("test")).toBe(false);
    expect(isReadableStream(1)).toBe(false);
    expect(isReadableStream({})).toBe(false);
    expect(isReadableStream([])).toBe(false);
    expect(isReadableStream(new Duplex())).toBe(true);
    expect(isReadableStream(new Readable())).toBe(true);
    expect(isReadableStream(new PassThrough())).toBe(true);
  });
});
