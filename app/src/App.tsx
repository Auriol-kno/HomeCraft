import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { initBrewing } from './brewing';
import home from './screens/home.html?raw';
import timer from './screens/timer.html?raw';
import visual from './screens/visual.html?raw';
import grinder from './screens/grinder.html?raw';
import anna from './screens/anna.html?raw';
import service from './screens/service.html?raw';
import steps from './screens/steps.html?raw';
import rating from './screens/rating.html?raw';
import history from './screens/history.html?raw';
import overlays from './screens/overlays.html?raw';
import { Backup, lastBackup } from './Backup';
import { readPreferences, savePreferences, type Preferences } from './preferences';
import { startLocalization, t } from './i18n';
import './modules/modules.css';
import { t as tm } from './modules/en';
import { FryerModule, fryerTabs, type FryerTab } from './modules/FryerModule';
import { HomeModule, homeTabs, usefulTabs, thermomixViews, type HomeTab, type ThermomixView } from './modules/HomeModule';
import { ShoppingModule, SHOP_ICON, shopTabs, type ShopTab } from './modules/ShoppingModule';
import { TeaScreen } from './modules/TeaScreen';
import { FermentationScreen } from './modules/FermentationScreen';
import { KitchenModule, kitchenTabs, type KitchenTab } from './modules/KitchenModule';
import { CoffeeGearScreen } from './modules/CoffeeGear';
import { ICONS, Icon as ModIcon, KitchenAlarm, Toaster } from './modules/ui';
import { useTimers } from './modules/timers';

type Screen = 'home' | 'timer' | 'equipment' | 'history' | 'rating' | 'tea' | 'fermentation';
type Equipment = 'grinder' | 'anna' | 'service' | 'gear';
// 'plan' (Kitchen OS) has no tab in the module bar: it opens from "Zaplanuj gotowanie" in Air Fryer and Dom.
type Module = 'coffee' | 'fryer' | 'dom' | 'shop' | 'plan';
// Hash routes: coffee keeps its own (#timer, #history ...); the new modules use #fryer/<tab> and #dom/<tab>.
function parseHash(): {module: Module; fryer: FryerTab; dom: HomeTab; thermomix: ThermomixView; shop: ShopTab; plan: KitchenTab} {
 const [a,b,c]=location.hash.slice(1).split('/');
 return {module:a==='fryer'?'fryer':a==='dom'?'dom':a==='shop'?'shop':a==='plan'?'plan':'coffee',plan:kitchenTabs.some(x=>x.id===b)?b as KitchenTab:'plan',fryer:fryerTabs.some(x=>x.id===b)?b as FryerTab:'dishes',dom:(['recipes','fridge','expenses'].includes(b)||homeTabs.some(x=>x.id===b))?b as HomeTab:'kitchen',thermomix:['recipes','timers','rules'].includes(c)?c as ThermomixView:'recipes',shop:shopTabs.some(x=>x.id===b)?b as ShopTab:'list'};
}
interface BrewStatus { running: boolean; method: string; seconds: number }
const titles: Record<Screen,string> = {home:'Twoja codzienna kawa',timer:'Czas na dobry napar',equipment:'Twój warsztat',history:'Ostatnie filiżanki',rating:'Jak smakuje?',tea:'Herbata i napary',fermentation:'Fermentacja domowa'};
const destinations: {id: Screen; label: string; icon: string}[] = [{id:'home',label:'Kawa',icon:'coffee'},{id:'timer',label:'Parzenie',icon:'timer'},{id:'equipment',label:'Sprzęt',icon:'sliders'},{id:'history',label:'Historia',icon:'history'},{id:'tea',label:'Herbata',icon:'tea'},{id:'fermentation',label:'Ferment',icon:'fermentation'}];
const paths: Record<string,string> = {fermentation:'M9 3h6M10 3v5l-5 10a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3L14 8V3M8 15h8M10 18h.01M14 12h.01',coffee:'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M8 2v3m4-3v3',timer:'M9 2h6m-3 0v3m7 0 2 2M12 9v5l3 2M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0',sliders:'M3 6h18M3 18h18M8 3v6m8 6v6',tea:'M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9Zm12 1h1.5a2.5 2.5 0 0 1 0 5H16M7 3c0 1.5 1.5 1.5 1.5 3M11 3c0 1.5 1.5 1.5 1.5 3M3 21h14',history:'M3 4v6h6M3 10a9 9 0 1 1 1 9m8-12v6l4 2',settings:'M9.94 4.58L10.32 1.94A10.2 10.2 0 0 1 13.68 1.94L14.06 4.58A7.7 7.7 0 0 1 15.79 5.30L17.92 3.70A10.2 10.2 0 0 1 20.30 6.08L18.70 8.21A7.7 7.7 0 0 1 19.42 9.94L22.06 10.32A10.2 10.2 0 0 1 22.06 13.68L19.42 14.06A7.7 7.7 0 0 1 18.70 15.79L20.30 17.92A10.2 10.2 0 0 1 17.92 20.30L15.79 18.70A7.7 7.7 0 0 1 14.06 19.42L13.68 22.06A10.2 10.2 0 0 1 10.32 22.06L9.94 19.42A7.7 7.7 0 0 1 8.21 18.70L6.08 20.30A10.2 10.2 0 0 1 3.70 17.92L5.30 15.79A7.7 7.7 0 0 1 4.58 14.06L1.94 13.68A10.2 10.2 0 0 1 1.94 10.32L4.58 9.94A7.7 7.7 0 0 1 5.30 8.21L3.70 6.08A10.2 10.2 0 0 1 6.08 3.70L8.21 5.30A7.7 7.7 0 0 1 9.94 4.58ZM15.2 12a3.2 3.2 0 1 1-6.4 0 3.2 3.2 0 0 1 6.4 0Z'};
function Icon({name}: {name:string}) {return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]}/></svg>}
// These fixed fragments belong to the retained brewing engine. Memoization keeps
// React navigation renders from replacing its controls, live SVG or event handlers.
const BrewingPanel = memo(function BrewingPanel({html}: {html:string}) {return <div className="engine-panel" dangerouslySetInnerHTML={{__html:html}}/>});
const clock=(s:number)=>s<60?`${Math.floor(s)} s`:`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;
const savedCount=():number=>{try{return (JSON.parse(localStorage.getItem('cremalab.iphone.v3')||'{}').hist||[]).length;}catch{return 0;}};
const ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const standalone=()=>matchMedia('(display-mode: standalone)').matches||(navigator as Navigator&{standalone?:boolean}).standalone===true;
const hintKey='cremalab.installHint.v1';
function initialScreen(): Screen {const hash=location.hash.slice(1);return hash in titles ? hash as Screen : 'home';}
export function App() {
 const kitchenTimers=useTimers();
 const [screen,setScreen]=useState<Screen>(initialScreen);
 const [module,setModule]=useState<Module>(()=>parseHash().module);
 const [fryerTab,setFryerTab]=useState<FryerTab>(()=>parseHash().fryer);
 const [homeTab,setHomeTab]=useState<HomeTab>(()=>parseHash().dom);
 const [thermomixView,setThermomixView]=useState<ThermomixView>(()=>parseHash().thermomix);
 const [shopTab,setShopTab]=useState<ShopTab>(()=>parseHash().shop);
 const [planTab,setPlanTab]=useState<KitchenTab>(()=>parseHash().plan);
 const [equipment,setEquipment]=useState<Equipment>('grinder');
 const [status,setStatus]=useState<BrewStatus>({running:false,method:'Espresso',seconds:0});
 const engine=useRef<ReturnType<typeof initBrewing> | null>(null);
 const main=useRef<HTMLElement>(null);
 const lastStatus=useRef('');
 const [dock,setDock]=useState(false);
 const [,setLanguage]=useState('');
 const [backupDue,setBackupDue]=useState(false);
 const [installHint,setInstallHint]=useState(()=>{try{return ios()&&!standalone()&&!localStorage.getItem(hintKey);}catch{return false;}});
 const navigate=useCallback((next:string)=>{if(!(next in titles))return;const s=next as Screen;setModule('coffee');setScreen(s);if(location.hash!==`#${s}`)location.hash=s;requestAnimationFrame(()=>{main.current?.scrollTo(0,0);document.getElementById('screen-title')?.focus({preventScroll:true});});},[]);
 useLayoutEffect(()=>{
  const notify=(value:BrewStatus)=>{const stamp=`${value.running}/${value.method}/${Math.floor(value.seconds)}`;if(stamp!==lastStatus.current){lastStatus.current=stamp;setStatus(value);}};
  engine.current=initBrewing(navigate,notify);
  const stopLocalization=startLocalization();
  const sync=()=>{const p=readPreferences();(document.getElementById('appTheme') as HTMLSelectElement).value=p.theme;(document.getElementById('appMode') as HTMLSelectElement).value=p.mode;(document.getElementById('appDensity') as HTMLSelectElement).value=p.density;(document.getElementById('appLanguage') as HTMLSelectElement).value=p.language;setLanguage(p.language);};
  const settings=document.getElementById('settingsDialog')!;
  const preferenceChange=(event:Event)=>{const el=event.target as HTMLSelectElement;const fields:Record<string,keyof Preferences>={appTheme:'theme',appMode:'mode',appDensity:'density',appLanguage:'language'};const field=fields[el.id];if(field)savePreferences({...readPreferences(),[field]:el.value});};
  sync();settings.addEventListener('change',preferenceChange);window.addEventListener('crema:preferences',sync);
  const change=()=>{const h=parseHash();setModule(h.module);if(h.module==='fryer')setFryerTab(h.fryer);else if(h.module==='dom'){setHomeTab(h.dom);setThermomixView(h.thermomix);}else if(h.module==='shop')setShopTab(h.shop);else if(h.module==='plan')setPlanTab(h.plan);else setScreen(initialScreen());};window.addEventListener('hashchange',change);
  return ()=>{window.removeEventListener('hashchange',change);settings.removeEventListener('change',preferenceChange);window.removeEventListener('crema:preferences',sync);stopLocalization();};
 },[navigate]);
 useEffect(()=>{
  // Keep Start/Stop and Reset reachable while the extraction preview pushes them off screen.
  const btn=document.getElementById('mainBtn'), preview=document.querySelector('.visual-details') as HTMLDetailsElement|null;
  if(!btn||!preview||!main.current)return;
  let visible=true;
  const update=()=>setDock(screen==='timer'&&preview.open&&!visible);
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;update();},{root:main.current,threshold:.6});
  io.observe(btn);preview.addEventListener('toggle',update);update();
  return ()=>{io.disconnect();preview.removeEventListener('toggle',update);};
 },[screen]);
 useEffect(()=>{
  const check=()=>{const n=savedCount(),last=lastBackup();setBackupDue(n>=3&&Date.now()-last>21*864e5);};
  check();window.addEventListener('crema:data',check);return ()=>window.removeEventListener('crema:data',check);
 },[]);
 const go=(m:Module,tab?:FryerTab|HomeTab|ShopTab|KitchenTab)=>{
  if(m==='fryer'){const x=(tab as FryerTab)||fryerTab;setFryerTab(x);setModule('fryer');location.hash=`fryer/${x}`;}
  else if(m==='dom'){const x=(tab as HomeTab)||homeTab;setHomeTab(x);if(x==='thermomix')setThermomixView('recipes');setModule('dom');location.hash=`dom/${x}`;}
  else if(m==='shop'){const x=(tab as ShopTab)||shopTab;setShopTab(x);setModule('shop');location.hash=`shop/${x}`;}
  else if(m==='plan'){const x=(tab as KitchenTab)||planTab;setPlanTab(x);setModule('plan');location.hash=`plan/${x}`;}
  else {setModule('coffee');location.hash=screen;}
 };
 // Keep the selected section tab visible in the scrollable row under the header.
 useEffect(()=>{document.querySelector('.section-nav [aria-current="page"]')?.scrollIntoView?.({inline:'nearest',block:'nearest'});},[module,screen,fryerTab,homeTab,thermomixView,shopTab,planTab]);
 const viewingTimers=(module==='fryer'&&fryerTab==='timers')||(module==='dom'&&(homeTab==='timers'||(homeTab==='thermomix'&&thermomixView==='timers')));
 const openBackup=()=>{navigate('history');requestAnimationFrame(()=>{const d=document.getElementById('backupCard') as HTMLDetailsElement|null;if(d){d.open=true;d.scrollIntoView({block:'center'});}});};
 const dismissHint=()=>{try{localStorage.setItem(hintKey,'1');}catch{}setInstallHint(false);};
 return <div className="app-shell" data-screen={module==='coffee'?screen:module} data-editorial-section={module==='dom'?homeTab:module==='coffee'?screen:module} data-editorial-view={module==='dom'&&homeTab==='thermomix'?thermomixView:module==='fryer'?fryerTab:module==='shop'?shopTab:module==='plan'?planTab:''} data-dock={dock&&module==='coffee'?'on':undefined}>
  {/* One bottom bar: the section menu sits under the header as a scrollable row of tabs. */}
  <div className="top-stack">
  <header className="app-header">
   <button className="brand-button" onClick={()=>go('dom','kitchen')} aria-label={tm('HomeCraft — Kuchnia')}><span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 40 40"><path d="M5 20 20 6l15 14h-3v12a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V20Z" fill="currentColor"/><path d="M27 11V7h4v8Z" fill="currentColor" opacity=".7"/><circle cx="20" cy="24" r="7" fill="var(--accent)"/><path d="M20 20v4.5l3 1.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg></span><span>Home<b>Craft</b></span></button>
   <span id="chip" hidden/>
   <button id="settingsBtn" className="settings-trigger" aria-label={t('Ustawienia')} aria-haspopup="dialog"><Icon name="settings"/></button>
  </header>
   {module==='coffee'&&<nav className="section-nav" aria-label={tm('Menu Napojów')}>{destinations.map(d=><button key={d.id} aria-label={d.id==='timer'&&status.running?`${t(d.label)} — ${t('Parzenie trwa')}`:(d.id==='home'?tm('Kawa'):t(d.label))} aria-current={screen===d.id?'page':undefined} onClick={()=>navigate(d.id)}><span className="nav-icon"><Icon name={d.icon}/>{d.id==='timer'&&status.running&&<i aria-hidden="true"/>}</span><span>{(d.id==='home'?tm('Kawa'):t(d.label))}</span></button>)}</nav>}
   {module==='fryer'&&<nav className="section-nav" aria-label={tm('Menu Air Fryer')}>{fryerTabs.map(x=><button key={x.id} aria-label={x.id==='timers'&&kitchenTimers.some(t=>!t.ack)?`${tm(x.label)} — ${tm('Aktywny timer')}`:tm(x.label)} aria-current={fryerTab===x.id?'page':undefined} onClick={()=>go('fryer',x.id)}><span className="nav-icon"><ModIcon d={x.icon}/>{x.id==='timers'&&kitchenTimers.some(t=>!t.ack)&&<i aria-hidden="true"/>}</span><span>{tm(x.label)}</span></button>)}</nav>}
   {module==='dom'&&homeTab==='thermomix'&&<nav className="section-nav" aria-label={tm('Menu Thermomix')}>{thermomixViews.map(x=><button key={x.id} aria-current={thermomixView===x.id?'page':undefined} onClick={()=>{setThermomixView(x.id);location.hash=`dom/thermomix/${x.id}`;}}><span className="nav-icon"><ModIcon d={x.icon}/></span><span>{tm(x.label)}</span></button>)}</nav>}
   {module==='dom'&&!['thermomix','recipes','kitchen','fridge','expenses'].includes(homeTab)&&<nav className="section-nav" aria-label={tm('Użyteczne')}>{usefulTabs.map(x=><button key={x.id} aria-label={x.id==='timers'&&kitchenTimers.some(t=>!t.ack)?`${tm(x.label)} — ${tm('Aktywny timer')}`:x.id==='cook'?tm('Czasy'):tm(x.label)} aria-current={homeTab===x.id?'page':undefined} onClick={()=>go('dom',x.id)}><span className="nav-icon"><ModIcon d={x.icon}/>{x.id==='timers'&&kitchenTimers.some(t=>!t.ack)&&<i aria-hidden="true"/>}</span><span>{x.id==='cook'?tm('Czasy'):tm(x.label)}</span></button>)}</nav>}
   {module==='shop'&&<nav className="section-nav" aria-label={tm('Nawigacja Zakupy')}>{shopTabs.map(x=><button key={x.id} aria-current={shopTab===x.id?'page':undefined} onClick={()=>go('shop',x.id)}><span className="nav-icon"><ModIcon d={x.icon}/></span><span>{tm(x.label)}</span></button>)}</nav>}
   {module==='plan'&&<nav className="section-nav" aria-label={tm('Nawigacja Kitchen OS')}>{kitchenTabs.map(x=><button key={x.id} aria-current={planTab===x.id?'page':undefined} onClick={()=>go('plan',x.id)}><span className="nav-icon"><ModIcon d={x.icon}/></span><span>{tm(x.label)}</span></button>)}</nav>}
  </div>
  <main ref={main} hidden={module!=='coffee'} className="app-content" id="app-content">
   <div className="screen-heading">{(screen==='home'||screen==='timer')&&<p className="overline">{screen==='home'?t('ZACZNIJ OD FILIŻANKI'):t('PARZENIE')}</p>}<h1 id="screen-title" tabIndex={-1}>{t(screen==='timer'?status.method:titles[screen])}</h1>{status.running&&screen!=='timer'&&<button className="live-pill" onClick={()=>navigate('timer')}><span/>{t('Parzenie trwa')} · {clock(status.seconds)} →</button>}</div>
   <section hidden={screen!=='home'} aria-label={t('Wybór kawy')} className="screen">
    {installHint&&<div className="hint-card" role="note"><p><b>{t('Dodaj HomeCraft do ekranu początkowego.')}</b> {t('Udostępnij → „Do ekranu początkowego”. Aplikacja otworzy się na pełnym ekranie, a Safari nie wyczyści Twojej historii.')}</p><button onClick={dismissHint} aria-label={t('Ukryj podpowiedź')}>×</button></div>}
    {backupDue&&<div className="hint-card warn" role="note"><p><b>{t('Zrób kopię danych.')}</b> {t('Historia i kalibracja są tylko na tym telefonie.')}</p><button className="hint-action" onClick={openBackup}>{t('Kopia →')}</button></div>}
    <BrewingPanel html={home}/>
    <div className="home-note"><Icon name="coffee"/><p>{t('Twój przepis, Twoje tempo.')}<br/><span>{t('Ustawienia i historia zostają na tym urządzeniu.')}</span></p></div>
   </section>
   <section hidden={screen!=='timer'} aria-label={t('Parzenie')} className="screen">
    <details className="details-card visual-details"><summary>{t('Podgląd ekstrakcji')} <span>+</span></summary><p className="subtle">{t('Wizualizacja jest symulacją, nie pomiarem z urządzenia.')}</p><BrewingPanel html={visual}/></details>
    <BrewingPanel html={timer}/>
    <button className="wide-link" onClick={()=>engine.current?.finish()}>{t('Zakończ i oceń kawę')} <span>→</span></button>
    <details className="details-card"><summary>{t('Etapy parzenia')} <span>+</span></summary><BrewingPanel html={steps}/></details>
   </section>
   <section hidden={screen!=='equipment'} aria-label={t('Sprzęt i parametry')} className="screen">
    <div className="segment" role="group" aria-label={t('Wybór sprzętu')}>{([{id:'grinder',label:'Młynek'},{id:'anna',label:'Lelit Anna'},{id:'service',label:'Serwis'},{id:'gear',label:'Mój sprzęt'}] as const).map(e=><button key={e.id} aria-pressed={equipment===e.id} onClick={()=>setEquipment(e.id)}>{t(e.label)}</button>)}</div>
    <div hidden={equipment!=='grinder'}><BrewingPanel html={grinder}/></div>
    <div hidden={equipment!=='anna'}><BrewingPanel html={anna}/>{status.method!=='Espresso'&&<p className="notice">{t('Lelit Anna jest dostępna dla espresso. Wybierz espresso na ekranie Kawa.')}</p>}</div>
    <div hidden={equipment!=='service'}><BrewingPanel html={service}/></div>
    {equipment==='gear'&&<CoffeeGearScreen/>}
    <button className="wide-link" onClick={()=>navigate('timer')}>{t('Wróć do parzenia')} <span>→</span></button>
   </section>
   <section hidden={screen!=='history'} aria-label={t('Historia kaw')} className="screen">{backupDue&&<p className="notice">{t('Ostatnia kopia danych była dawno albo nigdy. Zapisz ją poniżej.')}</p>}<BrewingPanel html={history}/><Backup/></section>
   <section hidden={screen!=='tea'} aria-label={t('Herbata')} className="screen"><TeaScreen onTimer={()=>go('dom','timers')}/></section>
   <section hidden={screen!=='fermentation'} aria-label={tm('Fermentacja')} className="screen"><FermentationScreen/></section>
   <section hidden={screen!=='rating'} aria-label={t('Ocena kawy')} className="screen"><BrewingPanel html={rating}/><button className="wide-link" onClick={()=>navigate('history')}>{t('Zobacz historię')} <span>→</span></button><button className="wide-link" onClick={()=>navigate('home')}>{t('Przygotuj kolejną kawę')} <span>→</span></button></section>
  </main>
  {dock&&module==='coffee'&&<div className="control-dock" role="group" aria-label={t('Sterowanie parzeniem')}>
   <div className="dock-time"><b>{clock(status.seconds)}</b><span>{status.running?t('parzenie trwa'):status.seconds>0?t('pauza'):t('gotowy')}</span></div>
   <button className="dock-main" onClick={()=>document.getElementById('mainBtn')?.click()}>{status.running?t('Stop'):status.seconds>0?t('Wznów'):t('Start')}</button>
   <button className="dock-reset" onClick={()=>document.getElementById('resetBtn')?.click()}>{t('Zeruj')}</button>
  </div>}
  <FryerModule active={module==='fryer'} tab={fryerTab} onTab={x=>go('fryer',x)} onPlan={()=>go('plan','plan')}/>
  <HomeModule active={module==='dom'} tab={homeTab} thermomixView={thermomixView} onThermomixView={x=>{setThermomixView(x);location.hash=`dom/thermomix/${x}`;}} onTab={x=>go('dom',x)} onPlan={()=>go('plan','plan')} onShop={()=>go('shop','list')}/>
  <KitchenModule active={module==='plan'} tab={planTab} onTab={x=>go('plan',x)}/>
  <ShoppingModule active={module==='shop'} tab={shopTab} onTab={x=>go('shop',x)}/>
  <div className="nav-stack">
   <nav className="bottom-nav primary-nav" aria-label={tm('Nawigacja główna')}>
    <button aria-label={tm('Kuchnia','module')} aria-current={module==='dom'&&['kitchen','recipes','fridge','expenses'].includes(homeTab)?'page':undefined} onClick={()=>go('dom','kitchen')}><span className="nav-icon"><ModIcon d={ICONS.dishes}/></span><span>{tm('Kuchnia','module')}</span></button>
    <button aria-label={status.running?`${tm('Napoje')} — ${t('Parzenie trwa')}`:tm('Napoje')} aria-current={module==='coffee'?'page':undefined} onClick={()=>go('coffee')}><span className="nav-icon"><ModIcon d={ICONS.coffee}/>{status.running&&<i aria-hidden="true"/>}</span><span>{tm('Napoje')}</span></button>
    <button aria-label="Air Fryer" aria-current={module==='fryer'?'page':undefined} onClick={()=>go('fryer','dishes')}><span className="nav-icon"><ModIcon d={ICONS.fryer}/></span><span>Fryer</span></button>
    <button aria-label="Thermomix TM6" aria-current={module==='dom'&&homeTab==='thermomix'?'page':undefined} onClick={()=>go('dom','thermomix')}><span className="nav-icon"><ModIcon d={ICONS.mixer}/></span><span>TM6</span></button>
    <button aria-label={kitchenTimers.some(t=>!t.ack)?`${tm('Użyteczne')} — ${tm('Aktywny timer')}`:tm('Użyteczne')} aria-current={module==='dom'&&!['kitchen','recipes','thermomix','fridge','expenses'].includes(homeTab)?'page':undefined} onClick={()=>go('dom','timers')}><span className="nav-icon"><ModIcon d={ICONS.timer}/>{kitchenTimers.some(t=>!t.ack)&&<i aria-hidden="true"/>}</span><span>{tm('Użyteczne')}</span></button>
    <button aria-label={tm("Zakupy")} aria-current={module==="shop"?"page":undefined} onClick={()=>go("shop","list")}><span className="nav-icon"><ModIcon d={SHOP_ICON}/></span><span>{tm("Zakupy")}</span></button>
   </nav>
  </div>
  <BrewingPanel html={overlays}/>
  <KitchenAlarm/><Toaster/>
 </div>
}
