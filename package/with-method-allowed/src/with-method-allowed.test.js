const test = require("tape");
const { default: withMethodAllowed } = require("./with-method-allowed");

test("withMethodAllowed()", t => {
  throw new Error("should be tested");
});
