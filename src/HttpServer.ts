import * as http from "http";
import * as https from "https";
import * as path from "path";
import * as zlib from "zlib";
import { Readable, Transform } from "stream";
import { parse, Url } from "url";

import { IHttpHandler } from "./IHttpHandler";
import { IHttpResult } from "./IHttpResult";
import { IHttpRequest } from "./IHttpRequest";
import HttpError from "./HttpError";
import MIME_TYPES from "./MIME_TYPES";

export default class HttpServer implements IHttpHandler {
  /**
   * The number of maximum concurrent requests. Any more requests will be
   * responded with a `503 Service Unavailable` error.
   */
  public maxRequests: number = 10000;

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
    "TRACE": true
  };

  /**
   * Defines the HTTP methods which allow to sending a request with payload.
   */
  public payloadMethods: { [method: string]: boolean } = {
    "PATCH": true,
    "POST": true,
    "PUT": true
  };

  /**
   * The number of concurrent requests.
   */
  private requests: number = 0;

  /**
   * Internal storage for registered HTTP handlers.
   */
  private httpHandlers: [string, number, IHttpHandler][] = [];

  /**
   * The number of concurrent requests.
   */
  private encodingRe: RegExp = /(deflate|gzip)/;

  /**
   * The `HttpServer` can be bound to node's HTTP/HTTPS server's `request`
   * event for handling incoming requests.
   */
  constructor() {
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
   * @param handler The HTTP handler to invoke when matching the method and
   * path.
   */
  public handleHttp(path: string, handler: IHttpHandler): void {
    this.httpHandlers.push([path, path.length, handler]);
  }

  /**
   * Searches for a matching HTTP handler and delegates the request handling
   * to it. If no handler was found, the returning promise will be rejected
   * with a `404 Not Found` error.
   * @param request The incoming HTTP request.
   * @return A promise that will be resolved by the delegated HTTP handler.
   */
  public serveHttpAsync(request: IHttpRequest): Promise<IHttpResult> {
    const pathname = request.url.pathname;
    let matchedLength = 0;
    let matchedHandler: IHttpHandler;

    for (let i = 0, l = this.httpHandlers.length; i < l; i++) {
      const [path, pathLength, handler] = this.httpHandlers[i];

      if (matchedLength < pathLength && 0 === pathname.indexOf(path)) {
        matchedLength = pathLength;
        matchedHandler = handler;
      }
    }

    if (matchedHandler) {
      return matchedHandler.serveHttpAsync(request);
    } else {
      return Promise.reject<IHttpResult>(new HttpError(404));
    }
  }

  /**
   * Sends a response to the requesting client.
   * @param request Node's HTTP request.
   * @param request Node's HTTP reponse.
   * @param result The data to send to the client.
   */
  private sendResult(request: http.IncomingMessage, response: http.ServerResponse, result: IHttpResult): void {
    if (result.data && !(result.headers && result.headers["Content-Encoding"]) && request.headers["accept-encoding"]) {
      const match = request.headers["accept-encoding"].match(this.encodingRe);

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
   * @param request Node's HTTP request.
   * @param request Node's HTTP reponse.
   * @param error The error to send to the client.
   */
  private sendError(request: http.IncomingMessage, response: http.ServerResponse, error: Error): void {
    const httpError: HttpError = HttpError.fromError(error);
    const rs: Readable = new Readable();

    // NOOP readable stream implementation
    rs._read = () => void 0;

    this.sendResult(request, response, {
      code: httpError.code,
      data: rs,
      headers: {
        "Content-Type": MIME_TYPES[".json"]
      }
    });

    rs.push(JSON.stringify(httpError));
    rs.push(null);
  }

  private encodeResult(format: string, result: IHttpResult): IHttpResult {
    let compressor: zlib.Gzip | zlib.Deflate;

    switch (format) {
      case "gzip":
        compressor = zlib.createGzip();
        break;
      case "defalte":
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
   * @param request Node's HTTP request.
   * @param request Node's HTTP reponse.
   */
  private handleRequest(request: http.IncomingMessage, response: http.ServerResponse): void {
    const timestamp: number = Date.now();
    const method: string = request.method;

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

    const url: Url = parse(request.url, true);
    const ext: string = path.extname(url.pathname);
    const r: IHttpRequest = {
      method: method,
      mime: ext ? MIME_TYPES[ext] || MIME_TYPES[".bin"] : null, // unknown defaults to application/octet-stream
      raw: request,
      timestamp: timestamp,
      token: request.headers[this.tokenHeader.toLowerCase()] || null,
      url: url
    };

    return void this.serveHttpAsync(r)
      .then<void>((rslt: IHttpResult) => this.sendResult(request, response, rslt))
      .catch<void>((err: Error) => this.sendError(request, response, err));
  }

  /**
   * Handler for events that indicate that a request is done processing.
   */
  private handleRequestDone() {
    // decrease number of requests currently handled by this server
    this.requests = (this.requests - 1);
  }
}
