import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("displays heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Never Code" })).toBeVisible();
  });
});
