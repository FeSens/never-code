import { sql } from "drizzle-orm";
import { createDb } from "./index.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const db = createDb(DATABASE_URL);

async function reset() {
  console.info("Resetting database...");
  await db.execute(sql`TRUNCATE TABLE sessions, users CASCADE`);
  console.info("Tables truncated. Run 'pnpm db:seed' to re-seed.");
  process.exit(0);
}

reset().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
