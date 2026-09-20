export default {
  projects: [
    {
      displayName: "http-layer",
      testEnvironment: "node",
      transform: {},
      testMatch: ["<rootDir>/__tests__/http-layer.test.js"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/setupEnv.js"],
    },
    {
      displayName: "db-integration",
      testEnvironment: "node",
      transform: {},
      testMatch: ["<rootDir>/__tests__/*.test.js"],
      testPathIgnorePatterns: ["<rootDir>/__tests__/http-layer.test.js"],
      setupFilesAfterEnv: ["<rootDir>/__tests__/setupDb.js"],
    },
  ],
};
