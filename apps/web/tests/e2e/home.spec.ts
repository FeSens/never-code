import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("displays hero heading and tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Never Code" })).toBeVisible();
    await expect(page.getByText("gold standard for agentic fullstack engineering")).toBeVisible();
  });

  test("displays the stack section with technologies", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "The Stack" })).toBeVisible();
    await expect(page.getByText("Next.js")).toBeVisible();
    await expect(page.getByText("Hono")).toBeVisible();
    await expect(page.getByText("tRPC")).toBeVisible();
    await expect(page.getByText("Drizzle")).toBeVisible();
  });

  test("displays the harness section with slash commands", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "The Harness" })).toBeVisible();
    await expect(page.getByText("/implement")).toBeVisible();
    await expect(page.getByText("/experiment")).toBeVisible();
    await expect(page.getByText("/test-e2e")).toBeVisible();
  });

  test("displays the blueprint loop section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "The Loop" })).toBeVisible();
    await expect(page.getByText("DETERMINISTIC")).toBeVisible();
    await expect(page.getByText("KEEP or DISCARD")).toBeVisible();
  });

  test("displays footer", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByText("Built by agents, verified by machines, trusted by humans"),
    ).toBeVisible();
  });
});
