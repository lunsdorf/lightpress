import { OutgoingHttpHeaders, ServerRequest, ServerResponse } from "http";
import { Readable, Transform } from "stream";

export type HttpResult = {
  /** The HTTP status code to send to the requesting client. */
  code: number;

  /** Optional payload data to send to the requesting client. */
  data?: Readable | Transform;

  /**  Optional HTTP headers to send in the response. */
  headers?: OutgoingHttpHeaders;
};

export default function sendResult(req: ServerRequest, res: ServerResponse, result: HttpResult): void {
  if (result.headers) {
    res.writeHead(result.code, result.headers);
  } else {
    res.statusCode = result.code;
  }

  if (result.data) {
    result.data.pipe(res);
  } else {
    res.end();
  }
}
