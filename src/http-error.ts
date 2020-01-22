import { STATUS_CODES } from "http";
import { LightpressResult } from "./types/lightpress-result";

export class HttpError extends Error {
  /** Error type name. */
  public readonly name: string = "HttpError";

  /** The error's HTTP code. */
  public code: number;

  /**
   * The HTTP error represents an error based on the HTTP error codes. It can be
   * used as an errors response.
   * @param code The error code used as HTTP status code.
   */
  public constructor(code: number) {
    super(STATUS_CODES[code]);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.code = code;
  }

  /** Converts the error to a result object. */
  public toResult(): LightpressResult {
    return {
      statusCode: this.code,
      body: this.message,
    };
  }
}
