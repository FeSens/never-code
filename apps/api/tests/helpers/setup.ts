import { beforeAll } from "vitest";

beforeAll(async () => {
  // Integration test setup — DB migrations would run here
  // For now, assumes DB is already migrated via `pnpm db:migrate`
});
