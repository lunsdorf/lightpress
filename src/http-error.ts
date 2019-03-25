import { STATUS_CODES } from "http";

export interface HttpErrorJson {
  code: number;
  error: true;
  message: string;
}

export class HttpError extends Error {
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
   * @param error The error to convert. If this is already an HTTP error
   * instance, the same reference will be returned without converting it.
   * @param code The HTTP code for the newly created HTTP error.
   */
  public static fromError(error: Error, code = 500): HttpError {
    if (error instanceof HttpError) {
      return error;
    } else {
      return new HttpError(code, error.message);
    }
  }

  /**
   * The HTTP error represents an error based on the HTTP error codes. It can be
   * used as an errors response.
   * @param code The error code used as HTTP status code.
   * @param [message] Optional error message. If no message is given, the
   * default message of the given HTTP code is used.
   */
  public constructor(code: number, message?: string) {
    super(message || STATUS_CODES[code]);

    this.code = code;
  }

  /**
   * Converts this error to a JSON object.
   * @return The converted JSON object.
   */
  public toJSON(): HttpErrorJson {
    return {
      code: this.code,
      error: true,
      message: this.message
    };
  }
}
