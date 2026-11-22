const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
 const errors=[];
 try {
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addInitScript(()=>sessionStorage.setItem('kor8:intro-seen','1'));
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});await page.waitForTimeout(3400);
  const state=()=>page.evaluate(()=>{
   const hero=document.querySelector('.hero-scene');
   const m=new DOMMatrix(getComputedStyle(document.querySelector('[data-portrait-parallax]')).transform);
   return {x:m.m41,y:m.m42,clip:[...document.querySelectorAll('[data-hero-mask]')].map(n=>getComputedStyle(n).clipPath),
    boundary:parseFloat(getComputedStyle(hero).getPropertyValue('--hero-wipe-y')),
    strength:+getComputedStyle(hero).getPropertyValue('--hero-parallax-strength'),
    portraitOpacity:getComputedStyle(document.querySelector('[data-carried-portrait]')).opacity};
  });
  const initial=await state();
  await page.evaluate(()=>{window.originalPortrait=document.querySelector('[data-carried-portrait]');window.originalSculpture=document.querySelector('[data-infinity-sculpture]');});
  await page.mouse.move(1200,650);await page.waitForTimeout(750);
  let s=await state();assert(s.x<0&&s.y<0,'Portrait moves inversely right/down');assert(Math.abs(s.x)<=24&&Math.abs(s.y)<=13);
  await page.mouse.move(200,250);await page.waitForTimeout(750);s=await state();assert(s.x>0&&s.y>0,'Inverse left/up');
  await page.locator('.hero-scene').dispatchEvent('pointerleave');await page.waitForTimeout(750);s=await state();assert(Math.abs(s.x)<.01&&Math.abs(s.y)<.01,'Pointer exit neutral');
  const scroll=async t=>{await page.evaluate(t=>scrollTo(0,(document.querySelector('.cinematic-film').offsetHeight-innerHeight)*t/14.4),t);await page.waitForTimeout(1200);};
  fs.mkdirSync('artifacts/cinema',{recursive:true});
  await page.screenshot({path:'artifacts/cinema/refined-hero-desktop.png'});
  await scroll(1.6);s=await state();assert.equal(s.clip[0],s.clip[1],'Background and portrait use identical clipping geometry');
  assert(s.boundary>400&&s.boundary<800,'Boundary passes spatially through torso');assert.equal(s.strength,0);assert.equal(s.portraitOpacity,'1','No separate portrait fade');
  await page.mouse.move(1300,700);await page.waitForTimeout(750);s=await state();assert.equal(s.x,0);assert.equal(s.y,0);
  await page.screenshot({path:'artifacts/cinema/refined-wipe.png'});
  await scroll(2);const neck=await state();assert(neck.boundary<s.boundary,'Boundary advances toward head');
  await scroll(2.95);assert(await page.getByRole('button',{name:'Explore wall',exact:true}).isVisible());
  assert(await page.evaluate(()=>window.originalPortrait===document.querySelector('[data-carried-portrait]')&&window.originalSculpture===document.querySelector('[data-infinity-sculpture]')));
  await scroll(1.6);assert.deepEqual((await state()).clip,s.clip,'Mask reverses along same boundary');
  await scroll(0);assert.deepEqual((await state()).clip,initial.clip);assert.equal((await state()).strength,1);
  for(const viewport of [{width:768,height:1024},{width:390,height:844},{width:844,height:390}]) {
   await page.setViewportSize(viewport);await page.waitForTimeout(500);await scroll(1.6);
   assert.equal((await state()).clip[0],(await state()).clip[1]);await scroll(0);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
   await page.screenshot({path:`artifacts/cinema/refined-hero-${viewport.width}.png`});
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(300);
  assert.equal(await page.locator('[data-portrait-parallax]').evaluate(n=>getComputedStyle(n).transform),'none');
  assert.deepEqual((await state()).clip,['none','none']);
  assert.deepEqual(errors,[]);
  console.log('PASS inverse parallax, neutral exit, shared diagonal geometry, portrait masking without fade, reversible continuity, resize/orientation, reduced motion; no runtime errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
