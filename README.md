lightpress
===============================================================================

> A tiny HTTP server.


Getting Started
-------------------------------------------------------------------------------

### Installation

```bash
$ npm install lightpress
```

### Example

Typescript example to create and bind a server that serves static fiels from the projects `./public/` directory.

```ts
import {createServer, Server} from "http";
import {join} from "path";
import {HttpServer, FileHandler} from "lightpress";

const server: Server = createServer();
const app: HttpServer = new HttpServer();

// configure app server
app.bindHttpListener(server);
app.handleHttp("/assets/", true, new FileHandler(join(process.cwd(), "public")));

// listen for HTTP requests
server.listen(8080, () => console.log(`Listening to port :${server.address().port} …`));
```


Development
-------------------------------------------------------------------------------

### NPM Scripts

The following NPM scripts have been defined for this package:

| Script             | Description
| :----------------- | :-------------------------------------------------------
| `npm test`         | Runs all unit tests.
| `npm run lint`     | Runs the typescript linter for all source files.
| `npm run fmt`      | Runs the typescript code formatter for all source files.
| `npm run qa`       | Runs the typescript formatter and linter first and the unit tests afterwards.
| `npm run build`    | Transpiles the typescript source files into javascript files.

### Conventions

Key functions/methods should be named and behave as the following:

- **Asynchronous functions** return a promise and are postfixed with the `Async`, e.g `requestAsync()`.
- **Event handlers** are prefixed with `handle` followed by the event's subject and type, e.g. `handleButtonClick()` for *click* events dispatched by a *button* resource. Event handlers within classes should be bound to the instance's `this` scope inside the constructor.
- **Promise callbacks**, when defined separately, are prefixed with `when`, followed by the awaited subject and the postfix `Resolved` or `Rejected`, e.g. `whenRequestResolved()` or `whenRequestRejected()`. Promise callbacks within classes should be bound to the instance's `this` scope inside the constructor.
- **Promise references** are prefixed with `await`, followed by the awaited subject, e.g. `const awaitRequest = requestAsync()`.
