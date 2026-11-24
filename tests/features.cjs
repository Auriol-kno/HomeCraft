// Browser checks for the review package: night mode, docked controls, rating prompt,
// history deletion, missed alerts and offline start. One scenario per block.
const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const url='http://127.0.0.1:4174/HomeCraft/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4174'],{stdio:'pipe'});
const fastClock=()=>{const real=performance.now.bind(performance);let start=null;performance.now=()=>{const t=real();if(start===null)start=t;return start+(t-start)*20;};};
const luminance=rgb=>{const [r,g,b]=rgb.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4});return .2126*r+.7152*g+.0722*b;};
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview did not start');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const errors=[];
 const open=async(opts={},init)=>{const ctx=await browser.newContext({viewport:{width:390,height:844},...opts});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));if(init)await p.addInitScript(init);await p.goto(url);await p.locator('#tabs button').first().waitFor({state:'attached'});return p;};
 const nav=(p,i)=>p.locator('nav button').nth(i).click();
 // body has a short colour transition (tints during brewing); read the target colour after it settles.
 const bg=async p=>{await p.waitForTimeout(600);return p.evaluate(()=>getComputedStyle(document.body).backgroundColor);};

 // 1. Day / night / system: every theme gets a dark palette, system follows the phone.
 {const p=await open({colorScheme:'light'});
  for(const theme of ['pastel','palarnia','bar','soft','line']){
   await p.click('#settingsBtn');await p.selectOption('#appTheme',theme);await p.selectOption('#appMode','dark');await p.locator('#settingsDialog button[type=submit]').click();
   assert.equal(await p.evaluate(()=>document.documentElement.dataset.mode),'dark');
   assert(luminance(await bg(p))<.05,`${theme} night background is dark`);
   assert(luminance(await p.evaluate(()=>getComputedStyle(document.querySelector('#screen-title')).color))>.6,`${theme} night text is light`);
  }
  await p.click('#settingsBtn');await p.selectOption('#appMode','system');await p.locator('#settingsDialog button[type=submit]').click();
  assert(luminance(await bg(p))>.5,'system mode is light when the phone is light');
  await p.emulateMedia({colorScheme:'dark'});await p.waitForTimeout(100);
  assert(luminance(await bg(p))<.05,'system mode follows the phone into dark');
  await p.click('#settingsBtn');await p.selectOption('#appMode','light');await p.locator('#settingsDialog button[type=submit]').click();
  assert(luminance(await bg(p))>.5,'day mode stays light on a dark phone');
  await p.reload();assert.equal(await p.evaluate(()=>document.documentElement.dataset.mode),'light');
  await p.context().close();}

 // 2. Extraction preview open: Start/Stop and Reset stay on screen in a dock.
 {const p=await open();await nav(p,1);
  assert.equal(await p.locator('.control-dock').count(),0);
  await p.locator('.visual-details summary').click();await p.evaluate(()=>document.querySelector('.app-content').scrollTo(0,0));
  await p.locator('.control-dock').waitFor();
  await p.locator('.dock-main').click();assert.equal((await p.locator('.dock-main').innerText()).trim(),'Stop');
  await p.waitForTimeout(1200);await p.locator('.dock-main').click();assert.equal((await p.locator('.dock-main').innerText()).trim(),'Wznów');
  const box=await p.locator('.control-dock').boundingBox(),navBox=await p.locator('nav.bottom-nav:not([hidden])').boundingBox();assert(box.y+box.height<=navBox.y+1,'dock sits above the navigation');
  await p.locator('.dock-reset').click();assert.equal(await p.locator('#bTime').innerText(),'0,0');
  await p.locator('.visual-details summary').click();await p.waitForTimeout(100);assert.equal(await p.locator('.control-dock').count(),0);
  await p.context().close();}

 // 3. After STOP the app asks for a rating; 4. a single history entry can be deleted.
 {const p=await open({},fastClock);await nav(p,1);
  await p.click('#mainBtn');await p.waitForTimeout(800);await p.click('#mainBtn');
  assert(await p.locator('#ratePrompt').isVisible(),'rating prompt after stop');
  await p.click('#ratePromptBtn');assert(await p.locator('#rateCard').isVisible());
  await p.locator('#stars button').nth(3).click();await p.locator('#tasteChips [data-t="ok"]').click();await p.click('#saveBtn');
  await nav(p,1);await p.click('#resetBtn');assert(await p.locator('#ratePrompt').isHidden());
  await nav(p,3);assert.equal(await p.locator('#hist .h').count(),1);
  p.once('dialog',d=>d.accept());await p.locator('#hist .h-del').click();
  assert.equal(await p.locator('#hist .h').count(),0);
  assert.equal((await p.evaluate(()=>JSON.parse(localStorage.getItem('cremalab.iphone.v3')))).hist.length,0);
  await p.context().close();}

 // 5. A stop alert that passed while the screen was locked is shown on return.
 {const p=await open({},fastClock);await nav(p,1);
  await p.evaluate(()=>{window.__raf=window.requestAnimationFrame;window.requestAnimationFrame=()=>0;});
  await p.click('#mainBtn');await p.waitForTimeout(2500);
  await p.evaluate(()=>{window.requestAnimationFrame=window.__raf;Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'));});
  await p.locator('#flash').waitFor();
  assert.match(await p.locator('#flash').innerText(),/POMINIĘTY ALERT/);
  await p.context().close();}

 // 6. Installable and offline: manifest, service worker, start without network.
 {const p=await open();
  const manifest=await p.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');return l&&(await fetch(l.href)).json();});
  assert.equal(manifest.display,'standalone');assert(manifest.icons.some(i=>i.sizes==='512x512'));
  await p.evaluate(()=>navigator.serviceWorker.ready);await p.waitForTimeout(800);
  await p.reload();await p.waitForTimeout(500);
  await p.context().setOffline(true);await p.reload();
  await p.locator('#tabs button').first().waitFor({state:'attached'});
  assert.equal(await p.locator('#tabs button').count(),6,'app starts offline');
  await p.context().setOffline(false);await p.context().close();}

 // 7. Home: the guide button is visible without scrolling on a small phone.
 {const p=await open({viewport:{width:375,height:667}});const box=await p.locator('#guideCta').boundingBox();const navBox=await p.locator('nav').boundingBox();
  assert(box&&box.y+box.height<=navBox.y+1,'guide button above the fold');await p.context().close();}


 // 8. Coffee database: name and package photo at rating, best settings on Kawa, "Twoje kawy" list.
 {const p=await open();
  const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAAFklEQVR4nGP4z8DAwMDAxMDAwMDAAAANBAEB0fWA6QAAAABJRU5ErkJggg==','base64');
  const rate=async(stars)=>{await nav(p,1);await p.click('#resetBtn');await p.click('#mainBtn');await p.waitForTimeout(400);await p.click('#mainBtn');await p.getByRole('button',{name:'Zakończ i oceń kawę'}).click();
   await p.click(`#stars [data-s="${stars}"]`);await p.click('#tasteChips [data-t="ok"]');await p.click('#bodyChips [data-b="ok"]');};
  await rate(5);await p.fill('#coffeeName','Hayb Brazylia');await p.click('#coffeeAdd');
  assert.equal(await p.locator('#coffeeChips button[aria-pressed="true"]').innerText(),'Hayb Brazylia');
  await p.locator('#coffeePhoto').setInputFiles({name:'pack.png',mimeType:'image/png',buffer:png});
  await p.locator('#coffeeThumbBox img').waitFor();
  await p.click('#saveBtn');
  // second rating: the coffee is offered as a chip and stays selected
  await rate(3);assert.equal(await p.locator('#coffeeChips button').count(),1);assert.equal(await p.locator('#coffeeChips button[aria-pressed="true"]').count(),1);await p.click('#saveBtn');
  await nav(p,3);assert.equal(await p.locator('#hist .h-coffee').count(),2);assert.equal(await p.locator('#hist .h-thumb').count(),2);
  assert.match(await p.locator('#coffees .cf').innerText(),/Hayb Brazylia[\s\S]*2 napary/);assert.equal(await p.locator('#coffees img.cf-thumb').count(),1);
  await nav(p,0);assert(await p.locator('#coffeeRow').isVisible());assert.equal(await p.locator('#homeCoffee').inputValue()!=='',true);
  assert.match(await p.locator('#coffeeHint').innerText(),/★★★★★/);
  const saved=await p.evaluate(()=>({c:JSON.parse(localStorage.getItem('cremalab.coffees.v1')),ph:Object.keys(JSON.parse(localStorage.getItem('cremalab.photos.v1'))).length,h:JSON.parse(localStorage.getItem('cremalab.iphone.v3')).hist.map(h=>h.coffee)}));
  assert.equal(saved.c.list.length,1);assert.equal(saved.ph,1);assert.deepEqual(saved.h,[saved.c.list[0].id,saved.c.list[0].id]);
  // The backup carries the coffee list and photos and restores them.
  await nav(p,3);await p.locator('.backup summary').click();const [dl]=await Promise.all([p.waitForEvent('download'),p.getByRole('button',{name:'Eksportuj kopię'}).click()]);
  const file=require('node:fs').readFileSync(await dl.path());
  await p.evaluate(()=>{localStorage.removeItem('cremalab.coffees.v1');localStorage.removeItem('cremalab.photos.v1');});
  p.once('dialog',d=>d.accept());await p.locator('.backup input[type="file"]').setInputFiles({name:'b.json',mimeType:'application/json',buffer:file});await p.waitForTimeout(800);
  const back=await p.evaluate(()=>[JSON.parse(localStorage.getItem('cremalab.coffees.v1')||'null'),Object.keys(JSON.parse(localStorage.getItem('cremalab.photos.v1')||'{}')).length]);
  assert.equal(back[0]?.list[0]?.name,'Hayb Brazylia');assert.equal(back[1],1);
  await p.context().close();}
 // Pastel is the main look: fresh installs get it, a saved Palarnia (old default) moves once, other choices stay.
 {const pref=t=>`localStorage.getItem('homecraft.pastelDefault.v1')||localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme:'${t}',mode:'light',density:'standard',language:'pl'}));`;
  const theme=p=>p.evaluate(()=>document.documentElement.dataset.theme);
  let p=await open();assert.equal(await theme(p),'pastel','fresh install');await p.context().close();
  p=await open({},pref('palarnia'));assert.equal(await theme(p),'pastel','old default moves to Pastel');
  await p.evaluate(()=>{localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme:'palarnia',mode:'light',density:'standard',language:'pl'}));});await p.reload();await p.locator('#tabs button').first().waitFor({state:'attached'});
  assert.equal(await theme(p),'palarnia','choosing Palarnia again is kept');await p.context().close();
  p=await open({},pref('line'));assert.equal(await theme(p),'line','another chosen theme stays');await p.context().close();}
 assert.deepEqual(errors,[]);console.log('PASS: night/day/system mode for 5 themes, Pastel default and one-time move from Palarnia, docked controls during preview, rating prompt, history delete, missed alert after lock, manifest + offline start, guide button above the fold, coffee database with photo.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill('SIGTERM');});
