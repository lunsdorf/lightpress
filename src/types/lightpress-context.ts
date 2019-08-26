import { IncomingMessage } from "http";
import { UrlWithParsedQuery } from "url";

export type LightpressContext = {
  /** The incoming server request. */
  request: IncomingMessage;

  /** The request's parsed URL. */
  url: UrlWithParsedQuery
};
