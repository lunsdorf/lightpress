import { Duplex, Readable } from "node:stream";

/** Typeguard to ensure a readable stream. */
export function isReadableStream(
	subject: unknown,
): subject is NodeJS.ReadableStream {
	return subject instanceof Readable || subject instanceof Duplex;
}
