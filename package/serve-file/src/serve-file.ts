import { createReadStream, stat, Stats } from "fs";
import { extname, resolve as resolvePath } from "path";
import { HttpError, HttpFunction, HttpResult, HttpRequest } from "@lightpress/lightpress";
import MIME_TYPES from "./MIME_TYPES";

export default function serveFile(basePath: string): HttpFunction {
  return (req: HttpRequest): Promise<HttpResult> => new Promise<HttpResult>((resolve, reject) => {
    const filepath: string = resolvePath(basePath, "." + req.pathname);

    stat(filepath, (error: Error, stats: Stats) => {
      if (error || !stats.isFile()) {
        reject(new HttpError(404));
      } else {
        resolve({
          code: 200,
          data: createReadStream(filepath),
          headers: {
            "Content-Length": stats.size.toString(10),
            "Content-Type": MIME_TYPES[extname(filepath)] || "text/plain; charset=utf-8",
          },
        });
      }
    });
  });
}

