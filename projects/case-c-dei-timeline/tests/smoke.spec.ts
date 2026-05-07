import { test, expect } from '@playwright/test';

/**
 * Smoke tests: every top-level route renders a 200, has a non-empty <title>,
 * and does not log console errors. Keep these cheap — they're meant to catch
 * dumb regressions (broken import, missing metadata, SSR crash), not validate
 * content or interactions.
 */

const staticRoutes = [
  '/',
  '/timeline',
  '/humans-of-pomfret',
  '/humans-of-pomfret/heads-of-school',
  '/archive',
  '/archive/civil-rights-era',
  '/archive/mission-accomplished',
  '/famous-figures',
  '/tour',
  '/ai-bias',
  '/privacy',
  '/accessibility',
];

// One representative dynamic route per [slug] template — spot-checks
// generateStaticParams + the View component resolving real data.
const dynamicRoutes = [
  '/humans-of-pomfret/john-irick',
  '/tour/school-house',
];

for (const path of [...staticRoutes, ...dynamicRoutes]) {
  test(`GET ${path} renders cleanly`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const response = await page.goto(path);
    expect(response?.status(), `status for ${path}`).toBeLessThan(400);

    const title = await page.title();
    expect(title.trim().length, `<title> on ${path}`).toBeGreaterThan(0);

    // Next.js hydration / metadata quirks can log warnings but errors signal
    // a real problem (missing module, hydration mismatch, blown effect).
    expect(consoleErrors, `console errors on ${path}`).toEqual([]);
  });
}

test('homepage hero has a heading and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav').first()).toBeVisible();
  await expect(page.locator('h1, h2').first()).toBeVisible();
});

test('404 page renders for unknown slugs', async ({ page }) => {
  // Next.js 14 renders the not-found body for unknown dynamic slugs but returns
  // HTTP 200 (a documented SSR quirk), so assert on content rather than status.
  await page.goto('/humans-of-pomfret/definitely-not-a-real-person');
  await expect(page).toHaveTitle(/Not Found/i);
});
