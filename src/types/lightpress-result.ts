import { OutgoingHttpHeaders } from "http";
import { Readable } from "stream";

export type LightpressResult = void | null | {
  /** Optional HTTP response status code. Defaults to `200`. */
  code?: number;

  /** Optional response payload. */
  data?: null | string | Buffer | Readable;

  /** Optional HTTP response headers. */
  headers?: OutgoingHttpHeaders;
};
