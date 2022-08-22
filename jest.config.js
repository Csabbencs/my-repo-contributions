const config = {
  testEnvironment: "node",
  transform: {
    "\\.[jt]sx?$": "babel-jest",
  },
  testMatch: [
    "**/?(*.)+(test.js)",
  ],
};

export default config;
