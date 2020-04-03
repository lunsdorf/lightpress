const importResolver = require("rollup-plugin-import-resolver");
const babel = require("rollup-plugin-babel");
const pkg = require("./package.json");

const FILE_EXTENSIONS = [".ts", "js"];

module.exports = {
  input: "src/index.ts",
  output: [
    { file: pkg.module, format: "esm" },
    { file: pkg.main, format: "cjs", exports: "named" },
  ],
  external: require("module").builtinModules,
  plugins: [
    importResolver({ extensions: FILE_EXTENSIONS }),
    babel({ extensions: FILE_EXTENSIONS }),
  ],
};
