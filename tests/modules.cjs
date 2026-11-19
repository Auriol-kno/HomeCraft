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

 // Coffee stays the default module, with its own four-button navigation.
 assert.equal(await p.locator('.module-bar [aria-selected=true]').innerText(),'Kawa');
 assert.equal(await p.locator('nav.bottom-nav button').count(),4);

 // Air Fryer: 37 dishes, search, device settings, timer with a shake reminder.
 await tab('Air Fryer');
 assert.equal(await p.locator('.hc-dish').count(),37);
 await p.getByPlaceholder('Szukaj: frytki').fill('frytki');assert.equal(await p.locator('.hc-dish').count(),4);
 await p.locator('.hc-dish').first().click();
 assert.match(await p.locator('.hc-device').innerText(),/AIR FRY/);
 await p.getByRole('button',{name:/Start timera 20 min/}).click();
 await p.waitForSelector('.hc-timer');
 assert.match(await p.locator('.hc-timer-time').first().innerText(),/^(19:5\d|20:00)$/);
 assert.equal(await p.locator('.hc-bar b').count(),2,'two shake marks for frytki');
 await fryerNav.getByRole('button',{name:'Dania'}).click();
 await p.locator('.hc-dish').first().click();await p.locator('.hc-sheet').getByRole('button',{name:'Ulubione'}).click();await p.keyboard.press('Escape');
 assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.fryer.favs.v1')).length),1);

 // Dom: eggs
 await tab('Dom');
 await p.getByRole('button',{name:/Start timera Na twardo/}).click();
 assert.equal(await p.locator('.hc-timer').count(),2);
 assert.match(await p.locator('.hc-timer-time').first().innerText(),/^(09:2\d|09:30)$/);
 // Dom: measures
 await domNav.getByRole('button',{name:'Miarki'}).click();
 const big=await p.locator('.hc-big').innerText();assert.match(big,/220 g/);assert.match(big,/22 dag/);
 await p.locator('select.hc-input').first().selectOption('maka');assert.match(await p.locator('.hc-big').innerText(),/150 g/);
 // Dom: cooking times by method
 await domNav.getByRole('button',{name:'Gotowanie'}).click();
 const all=await p.locator('.hc-card').count();
 await p.getByRole('button',{name:'Na parze',exact:true}).click();
 const steam=await p.locator('.hc-card').count();assert(steam>5&&steam<all,'method filter narrows the list');

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
 for(const m of ['Air Fryer','Home'])for(let i=0;i<3;i++){await p.getByRole('tab',{name:m}).click();await p.locator('nav.bottom-nav:not([hidden]) button').nth(i).click();
  const over=await p.evaluate(()=>[...document.querySelectorAll('.app-content:not([hidden]) *')].filter(e=>!e.closest('.hc-chips,.module-bar')&&e.getBoundingClientRect().right>document.documentElement.clientWidth+1).length);assert.equal(over,0,`${m} tab ${i} fits 320 px`);}
 assert.deepEqual(errors,[]);
 console.log('PASS: modules — switching, 37 dishes, device settings and shake timers, eggs, measures (szklanka cukru = 220 g = 22 dag), cooking times, timers across modules and reloads, alarm, English, 320 px, zero JS errors.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
