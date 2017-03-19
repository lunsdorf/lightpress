import * as fs from "fs";
import * as path from "path";
import { IHttpHandler } from "./IHttpHandler";
import { IHttpResult } from "./IHttpResult";
import { IHttpRequest } from "./IHttpRequest";
import HttpError from "./HttpError";
import MIME_TYPES from "./MIME_TYPES";

export default class FileHandler implements IHttpHandler {
  /**
   * The path in the filesystem where the static files that will be served are
   * stored.
   */
  public basePath: string;

  /**
   * An HTTP handler for serving static files.
   * @param basePath The filesystem path from where to serve the static files.
   */
  constructor(basePath: string) {
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
    return new Promise<IHttpResult>((resolve, reject) => {
      const filepath: string = path.resolve(this.basePath, "." + request.pathname);

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
              "Content-Type": MIME_TYPES[extname] || MIME_TYPES[".bin"]
            }
          });
        }
      });
    });
  }
}
