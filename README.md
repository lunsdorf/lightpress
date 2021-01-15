# lightpress

Lightpress is a thin wrapper around node's HTTP handler interface, that enables
you to

- compose a handler tree without overhead
- write reusable and easy-to-test handler functions

Although you can use lightpress for any kind of application, it was designed
with modern API driven web applications in mind. These usually require a single
handler for serving the (SSR) HTML content, another one for static assets, and
one or more handlers for data.

## Installation

You can install lightpress from [npmjs.com](https://www.npmjs.com) using your
favorite package manager, e.g.

```bash
$ npm install --save lightpress
```

## Getting Started

In lightpress a request handler is a plain function that takes a context object
as single argument and returns a result or a promise that resolves to a result.

By default, the context object only contains a reference to the incoming
request, but can be augmented to your application's needs.

The handler's outcome, if any, has to be an object that might contain a
`statusCode`, `headers` and a `body`.

```js
import { createServer } from "http";
import lightpress from "lightpress";

function hello(context) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello from '${context.request.url}'.`,
  };
}

const server = createServer(lightpress(hello));
server.listen(8080);
```

## Composing Handlers

Putting everything into a single handler isn't sufficient. And the way
lightpress solves this circumstance is by composing its handlers.

Lets imagine, the `hello` handler from above must only be called for `GET`
requests. To achieve this we could simply check the request method inside our
`hello` handler. However, a better approach is to create a separate
handler which only cares about request methods.

```js
import lightpress, { HttpError } from "lightpress";

// ...

function allowedMethods(methods, handler) {
  return (context) => {
    if (methods.includes(context.request.method)) {
      return handler(context);
    }

    throw new HttpError(405);
  };
}

// ...

const server = createServer(lightpress(allowedMethods(["GET"], hello)));
```

The `allowedMethods` function is a factory that takes an array of allowed HTTP
methods and a handler. It creates a new handler that will invoke the given one
only if the method of the incoming request is included in the array of allowed
methods. Otherwise, a `Method Not Allowed` error is thrown.

## Error Handling

In lightpress, errors are handled using guards. A guard itself is just another
handler that catches the error that was thrown from the inner handler and
converts it to a result. As with any other handler, guards can be nested, giving
you fine grained control on how the error flows.

```js
// ...

function catchError(handler) {
  return (context) =>
    new Promise((resolve) => resolve(handler(context))).catch((error) => {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      const message =
        statusCode === 405 ? "Better watch your verbs." : "My bad.";
      const body = Buffer.from(message);

      return {
        headers: {
          "Content-Type": "text/plain",
          "Content-Length": body.length,
        },
        statusCode,
        body,
      };
    });
}

// ...

const server = createServer(
  lightpress(catchError(allowedMethods(["GET"], hello)))
);
```

If an error is not handled, lightpress will catch it and send a basic error
response without content.

## Custom Data

The context object that is passed to a handler can be augmented with custom
data. Although it is technically possible to create a new copy of that context
object whenever you pass it on to the next handler, you most likely won't need
that. In fact, some 3rd-party packages might rely on using the same reference
and could break when creating a copy.

The recommended way to augement the context object, is by providing a handler
function that manipulates the context object. And another function that savely
returns the desired data from the context object. Or provides a fallback.

The following function adds a simple `log` function to the context object.

```js
function injectLogger(handler) {
  return (context) => {
    const { method, url } = context.request;

    context.log = (message) => `${new Date()} [${method} ${url}]: ${message}`;

    return handler(context);
  };
}
```

The `log` function can be retrieved from the context using the following
function.

```js
function extractLogger(context) {
  if (context.log) {
    return context.log;
  }

  console.warn("Trying to access logger, but was not injected.");

  return () => void 0;
}
```

If no `log` function was injected into the context object, a warning is
printed and a `noop`-fallback is return instead.

```js
//  ...

function hello(context) {
  const log = extractLogger(context);

  log("Serving request from hello handler.");

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello from '${context.request.url}'.`,
  };
}

// ...

const server = createServer(
  lightpress(injectLogger(catchError(allowedMethods(["GET"], hello))))
);
```

Just like with error handlers, you have the exact same control when to extend
the context object. This lets you for example inject a `user` right before your
API handler is called, but ignore it for all sibling handlers.
