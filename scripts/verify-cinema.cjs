/* Run against a local dev server. Playwright is a QA-only tool, not a runtime dependency. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}) });
  try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  const base = process.env.BASE_URL || 'http://localhost:3000';
  fs.mkdirSync('artifacts/cinema', { recursive: true });
  await page.goto(base, { waitUntil: 'networkidle' });
  console.log('Loaded homepage');
  await page.waitForFunction(() => document.activeElement?.hasAttribute('data-cta'), { timeout: 30000 });
  await page.getByRole('button', { name: 'CLICK TO BEGIN THE STORY' }).click({ timeout: 30000 });
  await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await page.waitForTimeout(3500);
  await page.screenshot({ path: 'artifacts/cinema/hero.png' });
  const state = () => page.evaluate(() => ({
    title: new DOMMatrix(getComputedStyle(document.querySelector('[data-title-scale]')).transform).a,
    panel: getComputedStyle(document.querySelector('[data-hero-mask]')).clipPath,
    bounds: (() => { const b = document.querySelector('[data-carried-portrait]').getBoundingClientRect(); return [b.x,b.y,b.width,b.height].map(Math.round); })(),
    quote: getComputedStyle(document.querySelector('[data-vision-type]')).transform,
    portrait: document.querySelector('[data-travel-frame]').getBoundingClientRect().top,
    white: getComputedStyle(document.querySelector('[data-scene="beyond"]')).clipPath,
    active: [...document.querySelectorAll('[data-scene]')].filter(x => !x.inert).map(x => x.dataset.scene),
    width: document.documentElement.scrollWidth,
  }));
  const scroll = async time => {
    await page.evaluate(time => {
      const root = document.querySelector('.cinematic-film');
      window.scrollTo(0, (root.offsetHeight - innerHeight) * time / 14.4);
    }, time);
    await page.waitForTimeout(1300);
    return state();
  };
  const initial = await state();
  const wipe = await scroll(1.1);
  assert.notEqual(wipe.title, initial.title, 'Hero recedes during the wipe');
  assert.notEqual(wipe.panel, initial.panel, 'Diagonal surface moves with actual scroll');
  const gallery = await scroll(3);
  assert.deepEqual(gallery.active, ['universe']);
  await page.screenshot({ path: 'artifacts/cinema/universe.png' });
  const overlap = await scroll(3.8);
  const overlapVisible = await page.evaluate(() => ['universe','vision'].every(name => +getComputedStyle(document.querySelector('[data-scene="'+name+'"]')).opacity > 0));
  assert(overlapVisible, 'Gallery overlaps the emerging quote');
  const vision = await scroll(5.4);
  assert.notEqual(overlap.quote, vision.quote, 'Quote pulls back');
  await page.screenshot({ path: 'artifacts/cinema/vision.png' });
  const before = await scroll(5.7);
  const middle = await scroll(7.1);
  const after = await scroll(8.4);
  assert(before.portrait > middle.portrait && middle.portrait > after.portrait, 'Portrait crosses viewport upward');
  await scroll(7.1);
  await page.screenshot({ path: 'artifacts/cinema/frame.png' });
  await scroll(9.3);
  await page.screenshot({ path: 'artifacts/cinema/collaboration.png' });
  const whiteStart = await scroll(10.1);
  const whiteEnd = await scroll(11.7);
  assert.notEqual(whiteStart.white, whiteEnd.white, 'White surface wipes over collaboration');
  await page.screenshot({ path: 'artifacts/cinema/beyond.png' });
  await scroll(14.4);
  await page.screenshot({ path: 'artifacts/cinema/closing.png' });
  for (const time of [11.7, 10.1, 8.4, 7.1, 5.7, 5.4, 3.8, 2.7, 1.1, 0]) {
    const back = await scroll(time);
    if (time === 11.7) assert.equal(back.white, whiteEnd.white, 'White wipe reverses deterministically');
    if (time === 7.1) assert(Math.abs(back.portrait - middle.portrait) < 2, 'Portrait reverses along the same path');
    if (time === 5.4) assert.equal(back.quote, vision.quote, 'Quote returns to its readable scale');
  }
  const reversed = await state();
  assert.deepEqual(reversed.active, ['hero']);
  assert.deepEqual(reversed.bounds, initial.bounds, 'Reverse scroll restores portrait bounds');
  assert.equal(reversed.title, initial.title, 'Reverse scroll restores hero scale');
  console.log('Verified four transitions and reverse scrolling');
  await page.getByRole('button', { name: 'MENU' }).click();
  await page.waitForTimeout(1100);
  await page.keyboard.press('Tab');
  assert(await page.evaluate(() => document.activeElement.closest('#cinema-menu') !== null), 'Focus stays inside menu');
  for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
  assert(await page.evaluate(() => document.activeElement.closest('#cinema-menu') !== null), 'Tab wraps inside menu');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1100);
  assert.equal(await page.getByRole('button', { name: 'MENU' }).getAttribute('aria-expanded'), 'false');
  await page.getByRole('button', { name: 'MENU' }).click();
  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: /01.*WORK/ }).click();
  await page.waitForTimeout(2400);
  assert.deepEqual((await state()).active, ['universe'], 'Work anchor lands inside the story');
  for (const y of [15000, 0, 7000, 500, 12000, 0]) await page.evaluate(y => window.scrollTo(0, y), y);
  await page.waitForTimeout(1200);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1200);
  await scroll(0);
  assert((await state()).width <= 390, 'Mobile has no horizontal document overflow');
  await page.screenshot({ path: 'artifacts/cinema/mobile.png' });
  for (const t of [2.7, 5.4, 7.1, 11.7, 14.4, 0]) await scroll(t);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.cinematic-film').getAttribute('data-animated'), null);
  assert.equal(await page.locator('[data-scene][inert]').count(), 0);
  assert(await page.getByRole('heading', { name: "LET'S MAKE SOMETHING INFINITE." }).isVisible());
  assert.deepEqual(errors, [], 'No runtime errors');
  const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const touchPage = await touchContext.newPage();
  touchPage.on('pageerror', e => errors.push(e.message));
  await touchPage.route('**/_next/image?**', route => route.abort());
  await touchPage.goto(base, { waitUntil: 'networkidle' });
  await touchPage.waitForFunction(() => document.documentElement.dataset.ready === 'true');
  await touchPage.waitForTimeout(700);
  assert.equal(await touchPage.locator('.cinematic-film').getAttribute('data-animated'), null, 'Fresh reduced-motion load is static');
  // The first photographic fallback now belongs to the later vision scene.
  await touchPage.locator('.vision-scene').scrollIntoViewIfNeeded();
  await touchPage.waitForFunction(() => document.querySelector('[role="img"][aria-label^="Placeholder:"]'));
  assert(await touchPage.locator('[role="img"][aria-label^="Placeholder:"]').count() > 0, 'Missing photographs have readable fallbacks');
  await touchPage.evaluate(() => window.scrollTo(0, 0));
  await touchPage.emulateMedia({ reducedMotion: 'no-preference' });
  await touchPage.waitForTimeout(1500);
  const cdp = await touchContext.newCDPSession(touchPage);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 180, y: 650 }] });
  for (const y of [600, 500, 400, 300, 200]) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
    await touchPage.waitForTimeout(40);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touchPage.waitForTimeout(1000);
  assert(await touchPage.evaluate(() => scrollY > 0), 'Native touch scrolling moves the film');
  await touchContext.close();
  assert.deepEqual(errors, [], 'No runtime errors after media failure and motion changes');
  console.log('PASS: four transitions, reverse scroll, menu, anchors, rapid scrolling, mobile resize and reduced motion.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });





