import { OutgoingHttpHeaders } from "http";
import { Readable } from "stream";

export type LightpressResult = void | null | {
  /** Optional response status code (defaults to `200`). */
  statusCode?: null | number;

  /** Optional response payload. */
  body?: null | string | Buffer | Readable;

  /** Optional HTTP response headers. */
  headers?: null | OutgoingHttpHeaders;
};
