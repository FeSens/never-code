import { type Database, createDb } from "@never-code/db";

let db: Database | undefined;

function getDb(): Database {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is required");
    db = createDb(url);
  }
  return db;
}

export type Context = {
  db: Database;
};

export function createContext(): Context {
  return { db: getDb() };
}
