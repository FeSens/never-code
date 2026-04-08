import { defineConfig, devices } from "@playwright/test";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/nevercode";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // Line reporter for Claude Code (concise terminal output).
  // JSON reporter to file for structured failure analysis.
  reporter: process.env.CI
    ? [["github"], ["json", { outputFile: "test-results/results.json" }]]
    : [["line"], ["json", { outputFile: "test-results/results.json" }]],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Starts both the API (real backend on :4000) and the web app (:3000).
  // reuseExistingServer: true means if they're already running, skip starting.
  webServer: [
    {
      command: "pnpm --filter @never-code/api dev",
      url: "http://localhost:4000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      stdout: "pipe",
      env: { DATABASE_URL },
    },
    {
      command: "pnpm --filter @never-code/web dev",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: "pipe",
    },
  ],

  // Global setup: migrate + seed DB before E2E tests
  globalSetup: "./tests/e2e/global-setup.ts",
});
