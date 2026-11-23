const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const source=fs.readFileSync('public/images/wordmark.svg','utf8').match(/ d="([^"]+)"/)[1];
 const extracted=fs.readFileSync('public/images/brand-symbol.svg','utf8').match(/ d="([^"]+)"/)[1];
 assert.equal(source,extracted,'Brand geometry is copied exactly');
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
 const errors=[];
 try {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(()=>sessionStorage.setItem('kor8:intro-seen','1'));
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});await page.waitForTimeout(3400);
  assert(await page.locator('[data-title] span').evaluateAll(ns=>new Set(ns.map(n=>getComputedStyle(n).color)).size===1),'Entire headline white');
  assert.equal(await page.locator('[data-infinity-sculpture]').count(),0);
  await page.evaluate(()=>window.brandNode=document.querySelector('[data-shared-brand]'));
  const scroll=async t=>{await page.evaluate(t=>scrollTo(0,(document.querySelector('.cinematic-film').offsetHeight-innerHeight)*t/14.4),t);await page.waitForTimeout(1200);};
  const bounds=selector=>page.locator(selector).evaluate(n=>{const b=n.getBoundingClientRect();return [b.x,b.y,b.width,b.height];});
  const initial=await bounds('[data-shared-brand]');
  for(const t of [1.3,1.9,2.35]){await scroll(t);assert.equal(await page.locator('[data-shared-brand]').evaluate(n=>getComputedStyle(n).opacity),'1');}
  assert.deepEqual(await bounds('[data-shared-brand]'),initial,'Mark waits while ARCHIVE reveals');
  assert.equal(await page.locator('[data-archive-word]').evaluate(n=>getComputedStyle(n).opacity),'1');
  await scroll(2.95);
  const aligned=async()=>{const a=await bounds('[data-shared-brand]'),b=await bounds('[data-brand-destination]');assert(a.every((v,i)=>Math.abs(v-b[i])<1),'Mark settles precisely in heading slot');};
  await aligned();
  assert(await page.evaluate(()=>window.brandNode===document.querySelector('[data-shared-brand]')));
  await page.mouse.move(600,400);await page.waitForTimeout(450);
  assert(await page.evaluate(()=>getComputedStyle(document.elementFromPoint(600,400).closest('.archive-tile').querySelector('.tile-crimson')).opacity==='1'));
  await page.mouse.click(600,400);await page.waitForTimeout(1600);
  assert.equal(await page.locator('[data-project-crimson]').evaluate(n=>getComputedStyle(n).opacity),'0');
  assert.equal(await page.locator('.archive-dialog').evaluate(n=>getComputedStyle(n,'::after').display),'none');
  await page.keyboard.press('Escape');
  await page.locator('.archive-tile[data-project="model-film"]').nth(4).evaluate(n=>n.click());
  await page.waitForFunction(()=>{const v=document.querySelector('dialog video');return v&&!v.paused&&v.currentTime>0&&v.muted&&v.playsInline;});
  await page.evaluate(()=>window.closedVideo=document.querySelector('dialog video'));
  await page.keyboard.press('Escape');assert(await page.evaluate(()=>window.closedVideo.paused));
  for(const viewport of [{width:768,height:1024},{width:390,height:844}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(500);await scroll(2.95);await aligned();
   await page.screenshot({path:`artifacts/cinema/brand-archive-${viewport.width}.png`});
   await scroll(0);const a=await bounds('[data-shared-brand]'),b=await bounds('[data-brand-source]');assert(a.every((v,i)=>Math.abs(v-b[i])<1),'Reverse restores source after resize');
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-shared-brand]').evaluate(n=>getComputedStyle(n).display),'none');
  assert.equal(await page.locator('.embedded-brand-slot img').evaluate(n=>getComputedStyle(n).visibility),'visible');
  assert.deepEqual(errors,[]);
  console.log('PASS exact brand extraction, white headline, persistent single mark, staged title, alignment/reversal/resize, crimson hover, full-color activation, muted video cleanup and reduced motion.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
