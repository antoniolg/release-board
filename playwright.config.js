const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5173",
    headless: true,
  },
  webServer: [
    {
      command: "npm run dev:server",
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: "npm run dev:client",
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
