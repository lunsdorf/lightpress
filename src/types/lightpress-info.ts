import { IncomingMessage } from "http";
import { UrlWithParsedQuery } from "url";

export type LightpressInfo = {
  /** The incoming server request. */
  request: IncomingMessage;

  /** Unix timestamp when lightpress handler was invoked. */
  timestamp: number;

  /** The request's parsed URL. */
  url: UrlWithParsedQuery
};
