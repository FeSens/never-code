import { expect, test } from "@playwright/test";

const TEST_USER = {
  name: "E2E Test User",
  email: `e2e-${Date.now()}@test.com`,
  password: "password123",
};

test.describe("Auth flow", () => {
  test("register → login → dashboard → logout", async ({ page }) => {
    // Register
    await page.goto("/register");
    await page.getByLabel("Name").fill(TEST_USER.name);
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);

    // Login
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Welcome")).toBeVisible();
    await expect(page.getByText(TEST_USER.name)).toBeVisible();

    // Logout from dashboard
    await page.getByRole("button", { name: "Logout" }).first().click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("register with duplicate email shows error", async ({ page }) => {
    const email = `dup-${Date.now()}@test.com`;

    // Register first time
    await page.goto("/register");
    await page.getByLabel("Name").fill("First User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();
    await expect(page).toHaveURL(/\/login/);

    // Register again with same email
    await page.goto("/register");
    await page.getByLabel("Name").fill("Second User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Create Account" }).click();

    // Should show error
    await expect(page.getByText(/email already in use/i)).toBeVisible();
  });

  test("visiting /dashboard without auth redirects to /login", async ({ page }) => {
    // Clear any stored session
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("sessionId"));

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
