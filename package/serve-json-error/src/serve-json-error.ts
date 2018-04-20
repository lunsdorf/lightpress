import { HttpError, HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";

/**
 * Wraps a handler function and sends possible errors as JSON objects.
 * @param handler The handler function that will be wrapped.
 */
export default function serveJsonError(handler: HttpFunction): HttpFunction {
  return async(req: HttpRequest): Promise<HttpResult> => {
    try {
      // Explicitly await the return value so we can catch a posible promise
      // rejection.
      return await handler(req);
    } catch (error) {
      const httpError = HttpError.fromError(error);

      return {
        code: httpError.code,
        data: JSON.stringify(httpError),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }
  };
}
