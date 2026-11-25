import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from './en';
import { cToF, convert, EGG_BOIL, EGG_OTHER, EGG_SIZES, EGG_START, EGG_STEAM, EGG_TIPS, eggSeconds, fToC, FOODS, FOOD_CATEGORIES, INGREDIENTS, kitchenGrams, METHODS, ML, num, OVEN_C, OVEN_NOTES, UNITS, type EggMethod, type MethodId, type Unit } from './home-data';
import { norm, SAFE_TEMPS } from './fryer-data';
import { setPreset } from './timers';
import { settingText, TM_CATEGORIES, TM_RECIPES, TM_RULES } from './thermomix-data';
import { ICONS, Icon } from './ui';
import { TimersScreen } from './TimersScreen';
import { Cookbook } from './Cookbook';
import { PlanCta } from './KitchenModule';

export type HomeTab = 'kitchen' | 'eggs' | 'cook' | 'measures' | 'timers' | 'thermomix' | 'recipes';
export const homeTabs: { id: HomeTab; label: string; icon: string }[] = [
  { id: 'timers', label: 'Timery', icon: ICONS.timer }, { id: 'eggs', label: 'Jajka', icon: ICONS.egg },
  { id: 'cook', label: 'Gotowanie', icon: ICONS.pot }, { id: 'thermomix', label: 'Thermomix', icon: ICONS.mixer }, { id: 'measures', label: 'Miarki', icon: ICONS.scale },
];
export const usefulTabs = homeTabs.filter(x=>x.id!=='thermomix');
const kitchenCards = [
  {id:'recipes',title:'Książka kucharska',note:'600 przepisów, diety, ulubione i kcal',icon:ICONS.dishes},
  {id:'fridge',title:'Moja lodówka',note:'Funkcja w przygotowaniu',icon:ICONS.egg},
  {id:'smart',title:'Szukaj według składników',note:'Wyszukiwanie przepisów i filtrowanie urządzeń',icon:ICONS.pot},
  {id:'shopping',title:'Lista zakupów',note:'Produkty pogrupowane według działów sklepu',icon:ICONS.scale},
  {id:'plan',title:'Zaplanuj gotowanie',note:'Planowanie jednego dania krok po kroku',icon:ICONS.timer},
  {id:'expenses',title:'Kontrola wydatków',note:'Koszt posiłków — funkcja w przygotowaniu',icon:ICONS.modes},
] as const;
function KitchenLanding({onTab,onPlan,onShop}:{onTab:(tab:HomeTab)=>void;onPlan?:()=>void;onShop?:()=>void}){
 const open=(id:typeof kitchenCards[number]['id'])=>{if(id==='recipes')onTab('recipes');else if(id==='smart'){onTab('recipes');requestAnimationFrame(()=>requestAnimationFrame(()=>document.querySelector<HTMLInputElement>('.hc-book input[type="search"]')?.focus()));}else if(id==='shopping')onShop?.();else if(id==='plan')onPlan?.();};
 return <section className="screen hc-kitchen-home" aria-label={t('Kuchnia','module')}>
  <div className="hc-kitchen-intro"><p className="hc-tag">HOMECRAFT</p><h2>{t('Co dziś ugotujemy?')}</h2><p>{t('Od produktów, które masz, do gotowego posiłku.')}</p></div>
  <div className="hc-kitchen-menu">{kitchenCards.map(card=><button key={card.id} type="button" onClick={()=>open(card.id)} disabled={card.id==='fridge'||card.id==='expenses'}><span className="hc-kitchen-menu-icon"><Icon d={card.icon}/></span><span><b>{t(card.title)}</b><small>{t(card.note)}</small></span><span aria-hidden="true">→</span></button>)}</div>
 </section>;
}
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function Pills<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; n: string }[]; onChange: (v: T) => void }) {
  return <div className="hc-field"><span>{t(label)}</span><div className="hc-seg" role="group" aria-label={t(label)}>{options.map(o => <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{t(o.n)}</button>)}</div></div>;
}

function Eggs({ onTimer }: { onTimer: () => void }) {
  const [method, setMethod] = useState<EggMethod>('boil'), [size, setSize] = useState('M'), [start, setStart] = useState('fridge');
  const styles = method === 'boil' ? EGG_BOIL : EGG_STEAM;
  const go = (name: string, sec: number, meta: string, act = 'Wyjmij i zalej zimną wodą') => { setPreset({ sec, name, meta, act }); onTimer(); };
  return <section className="screen" aria-label={t('Jajka')}>
    <div className="hc-card hc-form">
      <Pills label="Sposób" value={method} onChange={setMethod} options={[{ id: 'boil', n: 'We wrzątku' }, { id: 'steam', n: 'Na parze' }]} />
      <Pills label="Wielkość jajka" value={size} onChange={setSize} options={EGG_SIZES.map(s => ({ id: s.id, n: s.n }))} />
      <Pills label="Temperatura jajka" value={start} onChange={setStart} options={EGG_START.map(s => ({ id: s.id, n: s.n }))} />
    </div>
    {styles.map(s => { const sec = eggSeconds(method, s.id, size, start); return <div key={s.id} className="hc-card hc-egg">
      <div><h3 className="hc-h3">{t(s.n)}</h3><p className="subtle">{t(s.note)}</p></div>
      <button className="hc-time" onClick={() => go(`${t(s.n)} (${size})`, sec, method === 'boil' ? t('od wrzenia') : t('na parze'))} aria-label={`${t('Start timera')} ${t(s.n)} ${mmss(sec)}`}><b>{mmss(sec)}</b><span>{t('Start')}</span></button>
    </div>; })}
    <p className="subtle">{method === 'boil' ? t('Czas liczysz od chwili, gdy woda wrze, a jajka wkładasz łyżką. Po wyjęciu zalej zimną wodą.') : t('Czas liczysz od pojawienia się pary, garnek pod przykryciem. Po wyjęciu zalej zimną wodą.')} {t('Wartości orientacyjne dla jajka M z lodówki; wielkość i temperaturę korygują czas.')}</p>
    <details className="details-card"><summary>{t('Inne jajka')} <span>+</span></summary>
      <div className="hc-list">{EGG_OTHER.map(e => <div key={e.n} className="hc-item"><div><b>{t(e.n)}</b><p className="subtle">{t(e.how)}</p></div><button className="hc-chip-btn" onClick={() => go(e.n, e.sec, e.time, 'Sprawdź jajko')}>{e.time}</button></div>)}</div>
    </details>
    <details className="details-card"><summary>{t('Świeżość i obieranie')} <span>+</span></summary>
      <div className="hc-list">{EGG_TIPS.map(([a, b]) => <div key={a} className="hc-item"><div><b>{t(a)}</b><p className="subtle">{t(b)}</p></div></div>)}</div>
    </details>
  </section>;
}

function Cooking({ onTimer }: { onTimer: () => void }) {
  const [method, setMethod] = useState<MethodId | 'all'>('all'), [cat, setCat] = useState('Wszystkie'), [q, setQ] = useState('');
  const nq = norm(q.trim());
  const list = FOODS.filter(f => (cat === 'Wszystkie' || f.c === cat) && (method === 'all' || f.ways[method]) && (!nq || norm(f.n + ' ' + f.c).includes(nq)));
  const hint = METHODS.find(m => m.id === method)?.hint;
  return <section className="screen" aria-label={t('Gotowanie')}>
    <input className="hc-input" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Szukaj: ryż, brokuł, kasza…')} aria-label={t('Szukaj produktu')} autoComplete="off" />
    <div className="hc-seg hc-wrap" role="group" aria-label={t('Metoda')}>
      <button aria-pressed={method === 'all'} onClick={() => setMethod('all')}>{t('Wszystkie')}</button>
      {METHODS.map(m => <button key={m.id} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>{t(m.n)}</button>)}
    </div>
    <div className="hc-chips" role="group" aria-label={t('Kategorie')}>{FOOD_CATEGORIES.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{t(c)}</button>)}</div>
    {hint && <p className="subtle">{t(hint)}</p>}
    {list.length === 0 && <p className="hc-empty">{t('Nic nie pasuje.')}</p>}
    {list.map(f => <div key={f.id} className="hc-card">
      <p className="hc-tag">{t(f.c)}</p><h3 className="hc-h3">{t(f.n)}</h3>
      <div className="hc-list">{METHODS.filter(m => f.ways[m.id] && (method === 'all' || method === m.id)).map(m => { const w = f.ways[m.id]!; return <div key={m.id} className="hc-item">
        <div><b>{t(m.n)}</b><p className="subtle">{w.t}{w.extra ? ` · ${w.extra}` : ''}</p></div>
        <button className="hc-chip-btn" onClick={() => { setPreset({ sec: w.min * 60, name: `${f.n} (${t(m.n).toLowerCase()})`, meta: w.t }); onTimer(); }} aria-label={`${t('Ustaw timer')} ${f.n} ${w.min} min`}>⏱ {w.min} min</button></div>; })}</div>
      {f.note && <p className="hc-tip">{t(f.note)}</p>}
    </div>)}
    <p className="subtle">{t('Czasy orientacyjne: zależą od wielkości kawałków, garnka i płyty. Dotknięcie czasu ustawia go w minutniku.')}</p>
  </section>;
}

export type ThermomixView = 'recipes' | 'timers' | 'rules';
export const thermomixViews: { id: ThermomixView; label: string; icon: string }[] = [
  { id: 'recipes', label: 'Przepisy', icon: ICONS.dishes }, { id: 'timers', label: 'Timery', icon: ICONS.timer }, { id: 'rules', label: 'Zasady używania', icon: ICONS.modes },
];
function Thermomix({ onTimer, view, onView }: { onTimer: () => void; view: ThermomixView; onView: (view: ThermomixView) => void }) {
  const [cat, setCat] = useState<string>('Wszystkie'), [q, setQ] = useState('');
  const nq = norm(q.trim());
  const list = TM_RECIPES.filter(r => (cat === 'Wszystkie' || r.c === cat) && (!nq || norm(r.n + ' ' + r.c + ' ' + r.ing.join(' ')).includes(nq)));
  return <section className="screen" aria-label={t('Thermomix')}>
    {view === 'timers' && <div aria-label={t('Timery Thermomix')}><TimersScreen /></div>}
    {view === 'rules' && <div aria-label={t('Zasady używania')} className="hc-card"><h3 className="hc-h3">{t('Zasady używania')}</h3><table className="hc-table"><tbody>{TM_RULES.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td className="left">{t(b)}</td></tr>)}</tbody></table></div>}
    {view === 'recipes' && <div aria-label={t('Przepisy Thermomix')}>
    <p className="subtle">{t('Podstawowe ustawienia Thermomix TM6, które ustawisz ręcznie na urządzeniu: czas, temperatura i obroty. Działają bez Cookidoo i bez internetu.')}</p>
    <input className="hc-input" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Szukaj: ryż, zupa, pizza…')} aria-label={t('Szukaj przepisu')} autoComplete="off" />
    <div className="hc-chips" role="group" aria-label={t('Kategorie')}>{TM_CATEGORIES.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{t(c)}</button>)}</div>
    {list.length === 0 && <p className="hc-empty">{t('Nic nie pasuje.')}</p>}
    {list.map(r => <details key={r.id} className="details-card hc-tm"><summary><span><small className="hc-tag">{t(r.c)}</small> <b>{t(r.n)}</b></span> <span>+</span></summary>
      <p className="subtle">{t('Porcje')}: {r.yield}</p>
      <h3 className="hc-h3">{t('Składniki')}</h3>
      <ul className="hc-ing">{r.ing.map(i => <li key={i}>{i}</li>)}</ul>
      <h3 className="hc-h3">{t('Kroki')}</h3>
      <ol className="hc-steps">{r.steps.map((st, i) => <li key={i}>
        <p>{st.text}</p>
        {st.set && <div className="hc-set" aria-label={t('Ustawienia na urządzeniu')}>{settingText(st.set)}</div>}
        {st.wait && <button className="hc-chip-btn" onClick={() => { setPreset({ sec: st.wait! * 60, name: r.n, meta: t('odpoczynek') }); onTimer(); }}>⏱ {st.wait} min</button>}
      </li>)}</ol>
      {r.note && <p className="hc-tip">{r.note}</p>}
    </details>)}
    </div>}
    <p className="subtle">{t('Wartości orientacyjne, oparte na ogólnych zasadach pracy z Thermomix. Sprawdź je w instrukcji swojego urządzenia i dopasuj do składników.')}</p>
  </section>;
}

function Measures() {
  const [ing, setIng] = useState('cukier'), [amount, setAmount] = useState('1'), [unit, setUnit] = useState<Unit>('szklanka'), [q, setQ] = useState('');
  const item = INGREDIENTS.find(i => i.id === ing)!;
  const value = parseFloat(amount.replace(',', '.'));
  const out = Number.isFinite(value) && value >= 0 ? convert(item, value, unit) : null;
  const nq = norm(q.trim());
  const rows = INGREDIENTS.filter(i => !nq || norm(i.n).includes(nq));
  const [celsius, setCelsius] = useState('180');
  const c = parseFloat(celsius.replace(',', '.'));
  return <section className="screen" aria-label={t('Miarki')}>
    <div className="hc-card hc-form">
      <label className="hc-field"><span>{t('Produkt')}</span>
        <select className="hc-input" value={ing} onChange={e => setIng(e.target.value)}>{INGREDIENTS.map(i => <option key={i.id} value={i.id}>{i.n}</option>)}</select></label>
      <div className="hc-row">
        <label className="hc-field grow"><span>{t('Ilość')}</span><input className="hc-input" inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} aria-label={t('Ilość')} /></label>
        <label className="hc-field grow"><span>{t('Jednostka')}</span><select className="hc-input" value={unit} onChange={e => setUnit(e.target.value as Unit)}>{UNITS.map(u => <option key={u.id} value={u.id}>{t(u.n)}</option>)}</select></label>
      </div>
      {out && <div className="hc-result" role="status" aria-live="polite">
        <div className="hc-big"><b>{num(out.g, 0)} g</b><span>= {num(out.dag, 1)} dag{out.kg >= 0.1 ? ` = ${num(out.kg, 2)} kg` : ''}</span></div>
        <div className="hc-conv">
          <div><b>{num(out.szklanka, 2)}</b><span>{t('szklanki')}</span></div><div><b>{num(out.lyzka, 1)}</b><span>{t('łyżki')}</span></div>
          <div><b>{num(out.lyzeczka, 1)}</b><span>{t('łyżeczki')}</span></div><div><b>{num(out.ml, 0)}</b><span>ml</span></div>
        </div>
      </div>}
      <p className="subtle">{t('Szklanka = 250 ml, łyżka = 15 ml, łyżeczka = 5 ml, miary płaskie (bez czubka). Wartości orientacyjne (±10%): zależą od ubicia i wilgotności.')}</p>
    </div>
    <details className="details-card" open><summary>{t('Tabela miarek')} <span>+</span></summary>
      <input className="hc-input" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Szukaj produktu')} aria-label={t('Szukaj produktu')} />
      <table className="hc-table hc-measures"><thead><tr><th>{t('Produkt')}</th><th>{t('szklanka')}</th><th>{t('łyżka')}</th><th>{t('łyżeczka')}</th></tr></thead>
        <tbody>{rows.map(i => { const cup = convert(i, 1, 'szklanka').g, tbsp = convert(i, 1, 'lyzka').g, tsp = convert(i, 1, 'lyzeczka').g; return <tr key={i.id}>
          <th scope="row">{i.n}</th><td>{kitchenGrams(cup)} g<small>{num(kitchenGrams(cup) / 10, 1)} dag</small></td><td>{num(tbsp, 0)} g</td><td>{num(tsp, 1)} g</td></tr>; })}</tbody></table>
      <p className="subtle">1 {t('szklanka')} = {ML.szklanka} ml · 1 {t('łyżka')} = {ML.lyzka} ml = 3 {t('łyżeczki')}</p>
    </details>
    <details className="details-card"><summary>{t('Temperatury')} <span>+</span></summary>
      <div className="hc-row"><label className="hc-field grow"><span>°C</span><input className="hc-input" inputMode="decimal" value={celsius} onChange={e => setCelsius(e.target.value)} aria-label="°C" /></label>
        <div className="hc-result inline" role="status"><b>{Number.isFinite(c) ? num(cToF(c), 0) : '—'} °F</b></div></div>
      <table className="hc-table"><tbody>{OVEN_C.map(x => <tr key={x}><td>{x} °C</td><td>{num(cToF(x), 0)} °F</td></tr>)}</tbody></table>
      <table className="hc-table"><tbody>{OVEN_NOTES.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td className="left">{t(b)}</td></tr>)}</tbody></table>
      <h3 className="hc-h3">{t('Bezpieczna temperatura w środku')}</h3>
      <table className="hc-table"><tbody>{SAFE_TEMPS.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td>{b}</td></tr>)}</tbody></table>
      <p className="subtle">350 °F ≈ {num(fToC(350), 0)} °C</p>
    </details>
  </section>;
}

export function HomeModule({ active, tab, thermomixView, onThermomixView, onTab, onPlan, onShop }: { active: boolean; tab: HomeTab; thermomixView: ThermomixView; onThermomixView: (view: ThermomixView) => void; onTab: (t: HomeTab) => void; onPlan?: () => void; onShop?:()=>void }) {
  const main = useRef<HTMLElement>(null);
  useEffect(() => { if (active) { main.current?.scrollTo(0, 0); if (tab !== 'recipes') main.current?.querySelector('h1')?.focus({preventScroll:true}); } }, [tab,active]);
  const toTimers = useMemo(() => () => onTab('timers'), [onTab]);
  const thermomixHeading: Record<ThermomixView, [string, string]> = { recipes: ['THERMOMIX TM6', 'Przepisy bez Cookidoo'], timers: ['THERMOMIX TM6', 'Timery Thermomix'], rules: ['THERMOMIX TM6', 'Zasady używania'] };
  const heading: Record<HomeTab, [string, string]> = { kitchen: ['SMART KITCHEN ASSISTANT', 'Kuchnia'], recipes: ['HOMECRAFT', 'Książka kucharska'], eggs: ['KUCHNIA', 'Idealne jajko'], cook: ['KUCHNIA', 'Czasy gotowania'], measures: ['KUCHNIA', 'Miarki i temperatury'], thermomix: thermomixHeading[thermomixView], timers: ['TIMERY', 'Timery kuchenne'] };
  return <>
    <main ref={main} hidden={!active} className="app-content" aria-label={t('Moduł Kuchnia')}>
      <div className="screen-heading"><p className="overline">{t(heading[tab][0])}</p><h1 tabIndex={-1}>{t(heading[tab][1],tab==='kitchen'?'module':undefined)}</h1></div>
      {tab === 'kitchen' && <KitchenLanding onTab={onTab} onPlan={onPlan} onShop={onShop}/>}
      {tab === 'recipes' && active && <Cookbook onPlan={onPlan || (() => {})} />}
      {tab === 'eggs' && <Eggs onTimer={toTimers} />}
      {tab === 'cook' && <Cooking onTimer={toTimers} />}
      {tab === 'thermomix' && <Thermomix onTimer={() => onThermomixView('timers')} view={thermomixView} onView={onThermomixView} />}
      {tab === 'measures' && <Measures />}
      {tab === 'timers' && active && <section className="screen" aria-label={t('Timery')}><button className="hc-book-entry" onClick={() => onTab('recipes')}><span>📖</span><span><b>{t('Książka kucharska')}</b><small>{t('600 przepisów, diety, ulubione i kcal na porcję')}</small></span><span>→</span></button>{onPlan && <PlanCta onOpen={onPlan} />}<TimersScreen /></section>}
    </main>
  </>;
}
