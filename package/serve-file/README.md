# @lightpress/serve-file

A [lightpress](https://github.com/lunsdorf/lightpress) handler for static files.

```js
import { createServer } from "http";
import { resolve } from "path";
import lightpress from "@lightpress/lightpress";
import serveFile from "@lightpress/serve-file";

const staticFilesDir = resolve(__dirname, "../static_files");
const staticFilesHandler = serveFile(staticFilesDir);

const server = createServer(lightpress(fileHandler));
```
