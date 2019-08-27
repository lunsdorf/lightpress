jest.mock('./send-result');

const { sendError } = require('./send-error');
const { sendResult } = require('./send-result');
const { HttpError } = require('./http-error');

describe("sendError", () => {
  beforeEach(() => jest.resetAllMocks());

  it("delegates to `resultHandler`", () => {
    const responseFixture = {};
    const codeFixture = 400;

    sendError(responseFixture, new HttpError(400));

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, { statusCode: codeFixture });
  });
});