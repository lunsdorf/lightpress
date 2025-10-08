import createRequestListener from "./src";

function createApp(options: AppOptions) {
  const logger = createLogger({
    errorWriter: options.errorWriter,
    infoWriter: options.infoWriter,
  });
  const router = createRouter(/* ... */);

  const handleRequest = createRequestListener((request) => {
    const context = {
      logger: logger.bindRequest(request),
    };

    return router(request, context);
  });

  return (request, response) =>
    handleRequest(request, response).catch((error) => {
      request.pause();
      response.close();
    });
}

const server = createServer(
  createApp({
    /* ... */
  }),
);
