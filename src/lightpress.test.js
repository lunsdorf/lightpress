jest.mock('./send-result');
jest.mock('./send-error');

const { lightpress } = require("./lightpress");
const { sendError } = require('./send-error');
const { sendResult } = require('./send-result');

describe("lightpress", () => {
  beforeEach(() => jest.resetAllMocks());

  it("throws an error if no handler was given", () => {
    expect(() => lightpress()).toThrowError();
  });

  it("returns a function", () => {
    expect(typeof lightpress(() => void 0)).toBe("function");
  });

  it("calls given handler", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const handlerMock = jest.fn();

    await lightpress(handlerMock)(
      requestFixture,
      responseFixture
    );

    expect(handlerMock).toHaveBeenCalledTimes(1)
    expect(handlerMock).toHaveBeenCalledWith(expect.objectContaining({
      timestamp: expect.any(Number),
      request: requestFixture,
    }))
  });

  it("calls default `sendResult`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const resultFixture = {};

    await lightpress(() => resultFixture)(
      requestFixture,
      responseFixture
    );

    expect(sendResult).toHaveBeenCalledTimes(1)
    expect(sendResult).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      resultFixture
    );
  });

  it("calls custom `sendResult`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const resultFixture = {};
    const sendResultMock = jest.fn();

    await lightpress(() => resultFixture, { sendResult: sendResultMock })(
      requestFixture,
      responseFixture
    );

    expect(sendResultMock).toHaveBeenCalledTimes(1)
    expect(sendResultMock).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      resultFixture
    );
  });

  it("calls default `sendError`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = new Error("error");

    await lightpress(() => { throw errorFixture })(
      requestFixture,
      responseFixture
    );

    expect(sendError).toHaveBeenCalledTimes(1)
    expect(sendError).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      errorFixture
    );
  });

  it("calls custom `sendError`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = new Error("error");
    const sendErrorMock = jest.fn();

    await lightpress(() => { throw errorFixture }, { sendError: sendErrorMock })(
      requestFixture,
      responseFixture
    );

    expect(sendErrorMock).toHaveBeenCalledTimes(1)
    expect(sendErrorMock).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      errorFixture
    );
  });

  it("supports async result", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const resultFixture = {};

    await lightpress(() => Promise.resolve(resultFixture))(
      requestFixture,
      responseFixture
    );

    expect(sendResult).toHaveBeenCalledTimes(1)
    expect(sendResult).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      resultFixture
    );
  });

  it("supports async error", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = new Error("error");

    await lightpress(() => Promise.reject(errorFixture))(
      requestFixture,
      responseFixture
    );

    expect(sendError).toHaveBeenCalledTimes(1)
    expect(sendError).toHaveBeenCalledWith(
      responseFixture,
      expect.objectContaining({
        request: requestFixture,
        timestamp: expect.any(Number),
        url: expect.any(Object),
      }),
      errorFixture
    );
  });
});
