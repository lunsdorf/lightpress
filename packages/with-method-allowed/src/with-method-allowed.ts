import { HttpError, HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";

/**
 * Executes the given handler only if the method of the incoming request is
 * allowed.
 * @param allowed One or many allowed HTTP methods.
 * @param handler The handler function that will be wrapped.
 */
export default function withMethodAllowed(allowed: string | string[], handler: HttpFunction): HttpFunction {
  const allowedMethods = {} as { [method: string]: true };

  if (Array.isArray(allowed)) {
    allowed.forEach(method => Object.assign(allowedMethods, { [method]: true }));
  } else {
    allowedMethods[allowed] = true;
  }

  return (req: HttpRequest): Promise<HttpResult> => allowedMethods[req.method]
    ? handler(req)
    : Promise.reject(new HttpError(405));
}
