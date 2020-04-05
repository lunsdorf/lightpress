jest.mock("./send-result");
jest.mock("./send-error");

const { lightpress } = require("./lightpress");
const { sendError } = require("./send-error");
const { sendResult } = require("./send-result");

describe("lightpress", () => {
  beforeEach(() => jest.resetAllMocks());

  it("throws an error if no handler was given", () => {
    expect(() => lightpress()).toThrowError();
  });

  it("returns a function", () => {
    expect(typeof lightpress(() => void 0)).toBe("function");
  });

  it("calls handler with default context", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const handlerMock = jest.fn();

    await lightpress(handlerMock)(requestFixture, responseFixture);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith({ request: requestFixture });
  });

  it("calls handler with context from `createContext` function", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const contextFixture = {};
    const createContextMock = jest.fn(() => contextFixture);
    const handlerMock = jest.fn();

    await lightpress(handlerMock, { createContext: createContextMock })(
      requestFixture,
      responseFixture
    );

    expect(createContextMock).toHaveBeenCalledTimes(1);
    expect(createContextMock).toHaveBeenCalledWith(
      requestFixture,
      responseFixture
    );
    expect(handlerMock).toHaveBeenCalledWith(contextFixture);
  });

  it("calls `sendResult`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const resultFixture = {};

    await lightpress(() => resultFixture)(requestFixture, responseFixture);

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
  });

  it("calls `sendError`", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = {};

    await lightpress(() => {
      throw errorFixture;
    })(requestFixture, responseFixture);

    expect(sendError).toHaveBeenCalledTimes(1);
    expect(sendError).toHaveBeenCalledWith(responseFixture, errorFixture);
  });

  it("calls `sendError` on `createContext` error", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = {};
    const createContextMock = jest.fn(() => {
      throw errorFixture;
    });

    await lightpress(() => null, { createContext: createContextMock })(
      requestFixture,
      responseFixture
    );

    expect(sendError).toHaveBeenCalledTimes(1);
    expect(sendError).toHaveBeenCalledWith(responseFixture, errorFixture);
  });

  it("supports async result", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const resultFixture = {};

    await lightpress(() => Promise.resolve(resultFixture))(
      requestFixture,
      responseFixture
    );

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
  });

  it("supports async error", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = { toResult: jest.fn() };

    await lightpress(() => Promise.reject(errorFixture))(
      requestFixture,
      responseFixture
    );

    expect(sendError).toHaveBeenCalledTimes(1);
    expect(sendError).toHaveBeenCalledWith(responseFixture, errorFixture);
  });
});
