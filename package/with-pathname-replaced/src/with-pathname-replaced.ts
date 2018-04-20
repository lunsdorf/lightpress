import { HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";

export type Replacer = (substring: string, ...args: any[]) => string;

/**
 * Replaces a part in the request's pathname before the wrapped handler is
 * invoked.
 * @param search The part of the pathname that will be replaced.
 * @param replace The replacement for the given search value.
 * @param handler The handler function that will be wrapped.
 */
export default function withPathnameReplaced(
  search: string | RegExp,
  replace: string | Replacer,
  handler: HttpFunction
): HttpFunction {
  return (req: HttpRequest): Promise<HttpResult> => handler(
    // FIXME: remove typecast once typescript issue was fixed
    // https://github.com/Microsoft/TypeScript/issues/22378
    Object.assign(req, { pathname: req.pathname.replace(search, replace as string) })
  );
}
