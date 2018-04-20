import { ServerRequest, ServerResponse } from "http";
import { parse, UrlWithParsedQuery } from "url";

export type HttpRequest = {
  /** The HTTP method of the incoming request. */
  method: string;

  /** The request's pathname. */
  pathname: string;

  /** Node's native incoming HTTP request. */
  raw: ServerRequest;

  /** The already parsed URL of the incoming HTTP request. */
  url: UrlWithParsedQuery;
};

export default function convertRequest(req: ServerRequest, res: ServerResponse): HttpRequest {
  const url = parse(req.url || "/", true);
  const pathname = url.pathname || "/";

  return {
    method: req.method || "GET",
    pathname,
    raw: req,
    url,
  };
}
