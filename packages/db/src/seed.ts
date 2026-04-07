import { hashPassword } from "@never-code/shared";
import { createDb, users } from "./index.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const db = createDb(DATABASE_URL);

const SEED_USERS = [
  { email: "alice@example.com", name: "Alice" },
  { email: "bob@example.com", name: "Bob" },
  { email: "charlie@example.com", name: "Charlie" },
  { email: "diana@example.com", name: "Diana" },
];

async function seed() {
  console.info("Seeding database...");
  const passwordHash = await hashPassword("password123");

  for (const user of SEED_USERS) {
    await db
      .insert(users)
      .values({ ...user, passwordHash })
      .onConflictDoNothing();
    console.info(`  → ${user.email}`);
  }

  console.info("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
