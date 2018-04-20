const test = require("tape");
const { default: serveJsonError } = require("./serve-json-error");

test("serveJsonError()", t => {
  throw new Error("should be tested");
});
