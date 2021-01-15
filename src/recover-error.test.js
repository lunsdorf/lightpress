const { recoverError } = require("./recover-error");

describe("recoverError", () => {
  afterEach(() => jest.resetAllMocks());

  it("returns a function", () => {
    expect(typeof recoverError(() => void 0)).toBe("function");
  });

  it("calls given recovery function", async () => {
    const recoverMock = jest.fn();
    const errorFixture = {};

    recoverError(recoverMock)(errorFixture);

    expect(recoverMock).toHaveBeenCalledTimes(1);
    expect(recoverMock).toHaveBeenCalledWith(errorFixture);
  });

  it("calls `error.toResult()` if available", async () => {
    const recoverMock = jest.fn();
    const toResultMock = jest.fn();
    const errorFixture = { toResult: toResultMock };

    recoverError(recoverMock)(errorFixture);

    expect(recoverMock).toHaveBeenCalledTimes(0);
    expect(toResultMock).toHaveBeenCalledTimes(1);
  });

  it("calls recovery functon if `error.toResult()` throws", async () => {
    const recoverMock = jest.fn();
    const exceptionFixture = {};
    const errorFixture = {
      toResult() {
        throw exceptionFixture;
      },
    };

    recoverError(recoverMock)(errorFixture);

    expect(recoverMock).toHaveBeenCalledTimes(1);
    expect(recoverMock).toHaveBeenCalledWith(exceptionFixture);
  });
});
