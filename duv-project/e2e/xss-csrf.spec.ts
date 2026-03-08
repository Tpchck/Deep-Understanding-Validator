import { test, expect } from '@playwright/test';

test('XSS: should sanitize user input', async ({ page }) => {
  await page.goto('/');
  // Try to inject script
  await page.evaluate(() => {
    const el = document.createElement('div');
    el.innerHTML = '<img src=x onerror=alert(1) />';
    document.body.appendChild(el);
  });
  // There should be no alert
  expect(await page.evaluate(() => !!window.alert)).toBe(false);
});

test('CSRF: should block forged POST', async ({ request }) => {
  const res = await request.post('/api/questions', {
    headers: { Origin: 'https://evil.com' },
    data: { question: 'test' },
  });
  expect(res.status()).toBe(403);
});
