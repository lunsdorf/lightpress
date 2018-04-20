const test = require("tape");
const { default: serveHtmlError } = require("./serve-html-error");

test("serveHtmlError()", t => {
  throw new Error("should be tested");
});
