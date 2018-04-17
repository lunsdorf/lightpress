import { HttpError, HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";

/**
 * Wraps a handler function and renders possible errors using the given template
 * function.
 * @param template A function that takes an `HttpError` as an argument and
 * returns an HTML string or buffer.
 * @param handler The handler function that will be wrapped.
 */
export default function serveHtmlError(template: (error: HttpError) => string, handler: HttpFunction): HttpFunction {
  return async(req: HttpRequest): Promise<HttpResult> => {
    try {
      // Explicitly await the return value so we can catch a posible promise
      // rejection.
      return await handler(req);
    } catch (error) {
      const httpError = HttpError.fromError(error);

      return {
        code: httpError.code,
        data: template(httpError),
        headers: {
          "Content-Type": "text/html",
        },
      };
    }
  };
}
