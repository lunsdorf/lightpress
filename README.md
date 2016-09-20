lightpress
===============================================================================

> A tiny HTTP server.


Development
-------------------------------------------------------------------------------

### NPM Scripts

The folling NPM scripts have been defined for this package:

| Script             | Description
| :----------------- | :-------------------------------------------------------
| `npm test`         | Runs all unit tests.
| `npm run lint`     | Runs the typescript linter for all source files.
| `npm run qa`       | Runs the typescript linter first and the unit tests afterwards.
| `npm run build`    | Transpiles the typescript source files into javascript files.

### Conventions

Key functions/methods should be named and behave as the following:

- **Asynchronous functions** return a promise and are postfixed with the `Async` keyword, e.g `readAsync()`.
- **Event handlers** are prefixed with `handle` followed by the event's subject and type, e.g. `handleFileRead()` for *read* events dispatched by a *file* resource. Event handlers within classes should be bound to the instance's `this` scope when the constructor is called.
- **Promsie callbacks**, when defined as separately, are prefixed with `when`, followed by the awaited subject and the postfix `Resolved` or `Rejected`, e.g. `whenRequestResolved` or `whenRequestRejected`.
