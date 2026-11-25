const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict'),fs=require('node:fs');
const {openModule}=require('./navigation.cjs');
const base=process.env.BOOK_BASE||'/HomeCraft/',url='http://127.0.0.1:4180'+base;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4180','--base',base],{stdio:'pipe'});
const shots='test-results/menu-timeline';fs.mkdirSync(shots,{recursive:true});let browser,p;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview unavailable');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.clock.install({time:new Date('2026-11-24T10:00:00+01:00')});
 const errors=[];p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));
 const go=async hash=>{await p.goto(url+'#'+hash);await p.reload();await p.locator('.primary-nav').waitFor();};
 await go('home');await p.clock.pauseAt(new Date('2026-11-24T10:00:30+01:00'));
 const nav=p.getByRole('navigation',{name:'Nawigacja główna'});
 assert.deepEqual(await nav.getByRole('button').allInnerTexts(),['Kuchnia','Napoje','Fryer','TM6','Użyteczne','Zakupy']);
 await nav.getByRole('button',{name:'Air Fryer',exact:true}).click();
 const fryerMenu=p.getByRole('navigation',{name:'Menu Air Fryer'});
 assert(await nav.isVisible(),'Global bottom navigation is persistent in Air Fryer');
 assert.deepEqual(await fryerMenu.getByRole('button').allInnerTexts(),['Dania','Timery','Zasady używania']);
 for(const button of await fryerMenu.getByRole('button').all())assert((await button.boundingBox()).height>=44,'large Air Fryer target');
 await p.screenshot({path:shots+'/fryer-menu-390.png'});
 assert.equal(await p.locator('.hc-dish').count(),37);
 assert.equal(await p.evaluate(()=>document.activeElement.tagName),'H1');
 assert.equal(await nav.getByRole('button',{name:'Air Fryer'}).getAttribute('aria-current'),'page');
 await p.getByRole('button',{name:/Frytki domowe/}).click();
 const sheet=p.getByRole('dialog');
 const timeline=sheet.locator('.hc-timeline');assert.match(await timeline.innerText(),/23 min/);
 await timeline.getByText('Etapy i czasy',{exact:true}).click();assert.match(await timeline.innerText(),/11 min/);assert.match(await timeline.innerText(),/18 min/);
 await sheet.locator('summary').press('Tab');assert(await p.evaluate(()=>document.querySelector('[role=dialog]').contains(document.activeElement)),'modal traps focus');
 await p.screenshot({path:shots+'/fryer-390.png'});
 await sheet.getByRole('button',{name:'Zamknij',exact:true}).click();assert.match(await p.evaluate(()=>document.activeElement.textContent),/Frytki domowe/);
 // Back while a dish is open must unmount the modal and restore interaction.
 await p.getByRole('button',{name:/Frytki domowe/}).click();await p.goBack();await p.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await nav.evaluate(el=>el.closest('[inert]')===null),true);
 await openModule(p,'Air Fryer');
 // The higher-priority alarm keeps keyboard focus above a still-open dish.
 await p.evaluate(()=>localStorage.setItem('homecraft.timers.v1',JSON.stringify([{id:'alarm-test',name:'Test alarmu',total:5,endAt:Date.now()+5000,paused:false,remain:5,marks:[],fired:[],act:'',meta:'',done:false,ack:false}])));
 await go('fryer/dishes');await p.getByRole('button',{name:/Frytki domowe/}).click();await p.clock.fastForward(6000);
 const alarm=p.getByRole('alertdialog');await alarm.waitFor();await alarm.getByRole('button',{name:'Wyłącz alarm',exact:true}).focus();await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.textContent),'Jeszcze 2 min');
 await alarm.getByRole('button',{name:'Wyłącz alarm',exact:true}).click();await p.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Zamknij');
 await sheet.getByRole('button',{name:'Zamknij',exact:true}).click();
 await nav.getByRole('button',{name:'Użyteczne',exact:true}).click();
 await p.goBack();assert.equal(await p.locator('.hc-dish').count(),37);await p.goForward();await nav.waitFor();
 await nav.getByRole('button',{name:/Thermomix TM6/}).click();const tmMenu=p.getByRole('navigation',{name:'Menu Thermomix'});assert.deepEqual(await tmMenu.getByRole('button').allInnerTexts(),['Przepisy','Timery','Zasady używania']);assert(await nav.isVisible());await tmMenu.getByRole('button',{name:'Zasady używania'}).click();assert.equal(new URL(p.url()).hash,'#dom/thermomix/rules');await p.reload();assert.equal(await tmMenu.getByRole('button',{name:'Zasady używania'}).getAttribute('aria-current'),'page');await p.goBack();assert.equal(await tmMenu.getByRole('button',{name:'Przepisy'}).getAttribute('aria-current'),'page');await p.screenshot({path:shots+'/thermomix-menu-390.png'});
 await nav.getByRole('button',{name:/Kuchnia/}).click();await p.getByRole('button',{name:/Książka kucharska/}).click();
 await p.evaluate(()=>{const now=Date.now();localStorage.setItem('homecraft.kitchen.v1',JSON.stringify({v:1,recipe:'book-021',serveAt:now+3600000,cooking:true,started:{s2:now},done:{s1:now},timers:{s2:'preview-keep'},mise:['i0']}));localStorage.setItem('homecraft.timers.v1',JSON.stringify([{id:'preview-keep',name:'Zachowaj timer',total:3600,endAt:now+3600000,paused:false,remain:3600,marks:[],fired:[],act:'Sprawdź',meta:'',done:false,ack:false}]));});
 const before=await p.evaluate(()=>({k:localStorage.getItem('homecraft.kitchen.v1'),t:localStorage.getItem('homecraft.timers.v1')}));
 await go('dom/recipes/panko-frytki-salatka');
 assert.match(await p.locator('.hc-book .hc-timeline').innerText(),/1 h 22 min/);
 await p.locator('.hc-book .hc-timeline summary').click();assert.equal(await p.locator('.hc-book .hc-timeline-steps>li').count(),11);
 assert.deepEqual(await p.evaluate(()=>({k:localStorage.getItem('homecraft.kitchen.v1'),t:localStorage.getItem('homecraft.timers.v1')})),before,'preview does not replace cooking session');
 await p.reload();assert.deepEqual(await p.evaluate(()=>({k:localStorage.getItem('homecraft.kitchen.v1'),t:localStorage.getItem('homecraft.timers.v1')})),before,'reload preserves active session');
 // Review each width/theme/mode: all lower menu destinations and each kind of timeline.
 for(const width of [320,390,1280])for(const theme of ['editorial','pastel','palarnia','bar','soft','line'])for(const mode of ['light','dark']){
  await p.setViewportSize({width,height:900});
  await p.evaluate(({theme,mode})=>{localStorage.setItem('homecraft.pastelDefault.v1','1');localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme,mode,language:'pl',density:'standard'}));},{theme,mode});
  for(const view of ['dom/timers','dom/recipes/book-021','fryer/dishes']){
   await go(view);if(view==='fryer/dishes')await p.getByRole('button',{name:/Frytki domowe/}).click();
   const issues=await p.evaluate(()=>{
    const root=document.querySelector('.hc-sheet')||document.querySelector('main:not([hidden])');
    return {over:document.documentElement.scrollWidth>innerWidth+1||root.scrollWidth>root.clientWidth+1,
     targets:[...document.querySelectorAll('nav:not([hidden]) button')].filter(e=>e.getBoundingClientRect().width>0&&(e.getBoundingClientRect().width<44||e.getBoundingClientRect().height<44)).map(e=>e.textContent)};
   });assert(!issues.over,`overflow ${width}/${theme}/${mode}/${view}`);assert.deepEqual(issues.targets,[],`targets ${width}/${theme}/${mode}/${view}`);
   await p.screenshot({path:`${shots}/${width}-${theme}-${mode}-${view.replaceAll('/','-')}.png`});
  }
 }
 await p.evaluate(()=>localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme:'pastel',mode:'dark',language:'en',density:'standard'})));
 await go('dom/recipes/book-021');assert(await p.getByRole('navigation',{name:'Main navigation'}).getByRole('button',{name:'Cookbook',exact:true}).isVisible());assert(await p.getByRole('region',{name:'Cooking timeline',exact:true}).isVisible());
 assert(await p.getByLabel('Cuisine',{exact:true}).count()===0); // Recipe card, no filter; context translation stays separate.
 await go('dom/recipes');assert(await p.getByLabel('Cuisine',{exact:true}).isVisible());
 await openModule(p,'Air Fryer');assert.equal(await p.locator('.hc-dish').count(),37);
 await p.reload();assert.equal(await p.locator('.hc-dish').count(),37,'legacy fryer route reload');
 await p.evaluate(()=>{localStorage.setItem('homecraft.timers.v1',JSON.stringify([{id:'legacy-missing-arrays',total:3600,endAt:Date.now()+3600000}]));localStorage.setItem('homecraft.cookbook.favourites.v1','{broken');});await go('dom/timers');await p.locator('.hc-timer').first().waitFor();await go('dom/recipes');assert.equal(await p.locator('.hc-book-card').count(),20);
 assert.deepEqual(errors,[]);console.log('PASS: persistent global navigation, 600-recipe timeline, Air Fryer preview/milestones, read-only session, 320/390/desktop × 6 themes × day/night, EN, reload. Base '+base);
})().catch(async e=>{console.error(e);if(p&&!p.isClosed()){await p.screenshot({path:shots+'/failure.png'});fs.writeFileSync(shots+'/failure.html',await p.content());}process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
