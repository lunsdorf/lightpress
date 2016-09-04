import {STATUS_CODES} from "http";

export default class HttpError extends Error {
  /**
   * Error type name.
   */
  public name: string = "HttpError";

  /**
   * The error's HTTP code.
   */
  public code: number;

  /**
   * Converts the given error to an HTTP error instance.
   * @param error
   */
  public static fromError (error: Error): HttpError {
    if (error instanceof HttpError) {
      return error;
    } else {
      return new HttpError(500, error.message);
    }
  }

  /**
   * The HTTP error represents an error based on the HTTP error codes. It can be
   * used as an errors response.
   * @param code The error code used as HTTP status code.
   * @param [message] Optional error message. If no message is given, the
   * default message of the given HTTP code is used.
   */
  constructor (code: number, message?: string) {
    super(message || STATUS_CODES[code]);

    this.code = code;
  }

  /**
   * Converts this error to a JSON object.
   * @return The converted JSON object.
   */
  public toJSON (): any {
    return {
      code: this.code,
      error: true,
      message: this.message,
    };
  }
}
