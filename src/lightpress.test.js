jest.mock("./send-error");
jest.mock("./send-result");

const { lightpress } = require("./lightpress");
const { sendError } = require("./send-error");
const { sendResult } = require("./send-result");

describe("lightpress", () => {
  afterEach(() => jest.resetAllMocks());

  it("throws an error if no handler was given", () => {
    expect(() => lightpress()).toThrowError();
  });

  it("returns a function", () => {
    expect(typeof lightpress(() => void 0)).toBe("function");
  });

  it("calls handler", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const handlerMock = jest.fn();

    await lightpress(handlerMock)(requestFixture, responseFixture);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith({ request: requestFixture });
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
    const errorFixture = {};

    await lightpress(() => Promise.reject(errorFixture))(
      requestFixture,
      responseFixture
    );

    expect(sendError).toHaveBeenCalledTimes(1);
    expect(sendError).toHaveBeenCalledWith(responseFixture, errorFixture);
  });
});
