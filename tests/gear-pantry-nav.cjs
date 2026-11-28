// Browser test: one bottom menu with section tabs, lazily loaded cookbook, "Mój sprzęt"
// (10 grinders: 5 electric + 5 hand, 5 portafilter machines, service schedule, workshop tabs follow the choice) and product photos in "Moja lodówka".
const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const base=process.env.BOOK_BASE||'/HomeCraft/';
const url=`http://127.0.0.1:4179${base}`;
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4179',...(base==='/'?['--base','/']:[])],{stdio:'pipe'});
// A small PNG (600 × 400 gradient) as the product photo.
function png(file){const w=600,h=400,rows=[];for(let y=0;y<h;y++){const r=Buffer.alloc(1+w*3);for(let x=0;x<w;x++){r[1+x*3]=x*255/w;r[2+x*3]=y*180/h;r[3+x*3]=90;}rows.push(r);}
 const crc=b=>{let c=~0;for(const v of b){c^=v;for(let k=0;k<8;k++)c=c&1?(c>>>1)^0xedb88320:c>>>1;}return ~c>>>0;};
 const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c]);};
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w,0);ihdr.writeUInt32BE(h,4);ihdr[8]=8;ihdr[9]=2;
 fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0))]));}
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview did not start');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const errors=[],photo=path.join(os.tmpdir(),'homecraft-photo.png');png(photo);
 const ctx=await browser.newContext({viewport:{width:390,height:844}});
 const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
 const overflow=()=>p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('main:not([hidden])')].some(m=>m.scrollWidth>m.clientWidth+1));

 // 1. Bottom: the section menu sits right above the main menu (six items), in a different tint.
 await p.goto(url);await p.waitForSelector('.primary-nav');
 assert.equal(await p.locator('.nav-stack .primary-nav').count(),1,'main menu at the bottom');
 assert.equal(await p.locator('.primary-nav button').count(),6);
 assert.equal(await p.locator('.nav-stack .section-nav').count(),1,'section tabs above the main menu');
 assert.equal(await p.locator('.top-stack .section-nav').count(),0,'nothing under the header');
 const tint=await p.evaluate(()=>[getComputedStyle(document.querySelector('.section-nav')).backgroundColor,getComputedStyle(document.querySelector('.nav-stack')).backgroundColor,getComputedStyle(document.querySelector('.primary-nav')).backgroundColor]);
 assert(tint[0]!==tint[1]&&tint[0]!==tint[2],'section menu has its own tint: '+tint.join(' / '));
 for(const [main,section] of [['Napoje','Menu Napojów'],['Air Fryer','Menu Air Fryer'],['Thermomix TM6','Menu Thermomix'],['Użyteczne','Użyteczne'],['Zakupy','Nawigacja Zakupy']]){
  await p.getByRole('navigation',{name:'Nawigacja główna'}).getByRole('button',{name:main}).first().click();
  const nav=p.getByRole('navigation',{name:section});assert(await nav.isVisible(),section+' visible');
  const box=await nav.boundingBox(),bottom=await p.locator('.primary-nav').boundingBox();assert(Math.abs(box.y+box.height-bottom.y)<=2,section+' sits right above the main menu');
  for(const b of await nav.getByRole('button').all()){const h=(await b.boundingBox()).height;assert(h>=44,`${section} tab ≥ 44 px`);}
 }
 assert(!(await overflow()),'no horizontal scroll');

 // 2. The 600 recipes arrive as a separate file and the book opens with all of them.
 await p.getByRole('navigation',{name:'Nawigacja główna'}).getByRole('button',{name:/Kuchnia/}).click();
 await p.waitForFunction(()=>/600/.test(document.querySelector('.hc-book-intro')?.textContent||''),null,{timeout:15000}).catch(async()=>{await p.goto(url+'#dom/recipes');await p.waitForFunction(()=>/600/.test(document.querySelector('.hc-book-intro')?.textContent||''),null,{timeout:15000});});
 const scripts=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/\.js$/.test(n)));
 assert(scripts.length>=2,'cookbook is its own script file: '+scripts.join(', '));

 // 3. Mój sprzęt: pick a grinder and a machine, see specs and service, mark a task done, reload.
 await p.goto(url+'#equipment');await p.getByRole('button',{name:'Mój sprzęt'}).click();
 const gp=p.locator('.hc-gear-pick').filter({hasText:'Młynek'});
 assert.equal(await gp.getByRole('button').count(),10);
 assert.equal(await gp.locator('.hc-gear-group').filter({hasText:'Elektryczne'}).getByRole('button').count(),5);
 assert.equal(await gp.locator('.hc-gear-group').filter({hasText:'Ręczne'}).getByRole('button').count(),5);
 assert.equal(await p.locator('.hc-gear-pick').filter({hasText:'Ekspres kolbowy'}).getByRole('button').count(),5);
 const pick=p.locator('.hc-gear-pick');await pick.getByRole('button',{name:/Niche Zero/}).click();await pick.getByRole('button',{name:/Rancilio Silvia/}).click();
 const machine=p.locator('.hc-gear-detail').filter({hasText:'Rancilio Silvia V6'});
 assert.match(await machine.innerText(),/0,3 l[\s\S]*58 mm[\s\S]*Płukanie wsteczne z detergentem[\s\S]*Odkamienianie/);
 const task=machine.locator('.hc-gear-task').filter({hasText:'Płukanie wsteczne z detergentem'});
 await task.getByRole('button',{name:'Zrobione dziś'}).click();
 assert.match(await task.innerText(),/za 21 dni/);
 await task.getByRole('combobox').selectOption('14');assert.match(await task.innerText(),/za 14 dni/);
 assert(!(await overflow()),'gear screen fits');
 await p.reload();await p.getByRole('button',{name:'Mój sprzęt'}).click();
 assert.equal(await p.locator('.hc-gear-pick').getByRole('button',{name:/Rancilio Silvia/}).getAttribute('aria-pressed'),'true','choice kept after reload');
 assert.match(await p.locator('.hc-gear-task').filter({hasText:'Płukanie wsteczne z detergentem'}).first().innerText(),/za 14 dni/);
 // Twój warsztat follows the choice: tab labels, chosen grinder/machine cards, legacy panels folded but kept.
 const seg=p.getByRole('group',{name:'Wybór sprzętu'});
 await seg.getByRole('button',{name:'Niche Zero'}).click();
 assert.match(await p.locator('.hc-gear-detail').first().innerText(),/Niche Zero[\s\S]*63 mm/);
 assert.equal(await p.locator('#brewParameters').count(),1,'legacy grinder panel stays mounted');
 await seg.getByRole('button',{name:'Rancilio Silvia'}).click();
 assert.match(await p.locator('.hc-gear-detail').first().innerText(),/Rancilio Silvia V6/);
 await seg.getByRole('button',{name:'Serwis'}).click();
 assert.equal(await p.locator('.hc-gear-detail').count(),2,'service of machine and grinder');
 await seg.getByRole('button',{name:'Mój sprzęt'}).click();
 // Corrupted saved data does not break the screen.
 await p.evaluate(()=>localStorage.setItem('homecraft.coffeegear.v1','{"v":1,"grinder":"x","machine":5,"done":{"a":"b"}}'));await p.reload();
 await p.getByRole('button',{name:'Mój sprzęt'}).click();assert.equal(await p.locator('.hc-gear-detail').count(),0);
 assert.equal(await seg.getByRole('button').first().innerText(),'Młynek','default labels without a choice');

 // 4. Moja lodówka: a product photo becomes its round icon, survives reload, is reused, can be removed.
 await p.goto(url+'#dom/fridge');await p.waitForSelector('.hc-house-form');
 await p.locator('.hc-photo-new input[type=file]').setInputFiles(photo);
 await p.getByLabel('Nazwa produktu').fill('Masło');await p.getByRole('button',{name:'Dodaj do zapasów'}).click();
 const icon=p.locator('.hc-stock .hc-photo-btn img').first();await icon.waitFor({timeout:5000});
 assert.deepEqual(await icon.evaluate(i=>new Promise(r=>i.complete?r([i.naturalWidth,i.naturalHeight]):i.onload=()=>r([i.naturalWidth,i.naturalHeight]))),[256,256],'square 256 px icon');
 const box=await p.locator('.hc-stock .hc-photo-btn').first().boundingBox();assert(box.width>=44&&Math.abs(box.width-box.height)<1,'round button ≥ 44 px');
 await p.reload();await p.locator('.hc-stock .hc-photo-btn img').first().waitFor({timeout:5000});
 await p.getByLabel('Nazwa produktu').fill(' masło ');await p.getByRole('button',{name:'Dodaj do zapasów'}).click();
 await p.waitForFunction(()=>document.querySelectorAll('.hc-stock .hc-photo-btn img').length===2);
 await p.locator('.hc-stock .hc-photo-btn').first().click();await p.getByRole('button',{name:'Usuń zdjęcie'}).click();
 await p.waitForFunction(()=>document.querySelectorAll('.hc-stock .hc-photo-btn img').length===0);
 assert.match(await p.locator('.hc-stock .hc-photo-btn').first().innerText(),/M/,'initial letter without a photo');
 assert(!(await overflow()),'pantry fits');
 await ctx.close();

 // 4b. A saved cooking session for a cookbook recipe survives the lazy load (not reset to the sample dinner).
 {const c2=await browser.newContext({viewport:{width:390,height:844}});const k=await c2.newPage();k.on('pageerror',e=>errors.push(e.message));
  await k.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('homecraft.kitchen.v1',JSON.stringify({v:1,recipe:'book-010',serveAt:Date.now()+3*3600e3,cooking:false,started:{},done:{},timers:{},mise:[]}));}});
  await k.goto(url+'#plan/plan');await k.waitForFunction(()=>!document.querySelector('.hc-kitchen[aria-busy="true"]')&&!!document.querySelector('.hc-k-recipe'),null,{timeout:15000});
  assert.equal(await k.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.kitchen.v1')).recipe),'book-010','saved session kept');
  assert.doesNotMatch(await k.locator('.hc-k-recipe').innerText(),/Kurczak w panko, frytki i sałatka/,'shows the saved cookbook recipe');
  await c2.close();}
 // 4c. The recipes cannot be loaded (offline): the saved session is kept, writes are blocked, retry works.
 {const c3=await browser.newContext({viewport:{width:390,height:844}});let block=true;
  await c3.route(/cookbook-all[^/]*\.js/,r=>block?r.abort():r.continue());
  const k=await c3.newPage();k.on('pageerror',e=>errors.push(e.message));
  await k.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('homecraft.kitchen.v1',JSON.stringify({v:1,recipe:'book-010',serveAt:Date.now()+3*3600e3,cooking:true,started:{},done:{},timers:{},mise:[]}));}});
  await k.goto(url+'#plan/plan');await k.getByRole('alert').filter({hasText:'Twoje gotowanie jest bezpieczne'}).waitFor({timeout:15000});
  assert.equal(await k.evaluate(()=>JSON.parse(localStorage.getItem('homecraft.kitchen.v1')).recipe),'book-010','not overwritten');
  assert(await k.getByRole('button',{name:'Spróbuj ponownie'}).isVisible(),'retry offered');
  // The button reloads the app (a failed import stays failed until reload); do the same here.
  block=false;await k.reload();
  await k.waitForFunction(()=>!!document.querySelector('.hc-k-recipe'),null,{timeout:15000});
  assert.doesNotMatch(await k.locator('.hc-k-recipe').innerText(),/Kurczak w panko, frytki i sałatka/);
  await c3.close();}
 // 4c. Settings → user profile: save all settings, change them, load the profile back (history kept).
 {const c4=await browser.newContext({viewport:{width:390,height:844}});const u=await c4.newPage();u.on('pageerror',e=>errors.push(e.message));u.on('dialog',d=>d.accept());
  await u.goto(url+'#equipment');await u.evaluate(()=>{const s=JSON.parse(localStorage.getItem('cremalab.iphone.v3')||'{}');s.hist=[{ts:1}];localStorage.setItem('cremalab.iphone.v3',JSON.stringify(s));});
  await u.locator('#settingsBtn').click();await u.locator('#appTheme').selectOption('line');
  await u.getByLabel('Nazwa nowego profilu').fill('Weekend');await u.locator('.profile-settings').getByRole('button',{name:'Zapisz',exact:true}).click();
  assert.match(await u.locator('.profile-settings').innerText(),/Aktywny profil: Weekend/);
  await u.locator('#appTheme').selectOption('editorial');assert.equal(await u.evaluate(()=>document.documentElement.dataset.theme),'editorial');
  await Promise.all([u.waitForEvent('load'),u.getByRole('button',{name:'Wczytaj profil Weekend'}).click()]);
  await u.waitForSelector('.primary-nav');assert.equal(await u.evaluate(()=>document.documentElement.dataset.theme),'line','profile settings applied');
  assert.equal(await u.evaluate(()=>JSON.parse(localStorage.getItem('cremalab.iphone.v3')).hist.length),1,'history kept');
  await c4.close();}
 // 5. 320 px: tabs, gear and pantry without horizontal scrolling.
 const small=await browser.newContext({viewport:{width:320,height:640}});const q=await small.newPage();q.on('pageerror',e=>errors.push(e.message));
 for(const h of ['#equipment','#dom/fridge','#fryer/dishes','#plan/plan']){await q.goto(url+h);await q.waitForTimeout(300);
  if(h==='#equipment'){await q.getByRole('button',{name:'Mój sprzęt'}).click();await q.getByRole('button',{name:/J-Ultra/}).click();}
  assert(!(await q.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1||[...document.querySelectorAll('main:not([hidden])')].some(m=>m.scrollWidth>m.clientWidth+1))),'320 px '+h);}
 await small.close();
 fs.rmSync(photo,{force:true});
 assert.deepEqual(errors,[]);
 console.log(`PASS: section menu above the main menu, lazy 600-recipe cookbook, Mój sprzęt (10 grinders, 5 machines, workshop tabs, service schedule, reload, corrupted data), pantry photos (256 px round icon, reload, reuse by name, remove), user profiles, 320/390 px. Base ${base}`);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
