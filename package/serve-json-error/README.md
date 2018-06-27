# @lightpress/serve-json-error

A composable [lightpress](https://github.com/lunsdorf/lightpress) handler for catching errors and rendering a JSON object.

```js
import { createServer } from "http";
import { resolve } from "path";
import lightpress from "@lightpress/lightpress";
import serveJsonError from "@lightpress/serve-json-error";
import myAwesomeHandler from "./my-awesome-handler";

const myHandler = serveJsonError(myAwesomeHandler);

const server = createServer(lightpress(myHandler));
```
