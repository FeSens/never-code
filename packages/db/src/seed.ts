import { createDb, users } from "./index.js";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const db = createDb(DATABASE_URL);

async function seed() {
  console.info("Seeding database...");

  await db.insert(users).values([
    { email: "alice@example.com", name: "Alice" },
    { email: "bob@example.com", name: "Bob" },
  ]);

  console.info("Seeding complete.");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
