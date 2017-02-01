import { Readable, ReadableOptions } from "stream";

export default class StaticStream extends Readable {

  /**
   * The data that will be streamed.
   */
  protected data: Buffer;

  /**
   * Takes a string or buffer and converts it to a stream.
   * @param data The data that will be fed to the stream.
   * @param options Readable stream options. Ignores `objectMode` and `read`
   * properties.
   */
  public constructor(data: string | Buffer, options: ReadableOptions = {}) {
    super({ highWaterMark: options.highWaterMark || 16384 });

    if ("string" === typeof data) {
      this.data = Buffer.from(data, options.encoding || "utf8");
    } else {
      this.data = data;
    }
  }

  /**
   * Internal callback required by node.js,
   * see {@see https://nodejs.org/api/stream.html#stream_readable_read_size_1}
   * for details.
   * @param size Number of bytes to read asynchronously
   */
  protected _read(size: number): void {
    if (0 === this.data.length) {
      this.push(null);
    } else {
      const chunk: Buffer = this.data.slice(0, size);

      this.push(chunk);
      this.data = this.data.slice(size);
    }
  }
}
