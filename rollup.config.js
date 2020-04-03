const importResolver = require("rollup-plugin-import-resolver");
const sucrase = require("@rollup/plugin-sucrase");
const pkg = require("./package.json");

module.exports = {
  input: "src/index.ts",
  output: [
    { file: pkg.module, format: "esm" },
    { file: pkg.main, format: "cjs", exports: "named" },
  ],
  external: require("module").builtinModules,
  plugins: [
    importResolver({ extensions: [".ts", "js"] }),
    sucrase({ transforms: ["typescript"] }),
  ],
};
