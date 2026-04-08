import type { Database } from "@never-code/db";
import { sessions, users } from "@never-code/db/schema";
import { AppError, hashPassword, verifyPassword } from "@never-code/shared";
import type { LoginInput, RegisterInput } from "@never-code/shared/validators";
import { eq } from "drizzle-orm";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export class AuthService {
  constructor(private db: Database) {}

  async register(input: RegisterInput) {
    const passwordHash = await hashPassword(input.password);

    let user: typeof users.$inferSelect;
    try {
      const [inserted] = await this.db
        .insert(users)
        .values({
          email: input.email,
          name: input.name,
          passwordHash,
        })
        .returning();

      if (!inserted) throw new Error("Failed to insert user");
      user = inserted;
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique constraint")) {
        throw new AppError("Email already in use", "CONFLICT", 409);
      }
      throw error;
    }

    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      })
      .returning();

    if (!session) throw new Error("Failed to insert session");

    return { user, session };
  }

  async login(input: LoginInput) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.email, input.email),
    });

    if (!user) return null;

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) return null;

    const [session] = await this.db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      })
      .returning();

    if (!session) throw new Error("Failed to insert session");

    return { user, session };
  }

  async validateSession(sessionId: string) {
    const session = await this.db.query.sessions.findFirst({
      where: eq(sessions.id, sessionId),
    });

    if (!session || session.expiresAt < new Date()) return null;

    const user = await this.db.query.users.findFirst({
      where: eq(users.id, session.userId),
    });

    return user ?? null;
  }

  async logout(sessionId: string) {
    await this.db.delete(sessions).where(eq(sessions.id, sessionId));
  }
}
