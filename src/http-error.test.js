const { STATUS_CODES } = require("http");
const { HttpError } = require("./http-error");

describe("HttpError", () => {
  it("has static `fromError` method", () => {
    expect(typeof HttpError.fromError).toBe("function");
  });

  it("static `fromError` ignores `HttpError` instance", () => {
    const errorFixture = new HttpError(400);

    expect(HttpError.fromError(errorFixture)).toBe(errorFixture);
  });

  it("static `fromError` converts to an `HttpError`", () => {
    const errorFixture = new Error("Some Error");

    expect(HttpError.fromError(errorFixture)).toBeInstanceOf(HttpError);
  });

  it("static `fromError` sets error message", () => {
    const messageFixture = "Some Error";

    expect(HttpError.fromError(new Error(messageFixture)).message).toBe(messageFixture);
  });

  it("static `fromError` accepts optional code", () => {
    expect(HttpError.fromError(new Error("Some Error"), 400).code).toBe(400);
  });

  it("constructs to an instance of `Error`", () => {
    expect(new HttpError(400)).toBeInstanceOf(Error);
  });

  it("propagates error code", () => {
    expect(new HttpError(400).code).toBe(400);
  });

  it("defaults to standard HTTP message", () => {
    expect(new HttpError(400).message).toBe(STATUS_CODES[400]);
  });

  it("propagates error message", () => {
    expect(new HttpError(400, "Custom Error").message).toBe("Custom Error");
  });

  it("is serializable to JSON", () => {
    expect(typeof (new HttpError(400)).toJSON).toBe("function");
  });

  it("serializes to the expected JSON object", () => {
    const codeFixture = 400;
    const messageFixture = "Some Error";

    expect(new HttpError(codeFixture, messageFixture).toJSON()).toEqual({
      code: codeFixture,
      error: messageFixture,
    });
  });
});
