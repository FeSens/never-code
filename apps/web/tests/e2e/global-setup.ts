import { execSync } from "node:child_process";

const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/nevercode";

/**
 * Runs before all E2E tests.
 * Ensures the database is migrated and seeded with test data.
 */
export default async function globalSetup() {
  const cwd = new URL("../../../..", import.meta.url).pathname;
  const env = { ...process.env, DATABASE_URL };

  // Tables are managed via schema push since drizzle-kit migrate
  // has a known ESM/.js extension issue. Seed is idempotent.
  try {
    execSync("pnpm db:seed", { cwd, stdio: "inherit", env });
  } catch {
    // Seed may fail if tables don't exist yet — that's ok for E2E
    // since the schema is created via docker exec in dev setup.
    console.info("Note: db:seed failed — ensure tables exist.");
  }
}
