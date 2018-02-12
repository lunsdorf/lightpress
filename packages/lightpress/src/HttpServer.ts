import * as http from "http";
import * as https from "https";
import { extname } from "path";
import * as zlib from "zlib";
import { Transform } from "stream";
import { parse, Url } from "url";

import { IHttpHandler } from "./IHttpHandler";
import { IHttpResult } from "./IHttpResult";
import { IHttpRequest } from "./IHttpRequest";
import HttpError from "./HttpError";
import StaticStream from "./StaticStream";
import MIME_TYPES from "./MIME_TYPES";

export default class HttpServer implements IHttpHandler {
  /**
   * The number of maximum concurrent requests. Any more requests will be
   * responded with a `503 Service Unavailable` error.
   */
  public maxRequests: number = 1000;

  /**
   * Name of the HTTP header that stores the user's identity token.
   */
  public tokenHeader: string = "Token";

  /**
   * Defines the accepted HTTP methods.
   */
  public allowedMethods: { [method: string]: boolean } = {
    "DELETE": true,
    "GET": true,
    "HEAD": true,
    "OPTIONS": true,
    "PATCH": true,
    "POST": true,
    "PUT": true,
    "TRACE": true,
  };

  /**
   * Defines the HTTP methods which allow to sending a request with payload.
   */
  public payloadMethods: { [method: string]: boolean } = {
    "PATCH": true,
    "POST": true,
    "PUT": true,
  };

  /**
   * The number of concurrent requests.
   */
  protected requests: number = 0;

  /**
   * Internal storage for registered HTTP handlers.
   */
  protected httpHandlers: [string, number, boolean, IHttpHandler][] = [];

  /**
   * The number of concurrent requests.
   */
  protected encodingRe: RegExp = /(deflate|gzip)/;

  /**
   * The `HttpServer` can be bound to node's HTTP/HTTPS server's `request`
   * event for handling incoming requests.
   */
  public constructor() {
    this.handleRequest = this.handleRequest.bind(this);
    this.handleRequestDone = this.handleRequestDone.bind(this);
  }

  /**
   * Binds this server instance to requests emitted by the given HTTP/HTTPS
   * server.
   * @param server A node HTTP/HTTPS server to start handling requests for.
   */
  public bindHttpListener(server: http.Server | https.Server): void {
    return void server.addListener("request", this.handleRequest);
  }

  /**
   * Unbinds this server instance from requests emitted by the given HTTP/HTTPS
   * server.
   * @param server A node HTTP/HTTPS server to stop handling requests for.
   */
  public unbindHttpListener(server: http.Server | https.Server): void {
    return void server.removeListener("request", this.handleRequest);
  }

  /**
   * Registers an `IHttpHandler` for the given path. The path is resolved by
   * comparing the beginning of the requested URL. If multiple paths match, the
   * longer one is used.
   * @param path The URL's base path to register the handler for.
   * @param strip Will strip the given path from the request's pathname before
   * the given handler is invoked.
   * @param handler The HTTP handler to invoke when matching the method and
   * path.
   */
  public handleHttp(path: string, strip: boolean, handler: IHttpHandler): void {
    this.httpHandlers.push([path, path.length, true === strip, handler]);
  }

  /**
   * Searches for a matching HTTP handler and delegates the request handling
   * to it. If no handler was found, the returning promise will be rejected
   * with a `404 Not Found` error.
   * @param request The incoming HTTP request.
   * @return A promise that will be resolved by the delegated HTTP handler.
   */
  public serveHttpAsync(request: IHttpRequest): Promise<IHttpResult> {
    const pathname: string = request.pathname;
    let matchedLength: number = 0;
    let matchedStrip: boolean = false;
    let matchedHandler: IHttpHandler | undefined;

    for (let i = 0, l = this.httpHandlers.length; i < l; i++) {
      const [path, pathLength, strip, handler] = this.httpHandlers[i];

      if (matchedLength < pathLength && 0 === pathname.indexOf(path)) {
        matchedLength = pathLength;
        matchedStrip = strip;
        matchedHandler = handler;
      }
    }

    if ("undefined" !== typeof matchedHandler) {
      if (matchedStrip && 1 < matchedLength) {
        request.pathname = pathname.substr(matchedLength);

        // ensure the request's pathname always starts with a slash
        if ("/" !== request.pathname.charAt(0)) {
          request.pathname = "/" + request.pathname;
        }
      }

      return matchedHandler.serveHttpAsync(request);
    } else {
      return Promise.reject<IHttpResult>(new HttpError(404));
    }
  }

  /**
   * Sends a response to the requesting client.
   * @param request Node's HTTP incoming request object.
   * @param response Node's HTTP server response object.
   * @param result The data to send to the client.
   */
  protected sendResult(request: http.IncomingMessage, response: http.ServerResponse, result: IHttpResult): void {
    if (result.data && !result.encoded) {
      const acceptEncoding = request.headers["accept-encoding"];
      const match = "string" === typeof acceptEncoding
        ? acceptEncoding.match(this.encodingRe)
        : null;

      if (match) {
        result = this.encodeResult(match[1], result);
      }
    }

    if (result.headers) {
      response.writeHead(result.code, result.headers);
    } else {
      response.statusCode = result.code;
    }

    if (result.data) {
      result.data.pipe(response);
    } else {
      response.end();
    }
  }

  /**
   * Sends an error response to the requesting client.
   * @param request Node's HTTP incoming request object.
   * @param response Node's HTTP server response object.
   * @param error The error to send to the client.
   */
  protected sendError(request: http.IncomingMessage, response: http.ServerResponse, error: Error): void {
    const httpError: HttpError = HttpError.fromError(error);

    this.sendResult(request, response, {
      code: httpError.code,
      data: new StaticStream(JSON.stringify(httpError)),
      headers: {
        "Content-Type": MIME_TYPES[".json"],
      },
    });
  }

  /**
   * Encodes the result's data stream.
   * @param format Name of the encoding format. Supports `gzip` and `deflate`.
   * @param result The result to encode.
   * @returns {IHttpResult}
   */
  protected encodeResult(format: string, result: IHttpResult): IHttpResult {
    if (!result.data) {
      return result;
    }

    let compressor: zlib.Gzip | zlib.Deflate;

    switch (format) {
      case "gzip":
        compressor = zlib.createGzip();
        break;
      case "deflate":
        compressor = zlib.createDeflate();
        break;
      default:
        return result;
    }

    if (result.headers) {
      delete result.headers["Content-Length"];
      delete result.headers["content-length"];
    } else {
      result.headers = {};
    }

    result.headers["Content-Encoding"] = format;
    result.data = result.data.pipe<Transform>(compressor);

    return result;
  }

  /**
   * Event handler for request events emitted by the HTTP/HTTPS server.
   * @param request Node's HTTP incoming request object.
   * @param response Node's HTTP server response object.
   */
  protected handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void {
    const timestamp: number = Date.now();
    const method: string = request.method || "GET";

    this.requests = (this.requests + 1);

    request.addListener("aborted", this.handleRequestDone);
    response.addListener("finish", this.handleRequestDone);

    if (!this.allowedMethods[method]) {
      return void this.sendError(request, response, new HttpError(405));
    }
    if (!this.payloadMethods[method] && request.headers["content-length"]) {
      return void this.sendError(request, response, new HttpError(400));
    }
    if (this.requests > this.maxRequests) {
      return void this.sendError(request, response, new HttpError(503));
    }

    const url: Url = parse(request.url || "/", true);
    const pathname: string = url.pathname || "/";
    const ext: string = extname(pathname);
    const token: void | string | string[] = request.headers[this.tokenHeader.toLowerCase()];
    const r: IHttpRequest = {
      method: method,
      mime: ext ? MIME_TYPES[ext] || MIME_TYPES[".bin"] : null, // unknown defaults to application/octet-stream
      pathname: pathname,
      raw: request,
      timestamp: timestamp,
      token: "string" === typeof token ? token : null,
      url: url,
    };

    return void this.serveHttpAsync(r)
      .then<void>((result: IHttpResult) => this.sendResult(request, response, result))
      .catch<void>((error: Error) => this.sendError(request, response, error));
  }

  /**
   * Handler for events that indicate that a request is done processing.
   */
  protected handleRequestDone() {
    // decrease number of requests currently handled by this server
    this.requests = (this.requests - 1);
  }
}
