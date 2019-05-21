import { ServerResponse } from "http";
import { Readable } from "stream";
import { LightpressInfo } from "./types/lightpress-info";
import { LightpressResult } from "./types/lightpress-result";

export function sendResult<T extends LightpressInfo = LightpressInfo>(response: ServerResponse, _info: T, result: LightpressResult): void {
  const statusCode = result && result.statusCode ? result.statusCode : 200;
  const headers = result && result.headers ? result.headers : null;
  const data = result && result.body ? result.body : null;

  if (headers) {
    response.writeHead(statusCode, headers);
  } else {
    response.statusCode = statusCode;
  }

  if (data instanceof Readable) {
    data.pipe(response);
  } else {
    response.end(data);
  }
}
