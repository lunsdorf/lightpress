# @lightpress/with-compression

A composable [lightpress](https://github.com/lunsdorf/lightpress) handler that compresses the result returned from the inner handler.

```js
import { createServer } from "http";
import lightpress from "@lightpress/lightpress";
import withCompression from "@lightpress/with-compression";
import myAwesomeHandler from "./my-awesome-handler";

const server = createServer(lightpress(
    withCompression(myAwesomeHandler)
));
```
