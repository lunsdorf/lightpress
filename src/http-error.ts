import { STATUS_CODES } from "http";
import { LightpressError } from "./types/lightpress-error";
import { LightpressResult } from "./types/lightpress-result";

/** Basic error implementation to signal HTTP errors. */
export class HttpError extends Error implements LightpressError {
  public readonly name: string = "HttpError";
  public readonly statusCode: number;

  /**
   * The HTTP error represents an error based on the HTTP error codes.
   * @param statusCode An HTTP status code
   */
  public constructor(statusCode: number) {
    super(STATUS_CODES[statusCode]);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.statusCode = statusCode;
  }

  /** Converts the error to an HTTP result object. */
  public toResult(): LightpressResult {
    return { statusCode: this.statusCode };
  }
}
