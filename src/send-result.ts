import { ServerResponse } from "http";
import { Readable } from "stream";
import { LightpressResult } from "./types/lightpress-result";

export function sendResult(response: ServerResponse, result: LightpressResult): void {
  const statusCode = result && result.statusCode ? result.statusCode : 200;
  const headers = result && result.headers ? result.headers : null;
  const body = result && result.body ? result.body : null;

  if (headers) {
    response.writeHead(statusCode, headers);
  } else {
    response.statusCode = statusCode;
  }

  if (body instanceof Readable) {
    body.pipe(response);
  } else {
    response.end(body);
  }
}
