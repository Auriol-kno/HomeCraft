const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.BOOK_BASE||'/HomeCraft/', url='http://127.0.0.1:4177'+base;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4177','--base',base],{stdio:'pipe'});
const shots='test-results/cookbook';fs.mkdirSync(shots,{recursive:true});
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview unavailable');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Warsaw',serviceWorkers:'block'});
 await ctx.clock.install({time:new Date('2026-11-24T10:00:00+01:00')});
 await ctx.addInitScript(()=>{if(!localStorage.getItem('book-seed')){localStorage.setItem('book-seed','1');localStorage.setItem('homecraft.cookbook.favourites.v1','{broken');localStorage.setItem('homecraft.fryer.favs.v1','["keep"]');}});
 const p=await ctx.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
 const go=async hash=>{await p.goto(url+'#'+hash);await p.reload();await p.locator('.module-bar').waitFor();};
 const shot=async name=>p.screenshot({path:`${shots}/${name}.png`});
 const layout=async label=>{
  const issues=await p.evaluate(()=>{
   const main=document.querySelector('main:not([hidden])');
   return {overflow:document.documentElement.scrollWidth>innerWidth+1||main.scrollWidth>main.clientWidth+1,
    small:[...document.querySelectorAll('.hc-book button, .hc-book input, .hc-book select, nav:not([hidden]) button, .module-bar button, .app-header .hc-pill')].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height<44).map(e=>e.textContent)};
  });assert(!issues.overflow,'overflow '+label);assert.deepEqual(issues.small,[],'touch targets '+label);
 };
 await go('home');await p.clock.pauseAt(new Date('2026-11-24T10:00:30+01:00'));await shot('01-start');
 for(const tab of ['Air Fryer','Dom','Zakupy','Kawa']){await p.getByRole('tab',{name:tab,exact:true}).click();await shot('02-module-'+tab.replace(' ','-'));}
 await p.getByRole('tab',{name:'Dom',exact:true}).click();await p.getByRole('button',{name:/Książka kucharska/}).click();
 await p.locator('.hc-book').waitFor();assert.match(await p.getByRole('status').filter({hasText:'Wyniki'}).innerText(),/100 \/ 100/);
 assert.equal(await p.locator('.hc-book-card').count(),20);
 await p.getByRole('button',{name:'Pokaż kolejne 20'}).click();assert.equal(await p.locator('.hc-book-card').count(),40);
 await p.getByLabel('Kuchnia',{exact:true}).selectOption('Azjatycka');assert.equal(await p.locator('.hc-book-card').count(),20);
 await p.getByLabel('Szukaj przepisu lub składnika').fill('teriyaki');assert.equal(await p.locator('.hc-book-card').count(),2);
 await p.getByLabel('Sortowanie').selectOption('kcal');
 const calories=(await p.locator('.hc-book-card .hc-book-facts b').allInnerTexts()).map(x=>Number(x.match(/\d+/)[0]));assert(calories.every((x,i)=>i===0||calories[i-1]<=x));
 await p.getByRole('button',{name:'Dodaj do ulubionych: Kurczak teriyaki z ryżem',exact:true}).click();
 await p.getByRole('button',{name:'Otwórz przepis: Kurczak teriyaki z ryżem',exact:true}).click();
 assert.equal(await p.evaluate(()=>document.activeElement.textContent),'Kurczak teriyaki z ryżem');
 await shot('03-detail-390');await layout('detail 390');
 await p.reload();assert(await p.getByRole('button',{name:'Usuń z ulubionych: Kurczak teriyaki z ryżem',exact:true}).isVisible());
 await p.getByRole('button',{name:/Zaplanuj ten przepis/}).click();
 await p.waitForURL('**/#plan/plan');assert.match(await p.locator('.hc-k-recipe').innerText(),/Kurczak teriyaki/);
 await p.getByRole('button',{name:/Gotuję teraz: podanie o/}).click();
 await p.getByRole('button',{name:/Dalej: przygotuj składniki/}).click();
 await p.getByRole('button',{name:/Dodaj nieodhaczone składniki do Zakupów/}).click();
 await p.getByRole('tab',{name:'Zakupy',exact:true}).click();await p.locator('main:not([hidden]) .hc-iname').filter({hasText:'Pierś z kurczaka'}).waitFor();await p.goBack();
 await p.getByRole('button',{name:/Zaczynamy gotowanie/}).click();
 await shot('04-cook');
 // Complete all steps, using the shared timers and controlled clock.
 let sawTimer=false;
 for(let n=0;n<100&&!await p.getByText('Smacznego!',{exact:true}).isVisible();n++){
  const alarm=p.getByRole('button',{name:'Wyłącz alarm'});if(await alarm.isVisible()){await alarm.click();continue;}
  const card=p.locator('.hc-k-now').first();
  const start=card.locator('.hc-k-actions button').filter({hasText:'Start ·'});
  if(await start.count()){await start.click();sawTimer=true;await p.clock.fastForward('01:00');await p.reload();
    const timerBefore=await p.locator('.hc-k-timer b').first().innerText();
    await p.getByRole('navigation',{name:'Nawigacja Kitchen OS'}).getByRole('button',{name:'Plan',exact:true}).click();
    await p.getByRole('button',{name:'5 min później',exact:true}).click();
    await p.getByRole('button',{name:/Wróć do gotowania/}).click();
    assert.equal(await p.locator('.hc-k-timer b').first().innerText(),timerBefore);continue;}
  const done=card.locator('.hc-k-actions button').filter({hasText:'Gotowe'});
  if(await done.count()&&!await card.locator('.hc-k-timer').count()){await done.click();continue;}
  await p.clock.fastForward('01:00');
 }
 assert(sawTimer);assert(await p.getByText('Smacznego!',{exact:true}).isVisible());await shot('05-completed');
 assert.equal(await p.evaluate(()=>localStorage.getItem('homecraft.fryer.favs.v1')),'["keep"]');
 await go('dom/recipes');await p.getByRole('button',{name:/Ulubione/}).click();assert.equal(await p.locator('.hc-book-card').count(),1);
 await p.getByRole('button',{name:/Usuń z ulubionych:/}).click();assert(await p.getByText(/Brak pasujących przepisów/).isVisible());
 await p.getByRole('button',{name:'Wyczyść filtry'}).click();
 await p.getByLabel('Szukaj przepisu lub składnika').fill('nienazwanyprodukt');assert.equal(await p.locator('.hc-book-card').count(),0);
 await p.getByRole('button',{name:'Wyczyść filtry'}).click();
 // Existing cooking progress requires confirmation; cancellation preserves it.
 const before=await p.evaluate(()=>localStorage.getItem('homecraft.kitchen.v1'));
 await go('dom/recipes/book-001');await p.getByRole('button',{name:/Zaplanuj ten przepis/}).click();
 await p.getByRole('button',{name:'Anuluj',exact:true}).click();assert.equal(await p.evaluate(()=>localStorage.getItem('homecraft.kitchen.v1')),before);
 await p.getByRole('button',{name:/Zaplanuj ten przepis/}).click();await p.getByRole('button',{name:'Zastąp plan',exact:true}).click();assert.equal(await p.evaluate(()=>location.hash),'#plan/plan');assert.match(await p.locator('.hc-k-recipe').innerText(),/Kotlety mielone/);
 // All themes, both modes, iPhone 320/390 and desktop, list and detail. Sample screenshots for every combination.
 for(const width of [320,390,1280]){
  await p.setViewportSize({width,height:width===320?740:900});
  for(const theme of ['pastel','palarnia','bar','soft','line'])for(const mode of ['light','dark']){
   await p.evaluate(({theme,mode})=>{localStorage.setItem('homecraft.pastelDefault.v1','1');localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme,mode,density:'standard',language:'pl'}));},{theme,mode});
   for(const view of ['dom/recipes','dom/recipes/book-021']){
    await go(view);await p.locator('.hc-book').waitFor();assert.equal(await p.evaluate(()=>document.documentElement.dataset.theme),theme);assert.equal(await p.evaluate(()=>document.documentElement.dataset.mode),mode);await layout(`${width}-${theme}-${mode}-${view}`);
    await shot(`${width}-${theme}-${mode}-${view.endsWith('021')?'detail':'list'}`);
   }
  }
 }
 await p.evaluate(()=>localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme:'pastel',mode:'light',density:'standard',language:'en'})));
 await go('dom/recipes');assert.equal(await p.evaluate(()=>document.documentElement.lang),'en');await p.getByLabel('Cuisine',{exact:true}).selectOption('Azjatycka');assert.equal(await p.locator('.hc-book-card').count(),20);assert(await p.getByRole('heading',{name:'Cookbook',exact:true}).isVisible());
 await p.evaluate(()=>localStorage.setItem('homecraft.kitchen.v1','null'));await go('plan/plan');assert(await p.locator('.hc-k-recipe').isVisible());
 await p.evaluate(()=>localStorage.setItem('homecraft.cookbook.favourites.v1','{"v":1,"ids":[null,"bad",2]}'));await go('dom/recipes/not-found');assert.equal(await p.locator('.hc-book-card').count(),20);
 assert.deepEqual(errors,[]);await ctx.close();
 // Real offline check, separate from deterministic clock tests: allow service worker and await cached assets.
 const offline=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'allow'});
 const off=await offline.newPage();await off.goto(url+'#dom/recipes');await off.locator('.hc-book-card').first().waitFor();
 await off.evaluate(async()=>{await navigator.serviceWorker.ready;});
 await off.waitForFunction(()=>!!navigator.serviceWorker.controller);
 await off.waitForFunction(async()=>{const urls=performance.getEntriesByType('resource').map(e=>e.name).filter(u=>/\.(js|css)$/.test(u));return urls.length>0&&(await Promise.all(urls.map(u=>caches.match(u,{ignoreVary:true})))).every(Boolean);});
 await offline.setOffline(true);await off.reload();await off.locator('.hc-book-card').first().waitFor();assert.equal(await off.locator('.hc-book-card').count(),20);
 await off.screenshot({path:`${shots}/offline-${base==='/'?'root':'pages'}.png`});await offline.close();
 console.log('PASS: cookbook flow, filters, favourites/reload, kcal, shopping, complete cooking with controlled clock, confirmation, corrupted storage, EN, 5 themes × 2 modes × 3 widths, screenshots. Base '+base);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
