jest.mock("./send-result");

import { createRequestListener } from "./create-request-listener";
import { HttpError } from "./http-error";
import { sendResult } from "./send-result";

describe("createRequestListener()", () => {
  const requestFixture = { pause: jest.fn() };
  const responseFixture = { end: jest.fn() };

  afterEach(() => jest.resetAllMocks());

  it("throws if no handler was given", () => {
    expect(() => createRequestListener()).toThrow();
  });

  it("returns a function", () => {
    expect(typeof createRequestListener(() => void 0)).toBe("function");
  });

  it("calls handler", async () => {
    const emptyContext = {};
    const handlerMock = jest.fn();

    await createRequestListener(handlerMock)(requestFixture, responseFixture);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(
      requestFixture,
      expect.objectContaining(emptyContext),
    );
  });

  it("calls `sendResult`", async () => {
    const resultFixture = {};

    await createRequestListener(() => resultFixture)(
      requestFixture,
      responseFixture,
    );

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
  });

  it("supports async results", async () => {
    const resultFixture = {};

    await createRequestListener(() => Promise.resolve(resultFixture))(
      requestFixture,
      responseFixture,
    );

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, resultFixture);
  });

  it("sends `HttpError` as result", async () => {
    const errorFixture = new HttpError(400);

    await createRequestListener(() => {
      throw errorFixture;
    })(requestFixture, responseFixture);

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, errorFixture);
  });

  it("supports async `HttpError` as result", async () => {
    const errorFixture = new HttpError(400);

    await createRequestListener(() => Promise.reject(errorFixture))(
      requestFixture,
      responseFixture,
    );

    expect(sendResult).toHaveBeenCalledTimes(1);
    expect(sendResult).toHaveBeenCalledWith(responseFixture, errorFixture);
  });

  it("throws for Non-`HttpError`'s", async () => {
    const errorFixture = new Error("Oh no!");

    const subject = createRequestListener(() => {
      throw errorFixture;
    });

    await expect(subject(requestFixture, responseFixture)).rejects.toBe(
      errorFixture,
    );

    expect(sendResult).not.toHaveBeenCalled();
  });

  it("throws for async  Non-`HttpError`'s", async () => {
    const errorFixture = new Error("Oh no!");

    const subject = createRequestListener(() => Promise.reject(errorFixture));

    await expect(subject(requestFixture, responseFixture)).rejects.toBe(
      errorFixture,
    );

    expect(sendResult).not.toHaveBeenCalled();
  });
});
