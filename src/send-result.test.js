jest.mock('stream');

const { Readable } = require('stream');
const { sendResult } = require('./send-result');

describe("sendResult", () => {
  const response = {
    statusCode: void 0,
    writeHead: jest.fn(),
    end: jest.fn(),
  };

  beforeEach(() => {
    response.statusCode = void 0;
    jest.resetAllMocks();
  })

  it("sends defaults", () => {
    sendResult(response, {}, null);

    expect(response.statusCode).toBe(200);
    expect(response.writeHead).not.toHaveBeenCalled()
    expect(response.end).toHaveBeenCalledWith(null);
  });

  it("sends status code", () => {
    const statusCodeFixture = 400;

    sendResult(response, {}, { statusCode: statusCodeFixture });

    expect(response.statusCode).toBe(statusCodeFixture);
    expect(response.writeHead).not.toHaveBeenCalled()
    expect(response.end).toHaveBeenCalledWith(null);
  });

  it("sends headers", () => {
    const headersFixture = {};

    sendResult(response, {}, { headers: headersFixture });

    expect(response.statusCode).toBeUndefined();
    expect(response.writeHead).toHaveBeenCalledWith(200, headersFixture);
    expect(response.end).toHaveBeenCalledWith(null);
  });

  it("sends headers and status code", () => {
    const statusCodeFixture = 400;
    const headersFixture = {};

    sendResult(response, {}, {
      statusCode: statusCodeFixture,
      headers: headersFixture,
    });

    expect(response.statusCode).toBeUndefined();
    expect(response.writeHead).toHaveBeenCalledWith(statusCodeFixture, headersFixture);
    expect(response.end).toHaveBeenCalledWith(null);
  });

  it("sends body string", () => {
    const bodyFixture = "Hello World!";

    sendResult(response, {}, { body: bodyFixture });

    expect(response.statusCode).toBe(200);
    expect(response.writeHead).not.toHaveBeenCalled();
    expect(response.end).toHaveBeenCalledWith(bodyFixture);
  });

  it("sends body buffer", () => {
    const bodyFixture = Buffer.from("Hello World!");

    sendResult(response, {}, { body: bodyFixture });

    expect(response.statusCode).toBe(200);
    expect(response.writeHead).not.toHaveBeenCalled();
    expect(response.end).toHaveBeenCalledWith(bodyFixture);

  });

  it("sends body stream", () => {
    const bodyFixture = new Readable();

    sendResult(response, {}, { body: bodyFixture });

    expect(response.statusCode).toBe(200);
    expect(response.writeHead).not.toHaveBeenCalled();
    expect(response.end).not.toHaveBeenCalled();
    expect(bodyFixture.pipe).toHaveBeenCalledWith(response);
  });
});
