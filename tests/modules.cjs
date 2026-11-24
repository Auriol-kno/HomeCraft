const {chromium}=require('@playwright/test');
const {spawn}=require('node:child_process');
const assert=require('node:assert/strict');
const url='http://127.0.0.1:4175/HomeCraft/';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','4175'],{stdio:'pipe'});
let browser;
(async()=>{
 for(let i=0;i<60;i++){try{if((await fetch(url)).ok)break;}catch{}await new Promise(r=>setTimeout(r,250));if(i===59)throw Error('Preview did not start');}
 browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});
 const p=await (await browser.newContext({viewport:{width:390,height:844},colorScheme:'light'})).newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await p.goto(url);await p.locator('.primary-nav').waitFor();
 const global=p.getByRole('navigation',{name:'Nawigacja główna'});
 assert.deepEqual(await global.getByRole('button').allInnerTexts(),['Książka','Kawa','Fryer','TM6','Użyteczne']);
 const persistent=async()=>{assert(await global.isVisible());assert.equal(await global.getByRole('button').count(),5);};
 await global.getByRole('button',{name:'Książka kucharska'}).click();await p.locator('.hc-book').waitFor();await persistent();
 assert.match(await p.getByRole('status').filter({hasText:'Wyniki'}).innerText(),/350 \/ 350/);
 await global.getByRole('button',{name:'Air Fryer'}).click();await p.locator('.hc-dish').first().waitFor();await persistent();
 assert.deepEqual(await p.getByRole('navigation',{name:'Menu Air Fryer'}).getByRole('button').allInnerTexts(),['Dania','Timery','Zasady używania']);
 await p.getByRole('navigation',{name:'Menu Air Fryer'}).getByRole('button',{name:'Timery'}).click();await p.locator('.hc-dial').waitFor();
 await global.getByRole('button',{name:'Thermomix TM6'}).click();await persistent();
 assert.deepEqual(await p.getByRole('navigation',{name:'Menu Thermomix'}).getByRole('button').allInnerTexts(),['Przepisy','Timery','Zasady używania']);
 await global.getByRole('button',{name:'Użyteczne'}).click();await persistent();
 assert.deepEqual(await p.getByRole('navigation',{name:'Użyteczne'}).getByRole('button').allInnerTexts(),['Timery','Jajka','Czasy','Miarki']);
 await p.getByRole('navigation',{name:'Użyteczne'}).getByRole('button',{name:'Jajka'}).click();assert(await p.getByRole('heading',{name:'Idealne jajko'}).isVisible());
 await global.getByRole('button',{name:'Kawa'}).click();await persistent();
 assert.deepEqual(await p.getByRole('navigation',{name:'Menu Kawy'}).getByRole('button').allInnerTexts(),['Rodzaj parzenia','Parzenie','Sprzęt','Historia','Herbata']);
 await p.getByRole('navigation',{name:'Menu Kawy'}).getByRole('button',{name:'Herbata'}).click();assert((await p.locator('.hc-tea').count())>=20);
 await p.getByRole('navigation',{name:'Nawigacja główna'}).getByRole('button',{name:'Zakupy'}).click();await persistent();assert(await p.getByLabel('Nowy produkt').isVisible());
 assert.deepEqual(await p.getByRole('navigation',{name:'Nawigacja Zakupy'}).getByRole('button').allInnerTexts(),['Lista','Produkty']);
 for(const width of [320,390,1280]){await p.setViewportSize({width,height:844});for(const target of ['Książka kucharska','Air Fryer','Thermomix TM6','Użyteczne','Kawa']){await global.getByRole('button',{name:target}).click();const issue=await p.evaluate(()=>({doc:document.documentElement.scrollWidth>innerWidth+1,main:[...document.querySelectorAll('main:not([hidden])')].some(m=>m.scrollWidth>m.clientWidth+1),small:[...document.querySelectorAll('.primary-nav button,.context-nav button')].some(b=>b.getBoundingClientRect().height<44||b.getBoundingClientRect().width<44)}));assert.deepEqual(issue,{doc:false,main:false,small:false},`${width} ${target}`);}}
 for(const [theme,mode] of [['pastel','light'],['palarnia','dark'],['bar','light'],['soft','dark'],['line','light']]){await p.evaluate(([theme,mode])=>{document.documentElement.dataset.theme=theme;document.documentElement.dataset.mode=mode;},[theme,mode]);assert.match(await global.locator('[aria-current=page]').evaluate(e=>getComputedStyle(e).boxShadow),/inset/,`${theme}/${mode}`);}
 assert.deepEqual(errors,[]);console.log('PASS: persistent global menu, contextual Coffee/Air Fryer/TM6/Useful/Shopping menus, 350 cookbook entries, 320/390/desktop and themes.');
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(async()=>{await browser?.close();server.kill();});
