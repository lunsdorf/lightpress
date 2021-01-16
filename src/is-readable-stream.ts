/** Typeguard to test if the given object is a readable stream. */
export function isReadableStream(data: any): data is NodeJS.ReadableStream {
  return Boolean(
    data &&
      data.readable === true &&
      typeof data.pipe === "function" &&
      typeof data._read === "function"
  );
}
