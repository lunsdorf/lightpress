# @lightpress/serve-html-error

A composable [lightpress](https://github.com/lunsdorf/lightpress) handler for catching errors and rendering an HTML error pages.

```js
import { createServer } from "http";
import lightpress from "@lightpress/lightpress";
import serveHtmlError from "@lightpress/serve-html-error";
import myAwesomeHandler from "./my-awesome-handler";

function htmlTemplate(error) {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Something went wrong!</title>
    </head>
    <body>${error.message}</body>
  </html>`;
}

const myHandler = serveHtmlError(htmlTemplate, myAwesomeHandler);

const server = createServer(lightpress(myHandler));
```
