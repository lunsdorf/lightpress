import { ServerResponse } from "http";
import { LightpressResult } from "./types/lightpress-result";
import { isReadableStream } from "./is-readable-stream";

/** Takes a `LightpressResult` and sends it as HTTP response. */
export function sendResult(
  response: ServerResponse,
  result: LightpressResult
): void {
  const statusCode = result && result.statusCode ? result.statusCode : 200;
  const headers = result && result.headers ? result.headers : null;
  const body = result && result.body ? result.body : null;

  if (headers) {
    response.writeHead(statusCode, headers);
  } else {
    response.statusCode = statusCode;
  }

  if (isReadableStream(body)) {
    body.pipe(response);
  } else {
    response.end(body);
  }
}
