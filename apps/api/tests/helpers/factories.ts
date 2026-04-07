import type { CreateUserInput } from "@never-code/shared/validators";

let counter = 0;

export function buildUser(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
  counter++;
  return {
    name: `User ${counter}`,
    email: `user-${counter}-${Date.now()}@test.com`,
    ...overrides,
  };
}

export function buildUsers(count: number, overrides: Partial<CreateUserInput> = {}): CreateUserInput[] {
  return Array.from({ length: count }, () => buildUser(overrides));
}
