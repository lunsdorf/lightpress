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
    body: `Hello from '${context.request.url}'.`
  };
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
// ...

function allowedMethods(methods, handler) {
  return context => {
    if (methods.includes(context.request.method)) {
      return handler(context);
    }

    throw new HttpError(405);
  }
}

// ...

const server = createServer(lightpress(allowedMethods(["GET"], hello)));
```

The `allowedMethods` function is a factory that takes an array of allowed HTTP
methods and a handler. It creates a new handler that will invoke the one passed
as argument, only if the method of the incoming request is included in the array
of allowed methods. Otherwise, a `Method Not Allowed` error is thrown.

## Error Handling

In lightpress, errors are handled using guards. A guard itself is just another
handler that catches the error that was thrown from the inner handler and
converts it to a result. As with any other handler, guards can be nested, giving
you fine grained control on how the error flows.

```js
import { HttpError } from "lightpress";

// ...

function catchError(handler) {
  return context => new Promise(resolve => resolve(handler(context))).catch(error => {
    const message = error instanceof HttpError && error.statusCode === 405
      ? "Better watch your verbs."
      : "My bad.";
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

// ...

const server = createServer(
  lightpress(
    catchError(
      allowedMethods(["GET"], hello)
    )
  )
);
```

If an error is not handled, `lightpress` will catch it and send a basic error
response without content.

## Custom Data

The context object, that is passed to each handler can be augmented with custom
data.  Although it is technically possible to create a new copy of the context
object whenever you pass it on to another handler, it is most likely not needed.
Keep also in mind, that some 3rd-party packages might rely on using the same
reference and could break.

The recommended way to augement the context object, is by providing a handler
function that manipulates the context object. And another function that savely
returns the desired data from the context object or provides a fallback.

The following function adds a simple `log` function to the context object.

```js
function injectLogger(handler) {
  return context => {
    const { method } = context.request;
    const { pathname }  = context.url;

    context.log = message => `${new Date()} [${method} ${pathname}]: ${message}`;

    return handler(context);
  }
}
```

The `log` function can be retrieved from the context using the following
function. If the `log` function doesn't exists a warning is printed and a
fallback implementation is provided.

```js
function extractLogger(context) {
  if (context.log) {
    return context.log;
  }

  console.warn("Trying to access logger, but was not injected.");

  return () => void 0;
}
```

## Environment Variables

Lightpress reacts to certain environment variables that can be used to control
the internal behaviour.

| Variable Name      | Variable Value | Description
|:-------------------|:---------------|:----------------------------------------
| `LIGHTPRESS_ERROR` | `verbose`      | Writes unhandled errors to `console.error`.
