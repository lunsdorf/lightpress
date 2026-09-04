import type { GenericHttpHandler } from "../create-request-listener.ts";

export function withErrorBoundary<TArgs extends unknown[]>(
	handler: GenericHttpHandler<TArgs>,
	handleError: GenericHttpHandler<[error: unknown, ...TArgs]>,
): GenericHttpHandler<TArgs> {
	return async (...args) => {
		try {
			return await handler(...args);
		} catch (error) {
			return handleError(error, ...args);
		}
	};
}
