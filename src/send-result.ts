import { ServerResponse } from "http";
import { Readable } from "stream";
import { LightpressInfo } from "./types/lightpress-info";
import { LightpressResult } from "./types/lightpress-result";

export function sendResult<T extends LightpressInfo = LightpressInfo>(response: ServerResponse, _info: T, result: LightpressResult): void {
  const code = result && result.code ? result.code : 200;
  const headers = result && result.headers ? result.headers : null;
  const data = result && result.data ? result.data : null;

  if (headers) {
    response.writeHead(code, headers);
  } else {
    response.statusCode = code;
  }

  if (data instanceof Readable) {
    data.pipe(response);
  } else {
    response.end(data);
  }
}
