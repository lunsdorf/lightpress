import { IHttpResult } from "./IHttpResult";
import { IHttpRequest } from "./IHttpRequest";

/**
 * Interface for handling incoming HTTP request.
 */
export interface IHttpHandler {
  /**
   * Takes an incoming HTTP request and returns a promise that will resolve
   * to an HTTP result.
   * @param request The request that should be handled.
   * @return The outcome of the handled request.
   */
  serveHttpAsync(request: IHttpRequest): Promise<IHttpResult>;
}
