const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_PATH });
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.addInitScript(() => sessionStorage.setItem('kor8:intro-seen', '1'));
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto((process.env.BASE_URL || 'http://localhost:3000') + '/archive', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.querySelectorAll('.archive-tile img').length === 72 && [...document.querySelectorAll('.archive-tile img')].every(i => i.complete && i.naturalWidth));
    await page.waitForTimeout(500);
    const coverage = async () => assert.equal(await page.evaluate(() => {
      const boxes = [...document.querySelectorAll('.archive-tile')].map(n => n.getBoundingClientRect());
      const xs = [...new Set([0, innerWidth, ...boxes.flatMap(b => [Math.max(0, Math.min(innerWidth, b.left)), Math.max(0, Math.min(innerWidth, b.right))])])].sort((a,b) => a-b);
      // Sweep every vertical strip delimited by tile edges, proving full coverage.
      for (let i=1; i<xs.length; i++) {
        const x = (xs[i-1]+xs[i])/2;
        const spans = boxes.filter(b => b.left <= x && b.right >= x).sort((a,b) => a.top-b.top);
        let end = 0;
        for (const b of spans) { if (b.top > end + .01) return false; end = Math.max(end,b.bottom); }
        if (end < innerHeight) return false;
      }
      return true;
    }), true, 'Every viewport strip is covered by photographs');
    await coverage();
    const initial = await page.locator('.archive-wall').getAttribute('style');
    for (let i=0;i<24;i++) {
      await page.locator('.infinite-archive').dispatchEvent('wheel', { deltaX: (i%2 ? -1 : 1)* (10031+i*13), deltaY: (i%3 ? -1 : 1)*(12007+i*17) });
      await coverage();
    }
    assert.notEqual(await page.locator('.archive-wall').getAttribute('style'), initial);
    // Hover affects only filters, never geometry; the activated tile stays mounted.
    await page.mouse.move(550,350);
    await page.waitForTimeout(600);
    await coverage();
    await page.evaluate(() => { const tile = document.elementFromPoint(550,350).closest('.archive-tile'); window.archiveOriginal = tile; });
    await page.mouse.click(550,350);
    await page.waitForTimeout(1500);
    assert(await page.locator('dialog').evaluate(n => n.open));
    assert(await page.evaluate(() => window.archiveOriginal.isConnected && getComputedStyle(window.archiveOriginal).visibility !== 'hidden' && window.archiveOriginal.querySelector('img').naturalWidth > 0));
    await coverage();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    assert.equal(await page.locator('dialog').count(),0);
    // Keyboard navigation must bring its actual tile into view after wrapping.
    for (let i=0;i<8;i++) {
      await page.keyboard.press('Tab');
      const visible = await page.evaluate(() => { const n=document.activeElement; if (!n.matches('.archive-tile')) return true; const b=n.getBoundingClientRect(); return b.left>=-1 && b.top>=-1 && b.right<=innerWidth+1 && b.bottom<=innerHeight+1; });
      assert(visible,'Keyboard-focused tile is visible');
      await coverage();
    }
    // Native media begins only after deliberate activation, with muted inline playback.
    await page.locator('.archive-tile[data-project="model-film"]').nth(4).evaluate(n => n.click());
    await page.waitForFunction(() => { const v=document.querySelector('dialog video'); return v && !v.paused && v.currentTime>0 && v.muted && v.playsInline; });
    await page.keyboard.press('Escape');
    for (const viewport of [{width:768,height:1024},{width:390,height:844},{width:844,height:390},{width:375,height:812}]) {
      await page.setViewportSize(viewport); await page.waitForTimeout(150); await coverage();
      await page.locator('.infinite-archive').dispatchEvent('wheel',{deltaX:-999999,deltaY:999999}); await coverage();
    }
    fs.mkdirSync('artifacts/cinema',{recursive:true});
    await page.mouse.move(0,0);
    await page.screenshot({path:'artifacts/cinema/archive-mobile.png'});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.mouse.click(180,350); await page.waitForTimeout(100);
    assert(await page.locator('dialog').evaluate(n => n.open));
    await page.keyboard.press('Escape');
    const touch = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
    await touch.addInitScript(() => sessionStorage.setItem('kor8:intro-seen','1'));
    const tp = await touch.newPage(); tp.on('pageerror', e => errors.push(e.message));
    await tp.goto((process.env.BASE_URL || 'http://localhost:3000')+'/archive',{waitUntil:'networkidle'});
    const before = await tp.locator('.archive-wall').getAttribute('style');
    const cdp = await touch.newCDPSession(tp);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:500}]});
    for (const y of [460,400,320,200]) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:140,y}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.notEqual(await tp.locator('.archive-wall').getAttribute('style'),before);
    assert.equal(await tp.locator('dialog').count(),0,'Dragging does not activate a project');
    await tp.waitForTimeout(400);
    await tp.touchscreen.tap(180,400); assert(await tp.locator('dialog').evaluate(n=>n.open));
    await tp.getByRole('button',{name:'Close project'}).tap();
    assert.deepEqual(errors,[]);
    console.log('PASS: packed coverage, rapid two-axis wrapping, hover, retained source tile, keyboard, video playback, resize/orientation, reduced motion, touch drag/tap; no runtime errors.');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
