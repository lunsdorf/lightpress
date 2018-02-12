import { Readable, Transform } from "stream";

import { HttpHeaders } from "./HttpHeaders";

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
   * Optional payload data to send to the requesting client.
   */
  data?: Readable | Transform;

  /**
   * Flag to tell the server that the payload data has already been encoded.
   */
  encoded?: boolean;

  /**
   * Optional HTTP headers to send in the response.
   */
  headers?: HttpHeaders;
}
