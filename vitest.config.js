const { defineConfig } = require("vitest/config");
module.exports = defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["server/**/*.test.js"],
  },
});
