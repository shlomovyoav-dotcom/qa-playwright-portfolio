import { test, expect } from '@playwright/test';
import { clusterFailures, signatureOf, type Failure } from '../../tools/triage/cluster.ts';

const f = (over: Partial<Failure>): Failure => ({
  title: 'checkout › totals add up',
  file: 'tests/e2e/checkout.spec.ts:12',
  project: 'e2e',
  outcome: 'failed',
  attempts: 3,
  error: 'Error: expect(received).toBe(expected)\nExpected: 32.39\nReceived: 32.38',
  attachments: [],
  annotations: [],
  ...over,
});

test.describe('triage signatures', () => {
  test('strips volatile parts so retries of the same failure match', () => {
    const a = signatureOf('Timeout 30000ms exceeded waiting for locator("[data-test=\\"cart\\"]") at /home/ci/run/1/tests/e2e/cart.spec.ts:40');
    const b = signatureOf('Timeout 30000ms exceeded waiting for locator("[data-test=\\"checkout\\"]") at /Users/yoav/qa/tests/e2e/cart.spec.ts:77');
    expect(a).toBe(b);
    expect(a).not.toContain('30000');
    expect(a).not.toContain('/home/');
  });

  test('different assertions stay apart', () => {
    expect(signatureOf('Error: expect(received).toBe(expected)')).not.toBe(signatureOf('Error: page.goto: net::ERR_NAME_NOT_RESOLVED'));
  });
});

test.describe('triage clustering', () => {
  test('groups by area + signature and counts flaky separately', () => {
    const clusters = clusterFailures([
      f({}),
      f({ title: 'checkout › tax line', outcome: 'flaky', attempts: 2 }),
      f({ title: 'products › shape', file: 'tests/api/products.spec.ts:9', project: 'api', error: 'Error: expected 200, got 503' }),
    ]);
    expect(clusters).toHaveLength(2);
    const e2e = clusters.find((c) => c.area === 'e2e')!;
    expect(e2e.failures).toHaveLength(2);
    expect(e2e.flakyCount).toBe(1);
    expect(clusters.find((c) => c.area === 'api')!.failures).toHaveLength(1);
  });

  test('consistent failures sort before flaky-only clusters', () => {
    const clusters = clusterFailures([
      f({ outcome: 'flaky', error: 'Error: A' }),
      f({ outcome: 'flaky', error: 'Error: A', title: 'second' }),
      f({ outcome: 'failed', error: 'Error: B' }),
    ]);
    expect(clusters[0].signature).toContain('B');
  });

  test('empty input gives no clusters', () => {
    expect(clusterFailures([])).toEqual([]);
  });
});
