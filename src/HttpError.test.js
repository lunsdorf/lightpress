const { STATUS_CODES } = require("http");
const HttpError = require("./HttpError").default;

describe("The `HttpError` constructor", () => {
  it("should have a `fromError` method to convert errors", () => {
    expect(typeof HttpError.fromError).toBe("function");
  });
});

describe("The `HttpError` instance", () => {
  const code = 400;
  const message = "Custom Error";
  const e1 = new HttpError(code);
  const e2 = new HttpError(code, message);
  const e3 = HttpError.fromError(new Error(message));
  const e4 = HttpError.fromError(new Error(message), 400);

  it("is an instance of `Error`", () => {
    expect(e1).toBeInstanceOf(Error);
  });

  it("has the error code passed to the constructor", () => {
    expect(e1.code).toBe(code);
  });

  it("defaults to the corresponding HTTP message", () => {
    expect(e1.message).toBe(STATUS_CODES[code]);
  });

  it("has the error message passed to the constructor", () => {
    expect(e2.message).toBe(message);
  });

  it("does not convert an `HttpError`", () => {
    expect(HttpError.fromError(e1)).toBe(e1);
  });

  it("has default code `500` when converted from non `HttpError`", () => {
    expect(e3.code).toBe(500);
  });

  it("has the error message from the given error when converted", () => {
    expect(e3.message).toBe(message);
    expect(e4.message).toBe(message);
  });

  it("has a custom code when defined and converted from non `HttpError`", () => {
    expect(e4.code).toBe(400);
  });

  it("is serializable to JSON", () => {
    expect(typeof e2.toJSON).toBe("function");
  });

  it("serializes to the expected JSON object", () => {
    expect(e2.toJSON()).toEqual({ code, message, error: true });
  });
});
