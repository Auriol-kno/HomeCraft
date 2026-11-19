import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from './en';
import { cToF, convert, EGG_BOIL, EGG_OTHER, EGG_SIZES, EGG_START, EGG_STEAM, EGG_TIPS, eggSeconds, fToC, FOODS, FOOD_CATEGORIES, INGREDIENTS, kitchenGrams, METHODS, ML, num, OVEN_C, OVEN_NOTES, UNITS, type EggMethod, type MethodId, type Unit } from './home-data';
import { norm, SAFE_TEMPS } from './fryer-data';
import { addTimer, useTimers } from './timers';
import { ICONS, Icon, TimersScreen } from './ui';

export type HomeTab = 'eggs' | 'cook' | 'measures' | 'timers';
export const homeTabs: { id: HomeTab; label: string; icon: string }[] = [
  { id: 'eggs', label: 'Jajka', icon: ICONS.egg }, { id: 'cook', label: 'Gotowanie', icon: ICONS.pot },
  { id: 'measures', label: 'Miarki', icon: ICONS.scale }, { id: 'timers', label: 'Timery', icon: ICONS.timer },
];
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
function Pills<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; n: string }[]; onChange: (v: T) => void }) {
  return <div className="hc-field"><span>{t(label)}</span><div className="hc-seg" role="group" aria-label={t(label)}>{options.map(o => <button key={o.id} aria-pressed={value === o.id} onClick={() => onChange(o.id)}>{t(o.n)}</button>)}</div></div>;
}

function Eggs({ onTimer }: { onTimer: () => void }) {
  const [method, setMethod] = useState<EggMethod>('boil'), [size, setSize] = useState('M'), [start, setStart] = useState('fridge');
  const styles = method === 'boil' ? EGG_BOIL : EGG_STEAM;
  const go = (name: string, sec: number, meta: string, act = 'Wyjmij i zalej zimną wodą') => { addTimer(name, sec, [], act, meta); onTimer(); };
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
        <button className="hc-chip-btn" onClick={() => { addTimer(`${f.n} (${t(m.n).toLowerCase()})`, w.min * 60, [], 'Sprawdź jedzenie', w.t); onTimer(); }} aria-label={`${t('Start timera')} ${f.n} ${w.min} min`}>⏱ {w.min} min</button></div>; })}</div>
      {f.note && <p className="hc-tip">{t(f.note)}</p>}
    </div>)}
    <p className="subtle">{t('Czasy orientacyjne: zależą od wielkości kawałków, garnka i płyty. Przycisk uruchamia timer z wartością środkową.')}</p>
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

export function HomeModule({ active, tab, onTab }: { active: boolean; tab: HomeTab; onTab: (t: HomeTab) => void }) {
  const main = useRef<HTMLElement>(null);
  const timers = useTimers();
  useEffect(() => { main.current?.scrollTo(0, 0); }, [tab]);
  const running = timers.filter(x => !x.ack).length;
  const toTimers = useMemo(() => () => onTab('timers'), [onTab]);
  const heading: Record<HomeTab, [string, string]> = { eggs: ['POMOC W DOMU', 'Idealne jajko'], cook: ['POMOC W DOMU', 'Czasy gotowania'], measures: ['POMOC W DOMU', 'Miarki i temperatury'], timers: ['TIMERY', 'Timery kuchenne'] };
  return <>
    <main ref={main} hidden={!active} className="app-content" aria-label={t('Dom')}>
      <div className="screen-heading"><p className="overline">{t(heading[tab][0])}</p><h1 tabIndex={-1}>{t(heading[tab][1])}</h1></div>
      {tab === 'eggs' && <Eggs onTimer={toTimers} />}
      {tab === 'cook' && <Cooking onTimer={toTimers} />}
      {tab === 'measures' && <Measures />}
      {tab === 'timers' && <section className="screen" aria-label={t('Timery')}><TimersScreen /></section>}
    </main>
    {active && <nav className="bottom-nav hc-nav" aria-label={t('Nawigacja Dom')}>
      {homeTabs.map(x => <button key={x.id} aria-current={tab === x.id ? 'page' : undefined} onClick={() => onTab(x.id)}>
        <span className="nav-icon"><Icon d={x.icon} />{x.id === 'timers' && running > 0 && <i />}</span><span>{t(x.label)}</span></button>)}
    </nav>}
  </>;
}
