jest.mock("./send-result");

const { lightpress } = require("./lightpress");
const { sendResult } = require("./send-result");

describe("lightpress", () => {
  afterEach(() => jest.resetAllMocks());

  it("throws if no handler was given", () => {
    expect(() => lightpress()).toThrowError();
  });

  it("throws if given error recovery handler is not a function", () => {
    expect(() => lightpress(() => void 0, "Not A Function")).toThrowError();
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

  it("calls error recovery handler", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = {};
    const errorResultFixture = {};
    const recoverMock = jest.fn(() => errorResultFixture);

    await lightpress(() => {
      throw errorFixture;
    }, recoverMock)(requestFixture, responseFixture);

    expect(recoverMock).toHaveBeenCalledTimes(1);
    expect(recoverMock).toHaveBeenCalledWith(requestFixture, errorFixture);
    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(
      responseFixture,
      errorResultFixture
    );
  });

  it("supports async results", async () => {
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

  it("supports async errors", async () => {
    const requestFixture = {};
    const responseFixture = {};
    const errorFixture = {};
    const errorResultFixture = {};
    const recoverMock = jest.fn(() => errorResultFixture);

    await lightpress(() => Promise.reject(errorFixture), recoverMock)(
      requestFixture,
      responseFixture
    );

    expect(recoverMock).toHaveBeenCalledTimes(1);
    expect(recoverMock).toHaveBeenCalledWith(requestFixture, errorFixture);
    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(
      responseFixture,
      errorResultFixture
    );
  });
});
