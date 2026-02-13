import { test, expect } from "@playwright/test";

test.describe("Authentication Flow (Mocked API)", () => {
  test("New User Registration via Mobile", async ({ page }) => {
    // --- 1. MOCKING API RESPONSES ---

    // مرحله ۱: تشخیص کاربر (کاربر جدید)
    await page.route("**/api/v1/auth/identify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          exists: false,
          detected_type: "mobile",
          next_step: "otp",
          masked_identifier: "0912***6789",
        }),
      });
    });

    // مرحله ۲: ارسال OTP
    await page.route("**/api/v1/auth/otp/send", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ message: "Sent" }),
      });
    });

    // مرحله ۳: تأیید OTP
    await page.route("**/api/v1/auth/otp/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          verification_token: "mock-uuid-token-12345",
          message: "Verified",
        }),
      });
    });

    // مرحله ۴: ثبت‌نام نهایی
    await page.route("**/api/v1/auth/register", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "mock-jwt-token",
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          role: "free",
          user: { id: "u1", mobile: "09123456789", role: "free" },
        }),
      });
    });

    // ماک کردن لاگین نکست‌آت
    await page.route("**/api/auth/callback/credentials*", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ url: "http://localhost:3000/" }),
      });
    });

    // --- 2. USER INTERACTION ---

    await page.goto("/login");

    const inputIdentity = page.getByPlaceholder("0912...");
    await expect(inputIdentity).toBeVisible();
    await inputIdentity.fill("09123456789");

    await page.getByRole("button", { name: "ادامه" }).click();

    await expect(page.getByRole("heading", { name: "کد تایید" })).toBeVisible();

    const inputOtp = page.getByPlaceholder("— — — — — —");
    await inputOtp.fill("123456");
    await page.getByRole("button", { name: "تایید" }).click();

    await expect(
      page.getByRole("heading", { name: "ایجاد حساب کاربری" }),
    ).toBeVisible();

    await page.getByPlaceholder("نام", { exact: true }).fill("تست");
    await page.getByPlaceholder("نام خانوادگی").fill("کاربر");
    await page.getByPlaceholder("رمز عبور (حداقل ۸ رقم)").fill("password123");

    await page.getByRole("button", { name: "ساخت حساب" }).click();
  });
});
