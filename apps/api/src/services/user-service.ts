import { eq } from "drizzle-orm";
import type { Database } from "@never-code/db";
import { users } from "@never-code/db/schema";
import type { CreateUserInput } from "@never-code/shared/validators";

export class UserService {
  constructor(private db: Database) {}

  async list() {
    return this.db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
  }

  async getById(id: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    return user ?? null;
  }

  async create(input: CreateUserInput) {
    const [user] = await this.db.insert(users).values(input).returning();
    return user;
  }
}
