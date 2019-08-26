# lightpress

Lightpress is a thin wrapper around node's HTTP handler interface, that let's
you compose your application's HTTP handlers without overhead.

Although you can use it for any kind of application, it was designed with
modern API driven web applications in mind. These usually require a single
handler for serving the (SSR) HTML content, another one for static assets, and
one or more handlers for data.

## Installation

You can install `lightpress` from [npmjs.com](https://www.npmjs.com) using your
favorite package manager, e.g.

```bash
$ npm install --save lightpress
```

## Getting Started

In lightpress a request handler is a plain function that takes a request context
object as single argument and returns a result or a promise that resolves
to a result.

By default, the request context object contains a URL object and a reference to
the incoming request.

The handler's outcome, if any, has to be an object that might contain a
`statusCode`, `headers` and a `body`.

```js
import { createServer } from "http";
import { lightpress } from "lightpress";

function hello(context) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello from '${context.url.pathname}'.`
  }
}

const server = createServer(lightpress(hello));
server.listen(8080);
```

## Composing Handlers

Of course, sticking everything into a single handler isn't sufficient. And the
way lightpress solves this circumstance is by composing handlers.

Lets imagine, the `hello` handler from above must only be called for `GET`
requests. To achieve this we could simply check the request method inside our
`hello` handler. However, a better approach is to move this logic into a
separate handler which only cares about request methods.

```js
import { createServer } from "http";
import { lightpress, HttpError } from "lightpress";

function allowedMethods(methods, handler) {
  return context => {
    if (methods.includes(context.request.method)) {
      return handler(context)
    }

    throw new HttpError(405);
  }
}

// define hello handler from above ...

const server = createServer(lightpress(allowedMethods(["GET"], hello)));
server.listen(8080);
```

The `allowedMethods` function is a factory that takes an array of allowed HTTP
methods and a handler. It creates a new handler that will invoke the one passed
as argument, only if the method of the incoming request is included in the array
of allowed methods. Otherwise, a `Method Not Allowed` error is thrown.

## Custom Data

The request context object can be used to pass custom data down the handler
chain. While it is technically possible to create a new context object whenever
you pass it on to another handler, keep in mind, that the `sendResult` and
`sendError` functions will always receive a reference the originally created
object. Therefor, changes to request object that have been made after breaking
reference will not be available inside these two functions and might break some
3rd-party packages that rely on using the same reference.

## Error Handling

In lightpress, errors are handled using guards. A guard itself is just another
handler that catches the error that was thrown from the inner handler and
converts it to a result. As with any other handler, guards can be nested, giving
you fine grained control on how the error flows. You could also convert and
re-throw the error leaving it to the outer handler to handle it.

```js
import { createServer } from "http";
import { lightpress, HttpError } from "lightpress";

function sendError(handler) {
  return context => new Promise(resolve => resolve(handler(context))).catch(error => {
    const httpError = HttpError.fromError(error);
    const message = httpError.code === 405
      ? "Better watch your verbs."
      : "My bad."
    const body = Buffer.from(message);

    return {
      statusCode: httpError.code,
      headers: {
        "Content-Type": "text/plain",
        "Content-Length": body.length,
      },
      body,
    };
  });
}

// define handlers from above ...

const server = createServer(
  lightpress(
    sendError(
      allowedMethods(["GET"], hello)
    )
  )
);

server.listen(8080);
```
