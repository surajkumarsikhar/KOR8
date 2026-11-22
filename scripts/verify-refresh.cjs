const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  const file = 'src/components/sections/Hero.tsx';
  const original = fs.readFileSync(file, 'utf8');
  let changed = false;
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.BASE_URL || 'http://localhost:3000', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'CLICK TO BEGIN THE STORY' }).click();
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 4200));
    await page.waitForTimeout(1000);
    const updated = original.replace('                data-title', '                data-refresh-probe="true" data-title');
    assert.notEqual(updated, original);
    fs.writeFileSync(file, updated);
    changed = true;
    await page.locator('[data-refresh-probe="true"]').waitFor({ state: 'attached' });
    fs.writeFileSync(file, original);
    changed = false;
    await page.locator('[data-refresh-probe="true"]').waitFor({ state: 'detached' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(2000);
    assert.equal(await page.locator('.film-stage').count(), 1);
    assert.equal(await page.locator('.pin-spacer').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: Fast Refresh updates and reverses without React reconciliation errors or duplicate stages.');
  } finally {
    if (changed) fs.writeFileSync(file, original);
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });

