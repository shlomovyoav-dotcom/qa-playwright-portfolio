# Bug report (public rewrite)

A real defect on a public demo, written the way I filed billing bugs at work: account state, steps, expected vs actual, Console/Network evidence, impact. No employer URLs, account IDs, or catalog prices.

**Title:** `problem_user` — product images 404 on the inventory, so the customer cannot tell items apart  
**Severity:** Major (shoppable catalog is visually broken for this persona)  
**Area:** Inventory / media  
**Environment:** https://www.saucedemo.com · Chrome latest · 2026-10-17  
**Account state:** `problem_user` / `secret_sauce` (demo persona that ships with known defects)

## Expected
Each inventory card shows the product photograph. `img.naturalWidth > 0`.

## Actual
Every product `<img>` on `/inventory.html` has `naturalWidth === 0`. DevTools → Network: the image requests return **404**. Console: failed resource loads for `/static/media/*.jpg`. Standard user on the same build is fine — this is persona-specific, not a CDN outage.

## Steps
1. Open https://www.saucedemo.com
2. DevTools → Network, filter Img. Keep Console open.
3. Log in as `problem_user`.
4. Land on inventory. Compare the Network 404s with a second session as `standard_user`.

## Evidence to attach
- Screenshot of inventory (broken-image icons).
- Network HAR: image URLs + 404 status.
- Console export of the failed loads.
- Account state: persona = `problem_user`.

## Impact
A customer in this state cannot visually confirm what they are buying. On a real catalog this is the same class as “credits wallet shows the wrong balance after upgrade”: the number (or picture) on screen is not the system of record, and it only reproduces on a specific account state.

## Notes
`tests/e2e/problem-user.spec.ts` checks that this persona can still use the inventory. The image 404 is not a CI gate: it shows up in some browsers and not in GitHub-hosted Chrome, so pinning it with `test.fail()` made the suite red for the wrong reason.
