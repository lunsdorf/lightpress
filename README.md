# lightpress

> A thin wrapper for composing HTTP handlers.


## Installation

Use your favourite node package manager to install lightpress.

```bash
# using npm
$ npm install --save @lightpress/lightpress

# using yarn
$ yarn add @lightpress/lightpress
```


## Usage

### Example

A basic lightpress handler that returns a JSON response. 

```js
import { createServer } from "http";
import lightpress  from "lightpress";

const hello = req => Promise.resolve({
  code: 200,
  data: JSON.stringify({ hello: "world" }),
  headers: {
    "Content-Type": "application/json",
  },
});

const server = createServer(lightpress(hello));
server.listen(8080, () => console.log(`Listening to port :${server.address().port} …`));
```


## Development

All lightpress packages are organized in a single mono-repository which is managed using `oao`. Since `oao` is based on `yarn`, you need to have `yarn` installed.

### Global Scripts

The following scripts have been defined:

| Script        | Description
| :------------ | :-------------------------------------------------------------
| `yarn clean`  | Delete all `node_modules` directories from sub-packages and the root package (alias for `yarn oao clean`).
| `yarn build`  | Runs `build` for all sub-packages (alias for `yarn oao run-script build`).
| `yarn test`   | Runs `test` for all sub-packages (alias for `yarn oao run-script test`).
