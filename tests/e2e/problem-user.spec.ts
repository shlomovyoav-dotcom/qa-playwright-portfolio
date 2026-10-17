import { test, expect } from '../../src/fixtures.ts';

/**
 * Sauce Demo ships a "problem_user" whose product images 404.
 * Pinning it with test.fail() is the public equivalent of leaving a known
 * production defect visible in CI instead of skipping it.
 */
test.use({ persona: 'problem' });

test.fail(
  'problem_user product images load (known demo defect: images 404)',
  async ({ loggedIn }) => {
    const images = loggedIn.items.locator('img');
    const count = await images.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const ok = await images.nth(i).evaluate((img: HTMLImageElement) => img.naturalWidth > 0);
      expect(ok, `image ${i} did not load`).toBe(true);
    }
  },
);
