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

Lightpress supports flexible error handling at multiple levels. You can create special HTTP handlers that act as error guards. These guards allow you to control how specific parts of your handler tree respond to errors. For example, a guard around your rendering code could send errors as HTML, while a guard around your API could return JSON responses.

```js
import { HttpError } from "lightpress";

async function errorGuard(handler: HttpHandler) {
  try {
    return await handler(request);
  } catch (error) {
    // Handle the error and return a result or re-throw the error
    // to be handled by an upper guard.
  }
}
```

Additionally, any `HttpError` that reaches Lightpress’s root handler is considered a handled error and will be sent as an HTTP response. The `HttpError` constructor can receive either a status code or a full `HttpResult` object.

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

Any other error is considered unexpected, and Lightpress will therefore respond with a generic `500` error. However, you can pass a `recover` function to `createRequestListener` as a second argument for global error handling.

```js
function recover(request, error) {
  // Use this to run some cleanup code or do some logging.

  return {
    statusCode: 500,
    headers: { "Content-Type": "text/plain" },
    body: "Internal Server Error",
  };
}

createServer(
  createRequestListener(greet, recover)
).listen(8080);
```

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

_TODO: add example_
