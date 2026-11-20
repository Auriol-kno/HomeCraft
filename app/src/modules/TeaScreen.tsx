import { useState } from 'react';
import { t } from './en';
import { norm } from './fryer-data';
import { setPreset } from './timers';
import { leafGrams, teaspoons, TEAS, TEA_CATEGORIES, TEA_CATEGORY_INFO, TEA_GENERAL, type Tea } from './tea-data';

const fmt = (s: number) => (s < 60 ? `${s} s` : s % 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : `${s / 60} min`);

function Oxidation({ range }: { range: [number, number] }) {
  const [a, b] = range;
  return <div className="hc-ox" role="img" aria-label={`${t('Utlenienie')} ${a === b ? a : `${a}–${b}`} %`}>
    <span className="hc-ox-bar"><i style={{ left: `${a}%`, width: `${Math.max(3, b - a)}%` }} /></span>
    <small>{t('Utlenienie')} {a === b ? a : `${a}–${b}`} %</small>
  </div>;
}

function TeaCard({ tea, ml, onTimer }: { tea: Tea; ml: number; onTimer: () => void }) {
  const [info, setInfo] = useState(false);
  const g = leafGrams(tea.g100, ml), sp = teaspoons(g);
  return <details className="details-card hc-tea">
    <summary><span><small className="hc-tag">{t(tea.c)}</small> <b>{tea.n}</b><em>{t(tea.line)}</em></span> <span>+</span></summary>
    <div className="hc-brew" aria-label={t('Parametry parzenia')}>
      <div><small>{t('Woda')}</small><b>{tea.temp} °C</b></div>
      <div><small>{t('Liście')}</small><b>{g} g</b><span>≈ {sp} {t('łyżeczki')}</span></div>
      <div><small>{t('Zalania')}</small><b>{tea.steps.length}×</b></div>
    </div>
    <div className="hc-infs" role="group" aria-label={t('Czasy zalewania')}>
      {tea.steps.map((s, i) => <button key={i} className="hc-tea-time" aria-label={`${t('Ustaw timer')} ${tea.n} ${fmt(s)}`}
        onClick={() => { setPreset({ sec: s, name: tea.n, meta: `${tea.temp} °C · ${g} g` }); onTimer(); }}>
        {tea.stepLabel ? t(tea.stepLabel) : `${i + 1}.`} ⏱ {fmt(s)}</button>)}
    </div>
    <p className="subtle">{t('Dotknięcie czasu ustawia go w minutniku. Jeśli opakowanie podaje inne wartości, trzymaj się opakowania.')}</p>
    {tea.ox && <Oxidation range={tea.ox} />}
    <button className="hc-info-btn" aria-expanded={info} onClick={() => setInfo(v => !v)}>{info ? t('Zwiń informacje') : t('Info i ciekawostki')}</button>
    {info && <div className="hc-tea-info">
      <h3 className="hc-h3">{t('Czym jest')}</h3><p>{tea.what}</p>
      <h3 className="hc-h3">{t('Jak powstaje')}</h3>
      <ol className="hc-steps">{tea.how.map(h => <li key={h}><p>{h}</p></li>)}</ol>
      <h3 className="hc-h3">{t('Dlaczego tak smakuje')}</h3><p>{tea.why}</p>
      <dl className="hc-facts">
        <div><dt>{t('Pochodzenie')}</dt><dd>{tea.origin}</dd></div>
        <div><dt>{t('Smak')}</dt><dd>{tea.taste}</dd></div>
        <div><dt>{t('Kofeina')}</dt><dd>{t(tea.caffeine)}</dd></div>
      </dl>
      <h3 className="hc-h3">{t('Ciekawostki')}</h3>
      <ul className="hc-ing">{tea.trivia.map(x => <li key={x}>{x}</li>)}</ul>
      {tea.tips.map(x => <p key={x} className="hc-tip">{x}</p>)}
    </div>}
  </details>;
}

/** Tea guide for the coffee section: categories, search, brewing parameters and an info panel per tea. */
export function TeaScreen({ onTimer }: { onTimer: () => void }) {
  const [cat, setCat] = useState<string>('Wszystkie'), [q, setQ] = useState(''), [ml, setMl] = useState(250), [guide, setGuide] = useState(false);
  const nq = norm(q.trim());
  const list = TEAS.filter(x => (cat === 'Wszystkie' || x.c === cat) && (!nq || norm(`${x.n} ${x.c} ${x.taste} ${x.origin}`).includes(nq)));
  const catInfo = cat !== 'Wszystkie' ? TEA_CATEGORY_INFO[cat as keyof typeof TEA_CATEGORY_INFO] : null;
  return <section className="screen" aria-label={t('Herbata')}>
    <p className="subtle">{t('Rodzaje herbat i naparów: jak powstają, czym się różnią i jak je zaparzyć. Dotknij czasu, żeby ustawić go w minutniku.')}</p>
    <button className="hc-info-btn hc-info-main" aria-expanded={guide} onClick={() => setGuide(v => !v)}>{guide ? t('Zwiń przewodnik') : t('Wszystko o herbacie: przewodnik i ciekawostki')}</button>
    {guide && <div className="hc-tea-info">{TEA_GENERAL.map(x => <div key={x.title}><h3 className="hc-h3">{t(x.title)}</h3><p>{t(x.text)}</p></div>)}</div>}
    <div className="hc-ml" role="group" aria-label={t('Ilość wody')}>
      <span>{t('Woda')}</span>
      {[150, 250, 400, 700].map(v => <button key={v} aria-pressed={ml === v} onClick={() => setMl(v)}>{v} ml</button>)}
    </div>
    <input className="hc-input" type="search" value={q} onChange={e => setQ(e.target.value)} placeholder={t('Szukaj: sencha, mięta, dym…')} aria-label={t('Szukaj herbaty')} autoComplete="off" />
    <div className="hc-chips" role="group" aria-label={t('Kategorie')}>{TEA_CATEGORIES.map(c => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)}>{t(c)}</button>)}</div>
    {catInfo && <p className="hc-tip">{t(catInfo.text)}</p>}
    {list.length === 0 && <p className="hc-empty">{t('Nic nie pasuje.')}</p>}
    {list.map(x => <TeaCard key={x.id} tea={x} ml={ml} onTimer={onTimer} />)}
    <p className="subtle">{t('Zioła i owoce to napary tradycyjnie używane w kuchni, a nie leki. Przy ciąży, chorobach i przyjmowaniu leków skonsultuj się z lekarzem.')}</p>
  </section>;
}
