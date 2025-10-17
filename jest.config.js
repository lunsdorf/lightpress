export default {
	moduleFileExtensions: ["ts", "js"],
	roots: ["<rootDir>/src"],
	testEnvironment: "node",
	testMatch: ["**/*.test.js"],
	transform: {
		"^.+\\.(js|ts)$": "@swc/jest",
	},
};
