import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserService } from "@/services/user-service";

function createMockDb() {
  return {
    query: {
      users: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
  };
}

describe("UserService", () => {
  let service: UserService;
  let db: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    db = createMockDb();
    service = new UserService(db as any);
  });

  describe("getById", () => {
    it("returns user when found", async () => {
      const mockUser = { id: "1", name: "Alice", email: "alice@test.com" };
      db.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await service.getById("1");

      expect(result).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      db.query.users.findFirst.mockResolvedValue(undefined);

      const result = await service.getById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("list", () => {
    it("returns all users", async () => {
      const mockUsers = [
        { id: "1", name: "Alice", email: "alice@test.com" },
        { id: "2", name: "Bob", email: "bob@test.com" },
      ];
      db.query.users.findMany.mockResolvedValue(mockUsers);

      const result = await service.list();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });
  });
});
