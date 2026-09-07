# lightpress

Lightpress is a thin wrapper around Node's HTTP request event, providing a composable HTTP handler interface.

## Installation

```bash
npm add lightpress
```

## Basic Usage

Create an HTTP handler function that receives a Node.js `IncomingMessage` and returns a result:

```js
import { createServer } from "http";
import { createRequestListener } from "lightpress";

function greet(request) {
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/plain" },
    body: `Hello from '${request.url}'.`,
  };
}

createServer(
  createRequestListener(greet)
).listen(8080);
```

## Composing Handlers

You can compose handlers for more control. For example, you can restrict allowed HTTP methods.

```js
import { HttpError } from "lightpress";

function allowedMethods(methods, handler) {
  return (request) => {
    if (methods.includes(request.method)) {
      return handler(request);
    }
    throw new HttpError(405);
  };
}

createServer(
  createRequestListener(
    allowedMethods(["GET"], greet)
  )
).listen(8080);
```

## Error Handling

Lightpress supports flexible error handling at multiple levels. You can create special HTTP handlers that act as error boundaries. These boundaries allow you to control how specific parts of your handler tree respond to errors. For example, a boundary around your rendering code could send errors as HTML, while a boundary around your API could return JSON responses.

```js
function errorBoundary(handler) {
  return async (request) => {
    try {
      return await handler(request);
    } catch (error) {
      // Handle the error and return a result, or rethrow the error
      // to be handled by an outer boundary.
    }
  };
}
```

To reduce the amount of boilerplate code, Lightpress provides a `withErrorBoundary` utility function. Its error handler receives every error followed by the original handler arguments. It can return an alternative result or rethrow the error to an outer boundary. Since `withErrorBoundary` is generic over its arguments, it also supports [custom handler types and context](#custom-handler-types-and-context).

```js
import { withErrorBoundary } from "lightpress/utility";

const handler = withErrorBoundary(myHandler, (error, request) => {
  // Handle the error and return a result, or rethrow the error
  // to be handled by an outer boundary.
});
```

Any `HttpError` that reaches Lightpress’s root handler is considered a handled error and will be sent as an HTTP response. The `HttpError` constructor can receive either a status code or a full `HttpResult` object.

```js
// Only status code
throw new HttpError(404);

// With full HTTP result
throw new HttpError({
  statusCode: 404,
  headers: { "Content-Type": "text/plain" },
  body: "Not found",
});
```

Any other error from a handler is considered unexpected, and Lightpress will therefore respond with a generic `500` error.

If sending the response fail for technical reasons, the error is logged and the response destroyed. Lightpress does not try to send another response, since headers or part of the body may have been sent already.

## Handler Factories

In real-world applications, it’s common to provide an HTTP handler by using a configurable factory. A factory can receive options, such as a database connection or other configuration, and returns an HTTP handler. This helps to decouple infrastructure from business logic and allows for simpler code reuse.

```js
function createApiHandler({ db }) {
  return async (request) => {
    const data = await db.getSomeData();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    };
  };
}

createServer(
  createRequestListener(
    createApiHandler({ db })
  )
).listen(8080);
```

## Custom Handler Types and Context

Lightpress’s handler type is intentionally simple: it expects a function that receives a Node.js `IncomingMessage` and returns a result. Depending on your application, your HTTP handler may need additional request-related context, such as a timestamp, a user, or other data that might be expensive to compute. In this case, you will likely want to define your own handler type.

The following TypeScript example illustrates a more real-world example on how to define and use an application-specific context.

```ts
import type { IncomingMessage } from "node:http";
import type { HttpResult } from "lightpress";

type AppContext = {
	request: IncomingMessage;
	user: MyAppUser;
};

// The full context is the default, while inner handlers can require a subset.
type AppHandler<TContext extends Partial<AppContext> = AppContext> = (
	context: TContext,
) => Promise<HttpResult> | HttpResult;

function createAppHandler(options: { db: Database; }) {
	const api = createApiHandler(options.db);

	return async (request: IncomingMessage) => {
		// Constructing the context once per request should fit most applications.
		// Depending on your needs, you could augment it further down the handler
		// chain, allowing for fine-grained context distribution.
		const user = await getUserSomehow(db, request);

		const context: AppContext = {
			request,
			user,
		};

		// The full context satisfies a handler that requires only a subset of it.
		return await api(context);
	};
}

// Inner handlers might not need the entire application context. The generic
// handler type lets each one declare only the data it needs, separating
// concerns and making isolated testing easier.
function createApiHandler(
	db: Database,
): AppHandler<Pick<AppContext, "user">> {
	return async (context) => {
		const data = await db.getSomeUserData(context.user);

		return {
			statusCode: 200,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		};
	};
}

createServer(
	createRequestListener(createAppHandler({ db }))
).listen(8080);
```
