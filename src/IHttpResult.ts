import * as stream from "stream";

import {HttpHeaders} from "./HttpHeaders";

/**
 * Interface that represents the outcome of a requested URL. The HTTP result
 * will be send back to the requesting client.
 */
export interface IHttpResult {
  /**
   * The HTTP status code to send to the requesting client.
   */
  code: number;

  /**
   * Additional HTTP headers to include in the response.
   */
  headers?: HttpHeaders;

  /**
   * Additional payload data to send to the requesting client.
   */
  data?: stream.Readable;
}
