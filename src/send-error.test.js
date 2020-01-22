jest.mock("./send-result");

const { sendError } = require("./send-error");
const { sendResult } = require("./send-result");
const { HttpError } = require("./http-error");
const { STATUS_CODES } = require("http")

describe("sendError", () => {
  beforeEach(() => jest.resetAllMocks());

  it("delegates to `resultHandler`", () => {
    const responseFixture = {};
    const codeFixture = 400;

    sendError(responseFixture, new HttpError(codeFixture));

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, {
      statusCode: codeFixture,
      body: STATUS_CODES[codeFixture],
    });
  });
});
