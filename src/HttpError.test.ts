import * as test from "tape";
import {STATUS_CODES} from "http";

import HttpError from "./HttpError";

test("The `HttpError` constructor", t => {
  t.equal(typeof HttpError.fromError, "function", "should have a `fromError` method to convert errors");
  t.end();
});

test("The `HttpError` instance", t => {
  const code = 400;
  const message = "Custom Error";
  const e1: HttpError = new HttpError(code);
  const e2: HttpError = new HttpError(code, message);
  const e3: HttpError = HttpError.fromError(new Error(message));

  t.ok(e1 instanceof Error, "should be an instance of `Error`");
  t.equal(e1.code, code, "should have the error code passed to the constructor");
  t.equal(e1.message, STATUS_CODES[code], "should default to the corresponding HTTP message");
  t.equal(e2.message, message, "should have the error message passed to the constructor");
  t.equal(e1, HttpError.fromError(e1), "should not convert an `HttpError`");
  t.equal(e3.code, 500, "should have error code `500` when converted from a non `HttpError`");
  t.equal(e3.message, message, "should have the error message from the given error when converted");
  t.equal(typeof e2.toJSON, "function", "should be serializable to JSON");
  t.isEquivalent(e2.toJSON(), {code, message, error: true}, "should serialize to the expected JSON object");
  t.end();
});
