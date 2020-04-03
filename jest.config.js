module.exports = {
  moduleFileExtensions: ["ts", "js"],
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  testMatch: ["**/*.test.js"],
  transform: {
    "^.+\\.(js|ts)$": "@sucrase/jest-plugin",
  },
};
