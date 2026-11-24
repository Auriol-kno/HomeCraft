const {openModule}=require('./navigation.cjs');
// Browser test for Kitchen OS ("Zaplanuj gotowanie"): the whole sample dinner on a narrow iPhone screen
// with a controlled clock, data safety of the other modules, reload, 320 px and desktop layouts.
const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const url='http://127.0.0.1:4176/HomeCraft/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4176'],{stdio:'pipe'});
const shots=process.env.SHOTS;
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview did not start');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const errors=[];
 const ctx=await browser.newContext({viewport:{width:390,height:844},colorScheme:'light',timezoneId:'Europe/Warsaw'});
 await ctx.clock.install({time:new Date('2026-11-24T16:00:00+01:00')});
 // Existing user data that must survive: coffee history, a shopping item and a running kitchen timer.
 const coffee={hist:[{id:1,method:'Espresso',rating:4}]};
 await ctx.addInitScript(c=>{if(localStorage.getItem('seeded'))return;localStorage.setItem('seeded','1');
  localStorage.setItem('cremalab.iphone.v3',JSON.stringify(c));
  localStorage.setItem('homecraft.shopping.v1',JSON.stringify([{id:'a',name:'Mleko',qty:'2 l',cat:'Nabiał i jajka',done:false}]));},coffee);
 const p=await ctx.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const shot=async name=>{if(!shots)return;await p.evaluate(()=>document.querySelector('main:not([hidden])')?.scrollTo(0,0));await p.screenshot({path:`${shots}/${name}.png`});};
 const noOverflow=async label=>assert(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('main:not([hidden])')].some(m=>m.scrollWidth>m.clientWidth+1))),'horizontal overflow: '+label);
 const nav=()=>p.getByRole('navigation',{name:'Nawigacja Kitchen OS'});
 const current=async()=>(await p.locator('.hc-k-now .hc-k-title').allInnerTexts());
 await p.goto(url);await p.waitForSelector('.module-bar');
 await p.clock.pauseAt(new Date('2026-11-24T16:00:30+01:00'));

 // 1. Entry from Air Fryer; the global menu remains available.
 assert.equal(await p.locator('.primary-nav button').count(),6);
 await openModule(p,'Air Fryer');
 assert.equal(await p.locator('.hc-dish').count(),37,'Air Fryer dishes unchanged');
 await shot('01-air-fryer-entry');
 await p.getByRole('button',{name:/Zaplanuj gotowanie/}).click();
 await p.waitForSelector('.hc-k-serve');
 assert.equal(await p.evaluate(()=>location.hash),'#plan/plan');
 assert.match(await p.locator('.hc-k-recipe').innerText(),/Kurczak w panko, frytki i sałatka/);

 // 2. Mission Control: default serving time 17:45 (16:00 + 82 min + slack, rounded to 15), start 16:23.
 const clockText=()=>p.locator('.hc-k-clock').innerText(), startText=()=>p.locator('.hc-k-summary b').first().innerText();
 assert.equal(await clockText(),'17:45');assert.equal(await startText(),'16:23');
 await p.getByRole('button',{name:'15 min później',exact:true}).click();
 assert.equal(await clockText(),'18:00');assert.equal(await startText(),'16:38','plan recalculated');
 await p.getByLabel('Wpisz godzinę podania').fill('17:00');
 assert.equal(await clockText(),'17:00');
 assert.match(await p.locator('.hc-k-warn').innerText(),/Najwcześniej podasz o\s*17:23/,'too early is flagged, not silently changed');
 await p.getByRole('button',{name:'Ustaw 17:23'}).click();
 assert.equal(await clockText(),'17:23');assert.equal(await startText(),'16:01');
 await noOverflow('plan 390');await shot('02-plan');

 // 3. Mise en Place: 13 ingredients + 7 tools + 3 checks; missing ingredients go to Zakupy.
 await nav().getByRole('button',{name:'Przygotuj'}).click();
 assert.equal(await p.locator('.hc-kitchen .hc-items [role=checkbox]').count(),23);
 for(const name of ['Pierś z kurczaka','Jajka','Ziemniaki','Air Fryer COSORI 6 l','Termometr do mięsa'])await p.getByRole('checkbox',{name}).click();
 assert.equal(await p.locator('.hc-kitchen .hc-shop-prog b').innerText(),'5/23');
 await p.getByRole('button',{name:/Dodaj nieodhaczone składniki do Zakupów \(10\)/}).click();
 await shot('03-mise');
 await p.getByRole('navigation',{name:'Nawigacja główna'}).getByRole('button',{name:'Zakupy'}).click();
 const shop=await p.locator('main:not([hidden]) .hc-iname').allInnerTexts();
 assert(shop.some(x=>/^Panko/.test(x))&&shop.some(x=>/^Mleko/.test(x)),'panko added, milk kept');
 assert(!shop.some(x=>/^Ziemniaki/.test(x)),'ticked ingredients are not added');
 await p.goBack();await p.waitForSelector('.hc-k-cta');
 await p.getByRole('button',{name:/Zaczynamy gotowanie/}).click();

 // 4. Cooking Timeline: now / next / finish time, one step at a time.
 await p.waitForSelector('.hc-k-status');
 assert.deepEqual(await current(),['Pokrój ziemniaki w słupki']);
 assert.match(await p.locator('.hc-k-status').innerText(),/17:23/);
 assert.match(await p.locator('.hc-k-next').innerText(),/Namaczaj frytki/);
 await noOverflow('cook 390');await shot('04-cook-first');
 await p.getByRole('button',{name:'Gotowe ✓'}).click();
 assert.deepEqual(await current(),['Namaczaj frytki w zimnej wodzie']);
 await p.getByRole('button',{name:'Start · 30 min'}).click();
 assert.match(await p.locator('.hc-k-timer b').innerText(),/^(30:00|29:5\d)$/);
 const shared=await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.timers.v1')).map(t=>t.name));
 assert(shared.includes('Namaczanie frytek'),'uses the shared kitchen timers');

 // 5. Reload keeps the session; changing the serving time does not reset a running timer.
 await p.clock.fastForward('05:00');
 await p.reload();await p.waitForSelector('.hc-k-timer');
 assert.match(await p.locator('.hc-k-timer b').innerText(),/^2[45]:\d\d$/);
 await nav().getByRole('button',{name:'Plan'}).click();
 assert.match(await p.locator('.hc-k-hero').innerText(),/Teraz: Namaczaj frytki/);
 await p.getByRole('button',{name:'5 min później',exact:true}).click();
 assert.equal(await clockText(),'17:28');
 await p.getByRole('button',{name:/Wróć do gotowania/}).click();
 assert.match(await p.locator('.hc-k-timer b').innerText(),/^2[45]:\d\d$/,'timer kept counting');
 assert.match(await p.locator('.hc-k-status').innerText(),/17:28/);

 // 6. The timer ends: the shared alarm rings, then the step is ticked off.
 await p.clock.fastForward('25:30');
 await p.getByRole('button',{name:'Wyłącz alarm'}).click();
 assert.match(await p.locator('.hc-k-over').innerText(),/Czas minął/);
 await p.getByRole('button',{name:'Gotowe ✓'}).click();

 // 7. The rest of the dinner. Parallel steps: with the fries in the Air Fryer, breading the chicken is due too.
 // Loop: silence alarms, start timed steps, tick off steps without a running timer, otherwise let time pass.
 let sawParallel=false,steps=0;
 while(!(await p.getByText('Smacznego!').isVisible())&&steps++<150){
  if((await current()).length>1&&!sawParallel){sawParallel=true;await noOverflow('parallel');await shot('05-parallel');}
  const alarm=p.getByRole('button',{name:'Wyłącz alarm'});
  if(await alarm.isVisible()){await alarm.click();continue;}
  const toStart=p.locator('.hc-k-now').filter({has:p.locator('.hc-k-actions button:not([disabled])',{hasText:'Start ·'})}).first();
  if(await toStart.count()){
   if(/Kurczak do Air Fryera/.test(await toStart.innerText()))assert.match(await toStart.innerText(),/AIR FRY[\s\S]*200[\s\S]*12/,'appliance setting shown');
   await toStart.locator('.hc-k-actions button').click();continue;}
  const toFinish=p.locator('.hc-k-now:not(:has(.hc-k-timer))').filter({has:p.locator('.hc-k-actions button:not([disabled])',{hasText:'Gotowe'})}).first();
  if(await toFinish.count()){await toFinish.locator('.hc-k-actions button').click();continue;}
  await p.clock.fastForward('01:00');
 }
 assert(sawParallel,'at least two steps were shown as parallel');
 assert(await p.getByText('Smacznego!').isVisible(),'whole scenario completed');
 assert.equal(await p.locator('.hc-k-steps li.is-done').count(),11);
 await shot('06-done');

 // 8. Existing modules still switch, keep their data, and the coffee history is untouched.
 for(const [tab,sel] of [['Kawa','#tabs button'],['Air Fryer','.hc-dish'],['Kuchnia','.hc-book'],['Zakupy','.hc-iname']]){await openModule(p,tab);await p.locator(sel).first().waitFor({state:'attached'});}
 assert.deepEqual((await p.evaluate(()=>JSON.parse(localStorage.getItem('cremalab.iphone.v3')))).hist,coffee.hist,'coffee history untouched');
 await ctx.close();

 // 9. 320 px and desktop: every Kitchen OS view without horizontal scrolling; English chrome.
 for(const [w,h,label] of [[320,640,'320'],[1280,860,'desktop']]){
  const c2=await browser.newContext({viewport:{width:w,height:h},timezoneId:'Europe/Warsaw'});
  await c2.clock.install({time:new Date('2026-11-24T16:00:00+01:00')});
  const q=await c2.newPage();q.on('pageerror',e=>errors.push(e.message));
  for(const v of ['plan','mise','cook']){await q.goto(url+'#plan/'+v);await q.waitForSelector('.hc-kitchen');
   assert(!(await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||document.querySelector('.hc-kitchen').scrollWidth>document.querySelector('.hc-kitchen').clientWidth+1)),`overflow ${label} ${v}`);
   if(shots)await q.screenshot({path:`${shots}/07-${label}-${v}.png`});}
  await q.getByRole('button',{name:/Zaczynamy gotowanie/}).click();
  assert.match(await q.locator('.hc-k-wait').innerText(),/Pierwszy krok za 2[23] min/,'waits for the planned start');
  await q.getByRole('button',{name:/Gotuję teraz: podanie o/}).click();
  assert.deepEqual(await q.locator('.hc-k-now .hc-k-title').allInnerTexts(),['Pokrój ziemniaki w słupki']);
  const small=await q.evaluate(()=>[...document.querySelectorAll('.hc-kitchen button, .bottom-nav button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<44).map(b=>b.textContent));
  assert.deepEqual(small.filter(x=>x!==''),[],'touch targets ≥ 44 px at '+label);
  if(shots)await q.screenshot({path:`${shots}/08-${label}-cook-started.png`});
  await c2.close();
 }
 const en=await browser.newContext({viewport:{width:390,height:844}});
 const e=await en.newPage();await e.addInitScript(()=>localStorage.setItem('cremalab.preferences.v1',JSON.stringify({theme:'palarnia',mode:'system',density:'standard',language:'en'})));
 await e.goto(url+'#plan/plan');await e.waitForSelector('.hc-kitchen');
 assert.equal(await e.locator('.hc-kitchen h1').innerText(),'Plan cooking');
 await en.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: Kitchen OS plan → mise en place → cooking timeline (11 steps, parallel steps, shared timers and alarm, serving time recalculation, reload), shopping hand-off, other modules and data intact, 320 px / 390 px / desktop, English.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
