// Browser checks for the Air Fryer and Dom modules: module switching, dishes and timers,
// eggs, measures (szklanka cukru = 220 g = 22 dag), cooking times, persistence and English.
const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const url='http://127.0.0.1:4175/HomeCraft/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4175'],{stdio:'pipe'});
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview did not start');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const errors=[];
 const p=await (await browser.newContext({viewport:{width:390,height:844},colorScheme:'light'})).newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await p.goto(url);await p.waitForSelector('.module-bar');
 const domNav=p.getByRole('navigation',{name:'Nawigacja Dom'}),fryerNav=p.getByRole('navigation',{name:'Nawigacja Air Fryer'});
 const tab=async name=>p.getByRole('tab',{name}).click();

 // Coffee stays the default module, with its own five-button navigation (Kawa, Parzenie, Sprzęt, Historia, Herbata).
 assert.equal(await p.locator('.module-bar [aria-selected=true]').innerText(),'Kawa');
 assert.equal(await p.locator('nav.bottom-nav button').count(),5);

 // Tea guide: categories, search, per-tea info panel, brewing time handed to the timer.
 await p.locator('nav.bottom-nav button').nth(4).click();
 assert((await p.locator('.hc-tea').count())>=20,'tea cards');
 await p.getByRole('button',{name:'Zielone',exact:true}).click();
 const green=await p.locator('.hc-tea').count();assert(green>=4&&green<10,'green teas '+green);
 await p.getByRole('button',{name:'Wszystkie',exact:true}).click();
 await p.getByPlaceholder('Szukaj: sencha').fill('sencha');assert.equal(await p.locator('.hc-tea').count(),1);
 await p.locator('.hc-tea summary').first().click();
 assert.match(await p.locator('.hc-brew').first().innerText(),/75 °C/);
 await p.getByRole('button',{name:'Info i ciekawostki'}).first().click();
 assert.match(await p.locator('.hc-tea-info').first().innerText(),/Jak powstaje/);
 await p.getByRole('button',{name:/Ustaw timer Sencha 1 min/}).click();
 await p.waitForSelector('.hc-dial');
 assert.equal(await p.locator('.module-bar [aria-selected=true]').innerText(),'Dom');
 await p.getByRole('tab',{name:'Kawa'}).click();

 // Air Fryer: 37 dishes, search, device settings, timer with a shake reminder.
 await tab('Air Fryer');
 assert.equal(await p.locator('.hc-dish').count(),37);
 await p.getByPlaceholder('Szukaj: frytki').fill('frytki');assert.equal(await p.locator('.hc-dish').count(),4);
 await p.locator('.hc-dish').first().click();
 assert.match(await p.locator('.hc-device').innerText(),/AIR FRY/);
 await p.getByRole('button',{name:/Start timera 20 min/}).click();
 await p.waitForSelector('.hc-dial');
 assert.equal(await p.locator('.hc-dial-time').innerText(),'20:00','dish time is already in the dial');
 await p.getByRole('button',{name:'Uruchom timer'}).click();
 await p.waitForSelector('.hc-timer');
 assert.match(await p.locator('.hc-timer [role=timer]').first().innerText(),/^(19:5\d|20:00)$/);
 assert.equal(await p.locator('.hc-bar b').count(),2,'two shake marks for frytki');
 await fryerNav.getByRole('button',{name:'Dania'}).click();
 await p.locator('.hc-dish').first().click();await p.locator('.hc-sheet').getByRole('button',{name:'Ulubione'}).click();await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.fryer.favs.v1')).length),1);

 // Dom: eggs
 await tab('Dom');
 // Kitchen timers are the first Dom tab: round dial, quick times, advanced options, stopwatch.
 assert.equal(await p.locator('h1:visible').first().innerText(),'Timery kuchenne');
 assert.equal(await domNav.getByRole('button').first().innerText(),'Timery');
 const mins=p.getByRole('slider',{name:'Minuty'}),secs=p.getByRole('slider',{name:'Sekundy'});
 assert.equal(await p.getByRole('slider',{name:'Godziny'}).count(),0,'no hours ring');
 await mins.focus();for(let i=0;i<5;i++)await p.keyboard.press('ArrowRight');
 await secs.focus();for(let i=0;i<70;i++)await p.keyboard.press('ArrowRight');
 assert.deepEqual([await mins.getAttribute('aria-valuenow'),await secs.getAttribute('aria-valuenow')],['16','10'],'turning seconds past 60 carries into minutes');
 assert.match(await p.locator('.hc-dial-time').innerText(),/^16:10$/);
 for(let i=0;i<70;i++)await p.keyboard.press('ArrowLeft');
 assert.deepEqual([await mins.getAttribute('aria-valuenow'),await secs.getAttribute('aria-valuenow')],['15','0'],'and borrows back when turned the other way');
 await p.locator('.hc-adv summary').click();
 await p.getByRole('button',{name:'Więcej rund'}).click();
 await p.getByRole('button',{name:'30 s'}).click();
 await p.getByLabel('Nazwa timera').fill('Interwał');
 await p.getByRole('button',{name:'Uruchom timer'}).click();
 const saved=await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.timers.v1'))[0]);
 assert.equal(saved.total,900);assert.equal(saved.rep,2);assert.equal(saved.pre,30);assert.equal(saved.name,'Interwał');
 await p.getByRole('button',{name:'Usuń',exact:true}).first().click();
 // Start, pause and reset live in the middle of the rings.
 await p.getByRole('button',{name:'5 min',exact:true}).click();
 await p.getByRole('button',{name:'Uruchom timer'}).click();
 await p.waitForTimeout(1500);await p.locator('.hc-dc.main').click();
 assert.equal(await p.locator('.hc-dc.main').getAttribute('aria-label'),'Wznów');
 assert.match(await p.locator('.hc-dial-time').innerText(),/^04:5\d$/,'dial shows the running countdown');
 await p.getByRole('button',{name:'Zeruj timer'}).click();
 assert.equal(await p.locator('.hc-dial-time').innerText(),'05:00','reset returns the dial to the set time');
 // Stopwatch with laps persists across reloads.
 await p.getByRole('button',{name:'Stoper',exact:true}).click();
 await p.getByRole('button',{name:'Start',exact:true}).click();await p.waitForTimeout(400);
 await p.getByRole('button',{name:'Okrążenie',exact:true}).click();await p.waitForTimeout(250);
 assert.equal(await p.locator('.hc-laps tbody tr').count(),1);
 // Running: the digits sit below the pivot on an opaque backing (the hand passes behind), and Pauza fills with time.
 const sw=await p.evaluate(()=>{const d=document.querySelector('.hc-sw-mid .hc-dial-time'),dial=document.querySelector('.hc-sw-mid').parentElement.getBoundingClientRect(),r=d.getBoundingClientRect(),btn=[...document.querySelectorAll('.hc-sw-ctrl button')].find(x=>x.textContent==='Pauza');
  return {below:r.top>dial.top+dial.height/2,bg:getComputedStyle(d).backgroundColor,fill:btn.classList.contains('hc-fill')&&/%/.test(btn.style.getPropertyValue('--fill'))};});
 assert(sw.below,'stopwatch digits below the hand pivot');assert(!/rgba\(0, 0, 0, 0\)|transparent/.test(sw.bg),'digits have a backing');assert(sw.fill,'Pauza fills while running');
 await p.getByRole('button',{name:'Pauza',exact:true}).click();
 await p.reload();await p.waitForSelector('.module-bar');await tab('Dom');await p.getByRole('button',{name:'Stoper',exact:true}).click();
 assert.equal(await p.locator('.hc-laps tbody tr').count(),1,'laps survive a reload');
 await p.getByRole('button',{name:'Zeruj'}).click();
 await p.getByRole('button',{name:'Minutnik',exact:true}).click();
 // Dom: eggs
 await domNav.getByRole('button',{name:'Jajka'}).click();
 await p.getByRole('button',{name:/Start timera Na twardo/}).click();
 await p.waitForSelector('.hc-dial');
 assert.match(await p.locator('.hc-dial-time').innerText(),/^09:[23]\d$/,'egg time is already in the dial');
 await p.getByRole('button',{name:'Uruchom timer'}).click();
 assert.equal(await p.locator('.hc-timer').count(),2);
 assert.match(await p.locator('.hc-timer [role=timer]').first().innerText(),/^(09:2\d|09:30)$/);
 // Dom: measures
 await domNav.getByRole('button',{name:'Miarki'}).click();
 const big=await p.locator('.hc-big').innerText();assert.match(big,/220 g/);assert.match(big,/22 dag/);
 await p.locator('select.hc-input').first().selectOption('maka');assert.match(await p.locator('.hc-big').innerText(),/150 g/);
 // Dom: cooking times by method
 await domNav.getByRole('button',{name:'Gotowanie'}).click();
 const all=await p.locator('.hc-card').count();
 await p.getByRole('button',{name:'Na parze',exact:true}).click();
 const steam=await p.locator('.hc-card').count();assert(steam>5&&steam<all,'method filter narrows the list');
 // Tapping a time next to a dish sets it in the timer dial (it does not start a timer by itself).
 const before=await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.timers.v1')).length);
 const chip=p.locator('.hc-chip-btn').first();const dishMin=parseInt((await chip.innerText()).replace(/\D/g,''));await chip.click();
 assert.equal(await p.locator('h1:visible').first().innerText(),'Timery kuchenne');
 assert.equal(await p.locator('.hc-dial-time').innerText(),String(dishMin).padStart(2,'0')+':00','dish time is set in the dial');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.timers.v1')).length),before,'not started yet');
 // Thermomix TM6: manual settings without Cookidoo.
 await domNav.getByRole('button',{name:'Thermomix'}).click();
 assert((await p.locator('.hc-tm').count())>=12,'Thermomix recipes');
 await p.locator('.hc-tm summary').filter({hasText:'Ryż w koszyczku'}).click();
 assert.match(await p.locator('.hc-tm[open] .hc-set').first().innerText(),/18 min · 100 °C · obr\. 4/);
 await p.locator('.hc-tm summary').filter({hasText:'Ciasto na pizzę'}).click();
 await p.locator('.hc-tm[open] .hc-chip-btn').click();
 assert.equal(await p.locator('.hc-dial-time').innerText(),'40:00','rest time goes to the dial');

 // Shopping list: add, group by aisle, tick, quick products, persistence.
 await tab('Zakupy');
 const shop=p.getByRole('navigation',{name:'Nawigacja Zakupy'});
 for(const x of ['2 l mleko','chleb','pomidory 1 kg','płyn do naczyń']){await p.getByLabel('Nowy produkt').fill(x);await p.getByLabel('Nowy produkt').press('Enter');}
 assert.equal(await p.locator('.hc-items li').count(),4);
 assert.deepEqual(await p.locator('.hc-aisle .hc-h3').allInnerTexts().then(a=>a.map(x=>x.replace(/\s*\d+$/,''))),['Warzywa i owoce','Pieczywo','Nabiał i jajka','Dom i chemia']);
 assert.match(await p.locator('.hc-iname').filter({hasText:'Mleko'}).innerText(),/2 l/);
 await p.getByRole('checkbox',{name:/Kupione: Chleb/}).click();
 assert.match(await p.locator('.hc-shop-prog').innerText(),/1\/4/);
 await shop.getByRole('button',{name:'Produkty'}).click();await p.getByRole('button',{name:'Jajka',exact:true}).click();
 await shop.getByRole('button',{name:'Lista'}).click();assert.equal(await p.locator('.hc-items li').count(),5);
 await p.getByLabel('Nowy produkt').fill('jajka');await p.getByLabel('Nowy produkt').press('Enter');assert.equal(await p.locator('.hc-items li').count(),5,'no duplicates');
 await p.reload();await p.waitForSelector('.module-bar');await tab('Zakupy');
 assert.equal(await p.locator('.hc-items li').count(),5,'list survives a reload');
 await p.getByRole('button',{name:'Usuń kupione'}).click();assert.equal(await p.locator('.hc-items li').count(),4);

 // One soft, raised bottom-nav look in every theme and mode, and a dark module bar that contrasts with the page.
 for(const [th,mo] of [['palarnia','light'],['bar','light'],['soft','light'],['palarnia','dark'],['bar','dark'],['soft','dark'],['line','light'],['line','dark']]){
  await p.evaluate(([a,b])=>{document.documentElement.dataset.theme=a;document.documentElement.dataset.mode=b;},[th,mo]);
  const look=await p.evaluate(()=>{const nav=document.querySelector('nav.bottom-nav:not([hidden])'),btn=nav.querySelector('button'),cur=nav.querySelector('[aria-current=page]');return {sh:getComputedStyle(btn).boxShadow,r:getComputedStyle(btn).borderRadius,act:getComputedStyle(cur).boxShadow};});
  assert.notEqual(look.sh,'none',`${th}/${mo} nav buttons are raised`);assert.match(look.act,/inset/,`${th}/${mo} active tab is pressed in`);assert.equal(look.r,th==='line'?'22px':'20px');
  const bar=await p.evaluate(()=>{const b=getComputedStyle(document.querySelector('.module-bar')).backgroundColor,pg=getComputedStyle(document.querySelector('.app-shell')).backgroundColor;return [b,pg];});
  assert.notEqual(bar[0],bar[1],`${th}/${mo} module bar contrasts with the page`);
 }
 await p.evaluate(()=>{document.documentElement.dataset.theme='palarnia';document.documentElement.dataset.mode='light';});
 assert.equal(await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()),'#b85328','terracotta from the icon');
 // Extraction preview: pressure gauge and visualization sit side by side.
 await tab('Kawa');await p.evaluate(()=>{location.hash='timer'});await p.locator('.visual-details summary').click();
 const [g,sc]=await Promise.all([p.locator('.visual-details .gauge').boundingBox(),p.locator('.visual-details .scene').boundingBox()]);
 assert(sc.x>g.x+g.width-2&&Math.abs(g.y-sc.y)<4,'gauge and scene are side by side');
 await p.evaluate(()=>{location.hash='home'});

 // The running kitchen timer is reachable from the coffee module; coffee data is untouched.
 await tab('Kawa');
 assert.equal(await p.locator('.hc-pill').count(),1);
 await p.locator('.hc-pill').click();
 assert.equal(await p.locator('.module-bar [aria-selected=true]').innerText(),'Dom');
 await p.reload();await p.waitForSelector('.module-bar');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.timers.v1')).length),2,'timers survive a reload');

 // A finished timer rings over every module and can be stopped.
 await p.evaluate(()=>{const k='homecraft.timers.v1';const t=JSON.parse(localStorage.getItem(k));t[0].endAt=Date.now()+300;localStorage.setItem(k,JSON.stringify(t));});
 await p.reload();await p.waitForSelector('.module-bar');
 await p.waitForSelector('.hc-alarm',{timeout:5000});
 await p.getByRole('button',{name:'Wyłącz alarm'}).click();assert.equal(await p.locator('.hc-alarm').count(),0);

 // English UI, no horizontal overflow at 320 px, themes apply to the new modules.
 await p.click('#settingsBtn');await p.selectOption('#appLanguage','en');await p.selectOption('#appTheme','bar');await p.selectOption('#appMode','dark');await p.locator('#settingsDialog button[type=submit]').click();
 assert.equal(await p.getByRole('tab',{name:'Home'}).count(),1);
 await p.setViewportSize({width:320,height:640});
 for(const [m,n] of [['Air Fryer',3],['Home',5],['Shopping',2]])for(let i=0;i<n;i++){await p.getByRole('tab',{name:m}).click();await p.locator('nav.bottom-nav:not([hidden]) button').nth(i).click();
  const over=await p.evaluate(()=>[...document.querySelectorAll('.app-content:not([hidden]) *')].filter(e=>!e.closest('.hc-chips,.module-bar')&&e.getBoundingClientRect().right>document.documentElement.clientWidth+1).length);assert.equal(over,0,`${m} tab ${i} fits 320 px`);}
 assert.deepEqual(errors,[]);
 console.log('PASS: modules — switching, round timer + stopwatch, shopping list, one nav look in every theme, side-by-side preview, 37 dishes, device settings and shake timers, eggs, measures (szklanka cukru = 220 g = 22 dag), cooking times, timers across modules and reloads, alarm, English, 320 px, zero JS errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
