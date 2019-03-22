const importResolver = require("rollup-plugin-import-resolver");
const babel = require("rollup-plugin-babel");

const FILE_EXTENSIONS = [".ts", ".d.ts", "js"];

module.exports = {
  input: "src/index.ts",
  output: [
    { file: "lib/index.mjs", format: "esm" },
    { file: "lib/index.js", format: "cjs" },
  ],
  plugins: [
    importResolver({ extensions: FILE_EXTENSIONS }),
    babel({ extensions: FILE_EXTENSIONS }),
  ]
};
