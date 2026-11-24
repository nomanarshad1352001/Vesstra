import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  fullyParallel: false,
  workers: 2,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.DEMO_BASE_URL || "http://127.0.0.1:3000",
    viewport: { width: 1440, height: 1000 },
    headless: true,
    screenshot: "only-on-failure",
  },
  outputDir: "test-results",
});
