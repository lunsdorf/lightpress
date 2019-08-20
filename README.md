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

In lightpress a request handler is a plain function that takes a request info
object as single argument and returns a result or a promise that resolves
to a result.

By default, the request info object contains the incoming request and a
timestamp, but can be augmented to fit the needs of your application.

The handler's outcome, if any, has to be an object that might contain a
`statusCode`, `headers` and a `body`.

```js
import { createServer } from "http";
import { lightpress } from "lightpress";

function hello(info) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: `Hello from '${info.request.url}' at ${new Date(info.timestamp).toLocaleTimeString()}.`
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
  return info => {
    if (methods.include(info.request.method)) {
      return handler(info)
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

The request info object can be used to pass custom data down the handler chain.
While it is technically possible to create a new info object whenever you pass
it on to another handler, keep in mind, that the `sendResult` and `sendError`
functions will always receive a reference the originally created object.
Therefor, changes to info object that have been made after breaking reference
will not be available inside these two functions.

## Error Handling

Since you can override the default `sendError` function, a natural idea that
comes in mind is to handle all application specific errors there. While being a
completely valid option, espacially if you're only dealing with a single error
format (e.g. an API always returns a JSON representation), this might become
messi when things get more complex.

Instead, the recommended way is to create specialized guard-handlers which will
wrap the original handler and convert the occuring errors to a regular result.
This way you can wrap your application inside a guard that will respond with an
HTML result and your API handle with another guard that will respond with a JSON
result, leaving the `sendError` function to deal with unexpected behaviour.
