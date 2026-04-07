import { execSync } from "node:child_process";

/**
 * Runs before all E2E tests.
 * Ensures the database is migrated and seeded with test data.
 */
export default async function globalSetup() {
  const cwd = new URL("../../../..", import.meta.url).pathname;
  execSync("pnpm db:migrate && pnpm db:seed", {
    cwd,
    stdio: "inherit",
    env: { ...process.env },
  });
}
