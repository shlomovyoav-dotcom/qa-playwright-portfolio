import { test, expect } from '../../src/fixtures.ts';

/**
 * Sauce Demo's problem_user is the persona that ships with broken product images.
 * That 404 reproduces in some browsers and not others, so CI does not pin it with
 * test.fail() — a third-party defect that flips would make the suite red for the
 * wrong reason. The sample bug report still documents it. This test checks the
 * stable part: the persona can sign in and use the inventory.
 */
test.use({ persona: 'problem' });

test('problem_user reaches the inventory and can add an item', async ({ loggedIn }) => {
  await loggedIn.expectLoaded();
  await loggedIn.addToCart('sauce-labs-backpack');
  await loggedIn.expectCartCount(1);

  const images = loggedIn.items.locator('img');
  const broken = await images.evaluateAll((nodes) =>
    nodes.filter((node) => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth === 0;
    }).length,
  );
  test.info().annotations.push({
    type: broken > 0 ? 'known-defect' : 'note',
    description:
      broken > 0
        ? `${broken} product image(s) failed to load for problem_user. See samples/bug-report.md.`
        : 'problem_user images loaded in this browser. The classic 404 is documented in samples/bug-report.md and is not a CI gate.',
  });
});
