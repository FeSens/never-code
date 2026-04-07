import { AuthService } from "@/services/auth-service";
import { beforeEach, describe, expect, it, vi } from "vitest";

function createMockDb() {
  return {
    query: {
      users: { findFirst: vi.fn() },
      sessions: { findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn(),
    }),
  };
}

// Mock the password utils
vi.mock("@never-code/shared", () => ({
  hashPassword: vi.fn().mockResolvedValue("hashed:password"),
  verifyPassword: vi.fn(),
}));

import { verifyPassword } from "@never-code/shared";

describe("AuthService", () => {
  let service: AuthService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    vi.clearAllMocks();
    db = createMockDb();
    service = new AuthService(db as any);
  });

  describe("register", () => {
    it("creates a user and returns a session", async () => {
      const mockUser = { id: "user-1", email: "alice@test.com", name: "Alice" };
      const mockSession = { id: "session-1", userId: "user-1" };

      db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([mockUser]) }),
      });
      db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([mockSession]) }),
      });

      const result = await service.register({
        email: "alice@test.com",
        name: "Alice",
        password: "password123",
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(db.insert).toHaveBeenCalledTimes(2);
    });
  });

  describe("login", () => {
    it("returns user and session for valid credentials", async () => {
      const mockUser = {
        id: "user-1",
        email: "alice@test.com",
        passwordHash: "stored:hash",
      };
      const mockSession = { id: "session-1", userId: "user-1" };

      db.query.users.findFirst.mockResolvedValue(mockUser);
      vi.mocked(verifyPassword).mockResolvedValue(true);
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([mockSession]) }),
      });

      const result = await service.login({
        email: "alice@test.com",
        password: "password123",
      });

      expect(result).toEqual({ user: mockUser, session: mockSession });
    });

    it("returns null for unknown email", async () => {
      db.query.users.findFirst.mockResolvedValue(undefined);

      const result = await service.login({
        email: "nobody@test.com",
        password: "password123",
      });

      expect(result).toBeNull();
    });

    it("returns null for wrong password", async () => {
      db.query.users.findFirst.mockResolvedValue({
        id: "user-1",
        passwordHash: "stored:hash",
      });
      vi.mocked(verifyPassword).mockResolvedValue(false);

      const result = await service.login({
        email: "alice@test.com",
        password: "wrong",
      });

      expect(result).toBeNull();
    });
  });

  describe("validateSession", () => {
    it("returns user for valid non-expired session", async () => {
      const futureDate = new Date(Date.now() + 86400000);
      const mockSession = { id: "s-1", userId: "u-1", expiresAt: futureDate };
      const mockUser = { id: "u-1", email: "alice@test.com" };

      db.query.sessions.findFirst.mockResolvedValue(mockSession);
      db.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.validateSession("s-1");

      expect(result).toEqual(mockUser);
    });

    it("returns null for expired session", async () => {
      const pastDate = new Date(Date.now() - 86400000);
      db.query.sessions.findFirst.mockResolvedValue({
        id: "s-1",
        expiresAt: pastDate,
      });

      const result = await service.validateSession("s-1");

      expect(result).toBeNull();
    });

    it("returns null for nonexistent session", async () => {
      db.query.sessions.findFirst.mockResolvedValue(undefined);

      const result = await service.validateSession("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    it("deletes the session", async () => {
      await service.logout("session-1");

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
