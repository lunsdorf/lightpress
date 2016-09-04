import {IncomingMessage} from "http";
import {Url} from "url";

/**
 * An interface that extends and wraps the native incoming HTTP request.
 */
export interface IHttpRequest {
  /**
   * The HTTP method ofthe incoming request.
   */
  method: string;

  /**
   * The mime type of the incoming request. Should be undefined if the
   * requested URL points to a directory.
   */
  mime?: string;

  /**
   * The wrapped native incoming HTTP request.
   */
  raw: IncomingMessage;

  /**
   * The timestamp when the request reached the HTTP server.
   */
  timestamp: number;

  /**
   * A token that identifies the requesting client. This is Usually extracted
   * from the request headers.
   */
  token?: string;

  /**
   * The already parsed URL of the incoming HTTP request.
   */
  url: Url;
}
