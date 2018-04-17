import { HttpError, HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";

/**
 * Executes the given handler only if the incoming request has no payload or its
 * method is explicitly allowed.
 * @param allowed One or many HTTP methods that allow a request payload.
 * @param handler The handler function that will be wrapped.
 */
export default function withPayloadAllowed(allowed: string | string[], handler: HttpFunction): HttpFunction {
  const allowedMethods = {} as { [method: string]: true };

  if (Array.isArray(allowed)) {
    allowed.forEach(method => Object.assign(allowedMethods, { [method]: true }));
  } else {
    allowedMethods[allowed] = true;
  }

  return (req: HttpRequest): Promise<HttpResult> => !req.raw.headers["content-length"] || allowedMethods[req.method]
    ? handler(req)
    : Promise.reject(new HttpError(400));
}
