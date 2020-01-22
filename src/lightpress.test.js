jest.mock("./create-context");
jest.mock("./send-result");
jest.mock("./send-error");

const { lightpress } = require("./lightpress");
const { createContext } = require("./create-context");
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

  it("calls given handler", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const contextFixture = {};
    const handlerMock = jest.fn();

    createContext.mockImplementation(() => contextFixture);

    await lightpress(handlerMock)(
      requestFixture,
      responseFixture
    );

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(contextFixture);
  });

  it("calls `createContext`", async () => {
    const requestFixture = {};
    const responseFixture = {};

    await lightpress(() => null)(
      requestFixture,
      responseFixture
    );

    expect(createContext).toHaveBeenCalledTimes(1)
    expect(createContext).toHaveBeenCalledWith(
      requestFixture,
      responseFixture
    );
  });

  it("calls `createContext` defined via options", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const createContextMock = jest.fn();

    await lightpress(() => null, { createContext: createContextMock })(
      requestFixture,
      responseFixture
    );

    expect(createContextMock).toHaveBeenCalledTimes(1)
    expect(createContextMock).toHaveBeenCalledWith(
      requestFixture,
      responseFixture
    );
  });

  it("calls `sendResult`", async () => {
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
      resultFixture
    );
  });

  it("calls `sendError`", async () => {
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
      errorFixture
    );
  });
});
