import { OutgoingHttpHeaders } from "http";

export type LightpressResult = void | null | {
  /** Optional response status code (defaults to `200`). */
  statusCode?: null | number;

  /** Optional response payload. */
  body?: null | string | Buffer | NodeJS.ReadableStream;

  /** Optional HTTP response headers. */
  headers?: null | OutgoingHttpHeaders;
};
