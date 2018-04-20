import { OutgoingHttpHeaders } from "http";
import { createDeflate, createGzip, Deflate, Gzip } from "zlib";
import { Readable } from "stream";
import { HttpFunction, HttpResult, HttpRequest, StaticStream } from "@lightpress/lightpress";

const encodingRe = /(deflate|gzip)/;

function headerWithoutContentLength(headers: OutgoingHttpHeaders = {}): OutgoingHttpHeaders {
  return Object.keys(headers).reduce(
    (accumulator, name) => "content-length" === name.toLowerCase()
      ? accumulator
      : Object.assign(accumulator, { [name]: headers[name] }),
    {} as OutgoingHttpHeaders
  );
}

function getCompressor(format: string): null | Gzip | Deflate {
  switch (format) {
    case "gzip":
      return createGzip();
    case "deflate":
      return createDeflate();
    default:
      return null;
  }
}

function ensureDataStream(data: string | Buffer | Readable): Readable {
  if (data instanceof Readable) {
    return data;
  }

  return new StaticStream(data);
}

/**
 * Executes the given handler only if the incoming request has no payload or its
 * method is explicitly allowed.
 * @param allowed One or many HTTP methods that allow a request payload.
 * @param handler The handler function that will be wrapped.
 */
export default function withCompression(handler: HttpFunction): HttpFunction {
  return async (req: HttpRequest): Promise<HttpResult> => {
    const result = await handler(req);

    // Return immediately when there is no data to compress.
    if (!result.data) {
      return result;
    }

    const acceptEncoding = req.raw.headers["accept-encoding"];
    const match = "string" === typeof acceptEncoding
      ? acceptEncoding.match(encodingRe)
      : null;

    // Return immediately when no supported encoding was found.
    if (!match) {
      return result;
    }

    const format = match[1];
    const compressor = getCompressor(format);

    // Return immediately when no supported compressor was found.
    if (!compressor) {
      return result;
    }

    result.data = ensureDataStream(result.data).pipe(compressor);
    result.headers = Object.assign(headerWithoutContentLength(result.headers), {
      ["Content-Encoding"]: format,
    });

    return result;
  };
}
