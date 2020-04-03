jest.mock("./send-result");

const { sendError } = require("./send-error");
const { sendResult } = require("./send-result");
const { HttpError } = require("./http-error");

describe("sendError", () => {
  beforeEach(() => jest.resetAllMocks());

  it("calles `sendResult`", () => {
    const responseFixture = {};

    sendError(responseFixture, new HttpError(400));

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, {
      statusCode: 400,
    });
  });

  it("calles `toResult` on HTTP error", () => {
    const resultFixture = {};
    const errorFixture = new HttpError(400);
    const toResultSpy = jest
      .spyOn(errorFixture, "toResult")
      .mockImplementation(() => resultFixture);

    sendError({}, errorFixture);

    expect(toResultSpy).toHaveBeenCalledTimes(1);
  });

  it("writes to `console.error` if `LIGHTPRESS_ERROR` set to `verbose`", () => {
    const consoleSpy = jest
      .spyOn(global.console, "error")
      .mockImplementation(() => void 0);
    const errorFixture = new HttpError(400);

    process.env.LIGHTPRESS_ERROR = "verbose";

    sendError({}, errorFixture);

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith(errorFixture);

    process.env.LIGHTPRESS_ERROR = void 0;
  });

  it("doesn't write to `console.error` if `LIGHTPRESS_ERROR` not set", () => {
    const consoleSpy = jest
      .spyOn(global.console, "error")
      .mockImplementation(() => void 0);

    process.env.LIGHTPRESS_ERROR = void 0;

    sendError({}, new HttpError(400));

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("sends 500 for unhandled error", () => {
    const responseFixture = {};

    sendError(responseFixture, new Error("some error"));

    expect(sendResult).toHaveBeenCalledWith(responseFixture, {
      statusCode: 500,
    });
  });
});
