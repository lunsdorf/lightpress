const { STATUS_CODES } = require("http");
const { HttpError } = require("./http-error");

describe("HttpError", () => {
  it("constructs to an instance of `Error`", () => {
    expect(new HttpError(400)).toBeInstanceOf(Error);
  });

  it("has the correct statusCode", () => {
    expect(new HttpError(400).statusCode).toBe(400);
  });

  it("defaults to standard HTTP message", () => {
    expect(new HttpError(400).message).toBe(STATUS_CODES[400]);
  });

  it("is serializable to HTTP result", () => {
    expect(typeof new HttpError(400).toResult).toBe("function");
  });

  it("serializes to the expected HTTP result object", () => {
    const codeFixture = 400;

    expect(new HttpError(codeFixture).toResult()).toEqual({
      statusCode: codeFixture,
    });
  });
});
