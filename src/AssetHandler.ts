import * as fs from "fs";
import * as path from "path";
import {IHttpHandler} from "./IHttpHandler";
import {IHttpResult} from "./IHttpResult";
import {IHttpRequest} from "./IHttpRequest";
import HttpError from "./HttpError";
import MIME_TYPES from "./MIME_TYPES";

export default class AssetHandler implements IHttpHandler {
  /**
   * The path in the filesystem where the static files that will be served are
   * stored.
   */
  public basePath: string;

  /**
   * The prefix part of the URL, that is cut off from the URL's pathname when
   * building the concrete file path.
   */
  public baseUrl: string = "/assets/";

  /**
   * An HTTP handler for serving static files.
   * @param basePath The filesystem path from where to serve the static files.
   */
  constructor (basePath: string) {
    this.basePath = basePath;
  }

  /**
   * Searches the requested file inside the defined base path and returns it as
   * an HTTP result. If no file was found, the returning promise will be
   * rejected with a `404 Not Found` error.
   * @param request The incoming HTTP request.
   * @return A promise that will be resolved with the requested file.
   */
  public serveHttpAsync(request: IHttpRequest): Promise<IHttpResult> {
    let filepath: string;

    try {
      filepath = this.filepath(request.url.pathname);
    } catch (e) {
      return Promise.reject<IHttpResult>(new HttpError(404));
    }

    return new Promise<IHttpResult>((resolve, reject) => {
      fs.stat(filepath, (error: Error, stats: fs.Stats) => {
        if (error || !stats.isFile()) {
          reject(new HttpError(404));
        } else {
          const extname = path.extname(filepath);

          resolve({
            code: 200,
            data: fs.createReadStream(filepath),
            headers: {
              "Content-Length": stats.size.toString(10),
              "Content-Type": MIME_TYPES[extname] || MIME_TYPES[".bin"],
            },
          });
        }
      });
    });
  }

  /**
   * Builds the file path from the base path, the base URL and the given
   * pathname.
   * @param pathname The requested pathname.
   * @return The path to the requested file.
   */
  private filepath (pathname: string): string {
    if (0 !== pathname.indexOf(this.baseUrl)) {
      throw new Error("pathname does not match base URL");
    }

    return path.resolve(this.basePath, "./" + pathname.substr(this.baseUrl.length));
  }
}
