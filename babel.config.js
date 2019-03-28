module.exports = {
  comments: false,
  presets: [
    ["@babel/preset-env", { "targets": { "node": "10" } }],
    ["@babel/typescript"],
  ],
  plugins: [
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
  ],
};
