import { useEffect, useMemo, useRef, useState } from 'react';
import { t } from './en';
import { CookingTimeline } from './CookingTimeline';
import { dishTimeline } from './timeline-data';
import { DISHES, FRYER_PREHEAT_SECONDS, FRYER_CATEGORIES, FRYER_RULES, MODES, MODE_ORDER, SAFE_TEMPS, fmtMin, norm, type Dish } from './fryer-data';
import { setPreset } from './timers';
import { ICONS, Icon, Sheet } from './ui';
import { TimersScreen } from './TimersScreen';
import { PlanCta } from './KitchenModule';

export type FryerTab = 'dishes' | 'timers' | 'modes';
export const fryerTabs: { id: FryerTab; label: string; icon: string }[] = [
  { id: 'dishes', label: 'Dania', icon: ICONS.dishes }, { id: 'timers', label: 'Timery', icon: ICONS.timer }, { id: 'modes', label: 'Zasady używania', icon: ICONS.modes },
];
const favKey = 'homecraft.fryer.favs.v1';
const readFavs = (): Set<string> => { try { const v = JSON.parse(localStorage.getItem(favKey) || '[]'); return new Set(Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []); } catch { return new Set(); } };
const Star = ({ on }: { on: boolean }) => <svg className={'hc-star' + (on ? ' on' : '')} viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={ICONS.star} /></svg>;
const timeLabel = (m: number) => m >= 60 ? fmtMin(m) : m + ' min';

function DishSheet({ d, fav, onFav, onClose, onTimer }: { d: Dish; fav: boolean; onFav: () => void; onClose: () => void; onTimer: () => void }) {
  const M = MODES[d.m];
  const marks = d.s.length ? d.s.map(f => 'po ' + Math.round(d.min * f) + ' min').join(', ') : t('nie trzeba');
  const start = (pre: boolean) => {
    if (pre) setPreset({ sec: FRYER_PREHEAT_SECONDS, name: 'Rozgrzewanie: ' + d.n, meta: `PREHEAT · ${d.t} °C`, act: '' });
    else setPreset({ sec: d.min * 60, name: d.n, meta: `${M.tag} · ${d.t} °C`, marks: d.s.map(f => Math.round(d.min * 60 * f)), act: d.act || 'Sprawdź jedzenie' });
    onTimer();
  };
  return <Sheet overline={t(d.c)} title={d.n} onClose={onClose} headExtra={<button className="hc-icon-btn" onClick={onFav} aria-pressed={fav} aria-label={t('Ulubione')}><Star on={fav} /></button>}>
    <div className="hc-device">
      <p className="hc-lbl">{t('Ustaw na urządzeniu')}</p>
      <div className="hc-dev-row">
        <div><span className="hc-lbl">{t('Tryb')}</span><b className="hc-led sm">{M.tag}</b></div>
        <div><span className="hc-lbl">{t('Temp.')}</span><b className="hc-led">{d.t}<small>°C</small></b></div>
        <div><span className="hc-lbl">{t('Czas')}</span><b className="hc-led">{d.min >= 60 ? <>{Math.floor(d.min / 60)}<small>h</small>{d.min % 60 ? String(d.min % 60).padStart(2, '0') : ''}</> : <>{d.min}<small>min</small></>}</b></div>
      </div>
      <div className="hc-dev-modes" aria-hidden="true">{MODE_ORDER.map(k => <span key={k} className={k === d.m || (d.pre && k === 'PREHEAT') ? 'on' : ''}>{MODES[k].tag}</span>)}</div>
      <p className="hc-dev-note">{d.pre ? t('Najpierw PREHEAT (ok. 3 min), potem ') : ''}{M.tag} → {d.t} °C → {fmtMin(d.min)} → ▶</p>
    </div>
    <div className="hc-facts">
      <div><span>{t('Ilość (kosz 6 l)')}</span><b>{d.a}</b></div>
      <div><span>{t('Tłuszcz')}</span><b>{d.f}</b></div>
      <div><span>{d.act ? d.act : t('W trakcie')}</span><b>{marks}</b></div>
      <div><span>{t('W środku')}</span><b>{d.core ? d.core + ' °C' : t('wg wyglądu')}</b></div>
    </div>
    <CookingTimeline plan={dishTimeline(d)} relative showSteps translateTitles totalLabel="Czas urządzenia" />
    <p className="hc-timeline-note">{t('Rozkład pokazuje czas urządzenia. Krojenie, namaczanie i odpoczynek opisano w krokach; nie są doliczane do tej osi.')}</p>
    <h3 className="hc-h3">{t('Krok po kroku')}</h3>
    <ol className="hc-steps">{d.st.map(s => <li key={s}>{s}</li>)}</ol>
    {d.tip && <p className="hc-tip">{d.tip}</p>}
    <div className="hc-actions">
      <button className="hc-primary" onClick={() => start(false)}>{t('Start timera')} {fmtMin(d.min)}{d.s.length ? ' ' + t('z przypomnieniem') : ''}</button>
      {d.pre && <button className="hc-ghost" onClick={() => start(true)}>{t('Najpierw timer rozgrzewania 3 min')}</button>}
    </div>
  </Sheet>;
}

export function FryerModule({ active, tab, onTab, onPlan }: { active: boolean; tab: FryerTab; onTab: (t: FryerTab) => void; onPlan?: () => void }) {
  const [cat, setCat] = useState('Wszystkie'), [q, setQ] = useState(''), [favOnly, setFavOnly] = useState(false);
  const [favs, setFavs] = useState(readFavs), [open, setOpen] = useState<string | null>(null);
  const main = useRef<HTMLElement>(null);
  useEffect(() => { if (active) { main.current?.scrollTo(0, 0); main.current?.querySelector('h1')?.focus({preventScroll:true}); } }, [active]);
  const toggleFav = (id: string) => setFavs(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); try { localStorage.setItem(favKey, JSON.stringify([...n])); } catch { /* ignore */ } return n; });
  const list = useMemo(() => { const nq = norm(q.trim()); return DISHES.filter(d => (cat === 'Wszystkie' || d.c === cat) && (!favOnly || favs.has(d.id)) && (!nq || norm(d.n + ' ' + d.c).includes(nq))); }, [cat, q, favOnly, favs]);
  const dish = open ? DISHES.find(d => d.id === open) : undefined;
  useEffect(() => { if (!active) setOpen(null); }, [active]);
  const heading = tab === 'dishes' ? ['COSORI TURBOBLAZE 6 L', 'Ściąga Air Fryer'] : tab === 'timers' ? ['TIMERY', 'Czas na potrząśnięcie'] : ['ZASADY', 'Zasady używania'];
  return <>
    <main ref={main} hidden={!active} className="app-content" aria-label={t('Air Fryer')}>
      <div className="screen-heading"><p className="overline">{t(heading[0])}</p><h1 tabIndex={-1}>{t(heading[1])}</h1></div>
      {tab === 'dishes' && <section className="screen" aria-label={t('Dania')}>
        {onPlan && <PlanCta onOpen={onPlan} />}
        <div className="hc-search">
          <input className="hc-input" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Szukaj: frytki, skrzydełka, łosoś…')} aria-label={t('Szukaj dania')} autoComplete="off" />
          <button className="hc-toggle" aria-pressed={favOnly} onClick={() => setFavOnly(v => !v)}><Star on={favOnly} />{t('Ulubione')}</button>
        </div>
        <div className="hc-chips" role="group" aria-label={t('Kategorie')}>{FRYER_CATEGORIES.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{t(c)}</button>)}</div>
        <div className="hc-grid">
          {list.length === 0 && <p className="hc-empty">{t('Nic nie pasuje. Spróbuj innej nazwy albo ustaw własny timer w zakładce Timery.')}</p>}
          {list.map(d => <button key={d.id} className="hc-dish" onClick={() => setOpen(d.id)}>
            <span className="hc-dish-top"><span><small>{t(d.c)}</small><b>{d.n}</b></span><Star on={favs.has(d.id)} /></span>
            <span className="hc-mini"><i>{MODES[d.m].tag}</i><b>{d.t}°C · {timeLabel(d.min)}</b></span>
            <span className="hc-flags">{d.pre && <em>{t('rozgrzej')}</em>}{d.s.length > 0 && <em>{d.act.toLowerCase().includes('obr') ? t('obróć') : t('potrząśnij')} ×{d.s.length}</em>}{d.core && <em>{d.core} °C {t('w środku')}</em>}</span>
          </button>)}
        </div>
      </section>}
      {tab === 'timers' && active && <section className="screen" aria-label={t('Timery')}><TimersScreen /></section>}
      {tab === 'modes' && <section className="screen" aria-label={t('Zasady używania')}>
        <div className="hc-card"><h3 className="hc-h3">{t('Bezpieczna temperatura w środku')}</h3><table className="hc-table"><tbody>{SAFE_TEMPS.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td>{b}</td></tr>)}</tbody></table></div>
        {MODE_ORDER.map(k => { const M = MODES[k]; const n = DISHES.filter(d => d.m === k).length; return <div key={k} className="hc-card"><p className="hc-tag">{M.tag}</p><h3 className="hc-h3">{t(M.pl)}</h3><p>{t(M.d)}</p><p className="hc-range">{M.range}{n ? ` · ${n} ${t('dań w ściądze')}` : ''}</p></div>; })}
        <div className="hc-card"><h3 className="hc-h3">{t('Zasady, które zawsze działają')}</h3><table className="hc-table"><tbody>{FRYER_RULES.map(([a, b]) => <tr key={a}><td>{t(a)}</td><td>{b}</td></tr>)}</tbody></table></div>
      </section>}
      {active && dish && <DishSheet d={dish} fav={favs.has(dish.id)} onFav={() => toggleFav(dish.id)} onClose={() => setOpen(null)} onTimer={() => { setOpen(null); onTab('timers'); }} />}
    </main>
  </>;
}
