const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_PATH});
  const errors=[];
  try {
    const context=await browser.newContext({viewport:{width:1440,height:900}});
    await context.addInitScript(()=>sessionStorage.setItem('kor8:intro-seen','1'));
    const page=await context.newPage(); page.on('pageerror',e=>errors.push(e.message));
    await page.goto(process.env.BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});
    await page.waitForTimeout(3400);
    const state=()=>page.evaluate(()=>{
      const rect=s=>{const r=document.querySelector(s).getBoundingClientRect(); return [r.x,r.y,r.width,r.height];};
      return {layers:[...document.querySelectorAll('[data-weave]')].map(n=>{const m=new DOMMatrix(getComputedStyle(n).transform);return {kind:n.dataset.weave,x:m.m41,y:m.m42,rotation:Math.atan2(m.m12,m.m11)*180/Math.PI};}),
        portrait:rect('[data-carried-portrait]'), nav:rect('nav'), label:rect('[data-detail="tl"]'),
        opacity:[...document.querySelectorAll('[data-hero-grain]')].map(n=>+getComputedStyle(n).opacity),
        global:getComputedStyle(document.querySelector('[data-global-grain]')).visibility,
        strength:+getComputedStyle(document.querySelector('.hero-scene')).getPropertyValue('--hero-weave-strength')};
    });
    const base=await state(); assert(base.opacity[0]>0 && base.opacity[1]>base.opacity[0]); assert.equal(base.global,'hidden');
    await page.evaluate(()=>{window.carriedNode=document.querySelector('[data-carried-portrait]');});
    const impulse=async()=>{
      for(let i=0;i<6;i++){
        await page.locator('.hero-scene').dispatchEvent('pointermove',{pointerType:'mouse',clientX:100+(i%2)*300,clientY:200+i*25});
        await page.waitForTimeout(38);
      }
    };
    await impulse(); const moving=await state();
    assert(moving.layers.some(l=>Math.abs(l.x)>.05),'Pointer velocity excites the gate');
    for(const l of moving.layers){assert(Math.abs(l.x)<=1.5*base.strength && Math.abs(l.y)<=base.strength && Math.abs(l.rotation)<=.121*base.strength,'Bounded impulse');}
    assert.deepEqual(moving.portrait,base.portrait); assert.deepEqual(moving.nav,base.nav); assert.deepEqual(moving.label,base.label);
    await page.waitForTimeout(650);
    assert((await state()).layers.every(l=>Math.abs(l.x)<.001 && Math.abs(l.y)<.001 && Math.abs(l.rotation)<.001),'Naturally settles to neutral');
    fs.mkdirSync('artifacts/cinema',{recursive:true});
    await page.screenshot({path:'artifacts/cinema/hero-atmosphere.png'});
    const scroll=async time=>{await page.evaluate(t=>window.scrollTo(0,(document.querySelector('.cinematic-film').offsetHeight-innerHeight)*t/14.4),time);await page.waitForTimeout(1300);};
    await scroll(.7); assert((await state()).strength<.7);
    await scroll(1.6); await impulse(); const wiped=await state(); assert.equal(wiped.strength,0); assert(wiped.opacity.every(v=>v===0)); assert(wiped.layers.every(l=>l.x===0&&l.y===0));
    await scroll(2.95); assert(await page.evaluate(()=>window.carriedNode===document.querySelector('[data-carried-portrait]')),'Continuity node preserved');
    await scroll(0); assert.deepEqual((await state()).opacity,base.opacity); assert.deepEqual((await state()).portrait,base.portrait);
    await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForTimeout(200); await impulse();
    assert((await state()).layers.every(l=>l.x===0&&l.y===0),'Reduced motion disables weave');
    await page.emulateMedia({reducedMotion:'no-preference'}); await page.waitForTimeout(200); await impulse();
    assert((await state()).layers.some(l=>Math.abs(l.x)>.05),'Media change recreates effect once');
    const touch=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    await touch.addInitScript(()=>sessionStorage.setItem('kor8:intro-seen','1'));
    const tp=await touch.newPage();tp.on('pageerror',e=>errors.push(e.message));
    await tp.goto(process.env.BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});await tp.waitForTimeout(3400);
    await tp.locator('.hero-scene').dispatchEvent('pointermove',{pointerType:'mouse',clientX:350,clientY:200});
    assert(await tp.locator('[data-weave]').evaluateAll(ns=>ns.every(n=>getComputedStyle(n).transform==='none')),'Coarse pointers do not weave');
    await tp.screenshot({path:'artifacts/cinema/hero-atmosphere-mobile.png'});
    assert.deepEqual(errors,[]);
    console.log('PASS: grain layers, bounded velocity impulse, settling, stable portrait/UI, scroll fade and reversal, continuity, reduced motion and coarse pointers; no runtime errors.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
