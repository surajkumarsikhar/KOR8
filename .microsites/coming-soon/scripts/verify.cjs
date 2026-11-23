const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
 const browser = await chromium.launch({executablePath:process.env.BROWSER_PATH, headless:true});
 const errors=[];
 for (const config of [{name:'desktop',width:1440,height:900},{name:'laptop',width:1366,height:768},{name:'mobile',width:390,height:844,touch:true},{name:'tablet',width:768,height:1024,touch:true},{name:'reduced',width:1440,height:900,reduced:true}]) {
  const page=await browser.newPage({viewport:{width:config.width,height:config.height},hasTouch:!!config.touch,isMobile:!!config.touch,reducedMotion:config.reduced?'reduce':'no-preference'});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3001',{waitUntil:'networkidle'}); await page.waitForTimeout(1700);
  assert.equal(await page.locator('nextjs-portal').count(),0,'Must test static export');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Horizontal overflow');
  assert.match(await page.locator('.header-contact').getAttribute('href'),/^mailto:business@kor8.in\?subject=/);
  await page.locator('.exposure-target').click({position:{x:30,y:150}});
  await page.locator('.exposure-target').click({position:{x:30,y:150}});
  assert.match(await page.locator('.frame-counter').innerText(),/002/);
  await page.waitForTimeout(650);
  assert.equal(await page.locator('[data-exposure]').evaluate(e=>Number(getComputedStyle(e).opacity)),0);
  await page.screenshot({path:`artifacts/${config.name}-opening.png`});
  if(config.width>=1024 && !config.reduced){
   for(const fraction of [.18,.33,.53,.73,1]) {await page.evaluate(f=>scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*f),fraction);await page.waitForTimeout(900);await page.screenshot({path:`artifacts/${config.name}-${fraction}.png`});}
   assert.equal(await page.locator('.invitation').evaluate(e=>e.inert),false);
   const cta=await page.locator('.project-cta').boundingBox(); const footer=await page.locator('.invitation-footer').boundingBox(); assert(cta.y+cta.height<footer.y,'CTA/footer overlap');
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(900);
   assert.equal(await page.locator('.hero').evaluate(e=>e.inert),false);
   await page.locator('.skip-link').focus();await page.keyboard.press('Enter');await page.waitForTimeout(900);
   assert.equal(await page.evaluate(()=>document.activeElement.id),'invitation');
  } else {
   assert.equal(await page.locator('.stage').evaluate(e=>getComputedStyle(e).position),'relative');
   await page.locator('#invitation').scrollIntoViewIfNeeded();await page.waitForTimeout(700);await page.screenshot({path:`artifacts/${config.name}-invitation.png`});
   const cta=await page.locator('.project-cta').boundingBox();const footer=await page.locator('.invitation-footer').boundingBox();assert(cta.y+cta.height<footer.y,'Mobile CTA/footer overlap');
  }
  console.log(`${config.name}: passed`);await page.close();
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('All static-export interaction checks passed.');
})().catch(e=>{console.error(e);process.exit(1)});
