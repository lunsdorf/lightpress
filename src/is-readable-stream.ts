export function isReadableStream(data: any): data is NodeJS.ReadableStream {
  return Boolean(
    data &&
      data.readable === true &&
      typeof data.pipe === "function" &&
      typeof data._read === "function"
  );
}
