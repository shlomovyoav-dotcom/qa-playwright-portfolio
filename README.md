# Playwright QA portfolio

[![Playwright](https://github.com/shlomovyoav-dotcom/qa-playwright-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/shlomovyoav-dotcom/qa-playwright-portfolio/actions/workflows/ci.yml)

A **portfolio sample** of the billing-QA pattern I used at work — catalog of record vs what the customer sees, page objects, CI, API contracts — rewritten against two public demos so no employer code, accounts, or prices appear here. It is not a long-running production suite.

| Layer | Target | What it proves |
|---|---|---|
| E2E (POM) | [Sauce Demo](https://www.saucedemo.com) | Login, locked-out user, cart, checkout money-math |
| Catalog check | Sauce Demo inventory vs `src/data/catalog.ts` | Nightly “page vs system of record” pattern |
| API | [DummyJSON](https://dummyjson.com) | REST contract, status, JSON shape, money fields |
| Known bug | Sauce Demo `problem_user` | Sample bug report. The image 404 is documented, not used as a CI gate — it does not reproduce on every runner |

Stack: Playwright Test, TypeScript, Page Object Model, GitHub Actions + GitLab CI, HTML + JUnit reports.

I am not the author of Sauce Demo or DummyJSON. Selectors use their public `data-test` hooks. Nothing here is copied from a private repository.

## Run locally

```bash
npm ci
npx playwright install chromium
npm test                 # e2e + api
npm run test:e2e
npm run test:api
npm run price-check      # scrape the live inventory, diff against the catalog
npm run report           # open the last HTML report
```

Node 22+.

## Layout

```
src/pages/          Login, Inventory, Cart, Checkout — page objects
src/data/           Catalog of record + demo personas
src/fixtures.ts     Extends Playwright with those pages and a `loggedIn` fixture
tests/e2e/          UI journeys
tests/api/          REST checks
tools/price-check/  Standalone catalog vs storefront script (the Slack-alert pattern, minus Slack)
samples/            Bug report, Gherkin, working SQL, Postman collection
```

## What a reviewer should look at

1. `src/pages/` — locators live in one place; specs read like a journey.
2. `tests/e2e/checkout.spec.ts` — totals are *computed* from the catalog and tax rate, not copied from a screenshot.
3. `tests/e2e/problem-user.spec.ts` and `samples/bug-report.md` — the problem_user image defect, written up, and not allowed to flake the suite.
4. `tools/price-check/check-prices.ts` — exit 1 on mismatch; JSON report for CI.
5. `samples/` — how I write a bug, a Gherkin plan, a Mixpanel-style SQL check, and a Postman collection.

## CI

- GitHub Actions: `.github/workflows/ci.yml` (Chromium, HTML report uploaded on every run). Latest on `main` should be green.
- GitLab CI: `.gitlab-ci.yml` (same jobs; this is the runner I used at work).

## Author

Yoav Shlomov · QA Engineer · Tel Aviv · [yoavshlomov.com](https://yoavshlomov.com)
