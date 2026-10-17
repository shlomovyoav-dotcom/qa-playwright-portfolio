import { test, expect } from '@playwright/test';

test.describe('DummyJSON product API', () => {
  test('GET /products returns a list with money fields', async ({ request }) => {
    const res = await request.get('/products?limit=10');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/json/);

    const body = await res.json();
    expect(Array.isArray(body.products)).toBe(true);
    expect(body.products.length).toBeGreaterThan(0);

    for (const product of body.products) {
      expect(product).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          price: expect.any(Number),
        }),
      );
      expect(product.price).toBeGreaterThan(0);
    }
  });

  test('GET /products/1 is a single product whose id matches the path', async ({ request }) => {
    const res = await request.get('/products/1');
    expect(res.status()).toBe(200);
    const product = await res.json();
    expect(product.id).toBe(1);
    expect(product.title.length).toBeGreaterThan(0);
  });

  test('GET /products/99999 is 404', async ({ request }) => {
    const res = await request.get('/products/99999');
    expect(res.status()).toBe(404);
  });

  test('GET /carts/1 totals are consistent with the line items', async ({ request }) => {
    const res = await request.get('/carts/1');
    expect(res.status()).toBe(200);
    const cart = await res.json();

    const summed = cart.products.reduce(
      (acc: number, line: { price: number; quantity: number; total: number }) => {
        expect(line.total).toBeCloseTo(line.price * line.quantity, 2);
        return acc + line.total;
      },
      0,
    );
    expect(cart.total).toBeCloseTo(summed, 2);
  });
});
