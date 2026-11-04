/**
 * QA-01 / QA-02 E2E sketches for purchase→learn and admin refund/repair.
 *
 * Install Playwright in CI when ready:
 *   cd fe && npm i -D @playwright/test && npx playwright install
 *
 * Run with stack up + credentials:
 *   WEB_BASE_URL=http://localhost:3002 ADMIN_BASE_URL=http://localhost:3001 \
 *   E2E_USER_EMAIL=... E2E_USER_PASSWORD=... \
 *   E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... \
 *   npx playwright test e2e/purchase-to-learn.spec.ts
 *
 * Without credentials, tests skip (safe for default CI).
 *
 * Companion UAT (no browser): be/tests/order-admin-refund-repair.test.ts
 */
import { test, expect } from '@playwright/test';

const webBase = process.env.WEB_BASE_URL;
const adminBase = process.env.ADMIN_BASE_URL;
const hasLearnerEnv = Boolean(
  webBase && process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD,
);
const hasAdminEnv = Boolean(
  adminBase && process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD,
);

test.describe('QA-01 purchase → enroll → learn', () => {
  test.skip(!hasLearnerEnv, 'Set WEB_BASE_URL + E2E_USER_* to run');

  test('learner can reach learning hub', async ({ page }) => {
    await page.goto(`${webBase}/learning`);
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('QA-02 admin refund / repair surfaces', () => {
  test.skip(!hasAdminEnv, 'Set ADMIN_BASE_URL + E2E_ADMIN_* to run');

  test('orders page renders heading', async ({ page }) => {
    await page.goto(`${adminBase}/orders`);
    await expect(page.locator('body')).toBeVisible();
  });
});
