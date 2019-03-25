import { OutgoingHttpHeaders } from "http";
import { Readable } from "stream";
import { LightpressRequestHandle } from "./create-request-handle";

export type LightpressResult = {
  /** Optional HTTP response status code. Defaults to `200`. */
  code?: number;

  /** Optional response payload. */
  data?: null | string | Buffer | Readable;

  /** Optional HTTP response headers. */
  headers?: OutgoingHttpHeaders;
};

function isReadableStream(data?: null | string | Buffer | Readable): data is Readable {
  return data instanceof Readable;
}

export function sendResult(handle: LightpressRequestHandle, result: LightpressResult): void {
  const { response } = handle;
  const statusCode = result.code || 200;

  if (result.headers) {
    response.writeHead(statusCode, result.headers);
  } else {
    response.statusCode = statusCode;
  }

  if (isReadableStream(result.data)) {
    result.data.pipe(response);
  } else {
    response.end(result.data);
  }
}
