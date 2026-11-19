import { useEffect, useRef, useState, type KeyboardEvent as KEvent, type PointerEvent as PEvent } from 'react';
import { t } from './en';
import { actOn, addTimer, clock, remaining, unlockAudio, useTick, useTimers, type KTimer } from './timers';

const R = 112, C = 2 * Math.PI * R;
const pad = (n: number) => String(n).padStart(2, '0');
const MAX = 99 * 60;

/** Dial with 60 minute ticks. Drag the knob (or use arrow keys) to set minutes; fine tuning below. */
function Dial({ value, onChange, children }: { value: number; onChange: (sec: number) => void; children: React.ReactNode }) {
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const frac = (value % 3600) / 3600 || (value >= 3600 ? 1 : 0);
  const ang = frac * 2 * Math.PI - Math.PI / 2;
  const set = (e: PEvent) => {
    const b = svg.current!.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) + Math.PI / 2;
    let m = Math.round(((a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) * 60);
    const prev = Math.floor(value / 60) % 60;
    const hours = Math.floor(value / 3600);
    if (m === 60) m = 0;
    // crossing 12 o'clock carries into the hour counter so the dial reaches 99 min
    let h = hours;
    if (prev > 45 && m < 15) h = Math.min(1, hours + 1);
    else if (prev < 15 && m > 45) h = Math.max(0, hours - 1);
    onChange(Math.min(MAX, Math.max(0, (h * 60 + m) * 60 + (value % 60))));
  };
  const key = (e: KEvent) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 60 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -60 : e.key === 'PageUp' ? 600 : e.key === 'PageDown' ? -600 : 0;
    if (d) { e.preventDefault(); onChange(Math.min(MAX, Math.max(0, value + d))); }
  };
  return <div className="hc-dial">
    <svg ref={svg} viewBox="0 0 280 280" role="slider" tabIndex={0} aria-label={t('Pokrętło czasu')} aria-valuemin={0} aria-valuemax={MAX} aria-valuenow={value} aria-valuetext={clock(value)}
      onKeyDown={key} onPointerDown={e => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); set(e); }} onPointerMove={e => { if (dragging.current) set(e); }} onPointerUp={() => { dragging.current = false; }} onPointerCancel={() => { dragging.current = false; }}>
      <circle cx="140" cy="140" r="132" className="d-face" />
      <circle cx="140" cy="140" r={R} className="d-track" />
      <circle cx="140" cy="140" r={R} className="d-prog" strokeDasharray={`${frac * C} ${C}`} transform="rotate(-90 140 140)" />
      {Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 2 * Math.PI - Math.PI / 2, big = i % 5 === 0, r1 = big ? 90 : 95; return <line key={i} className={big ? 'd-tick big' : 'd-tick'} x1={140 + r1 * Math.cos(a)} y1={140 + r1 * Math.sin(a)} x2={140 + 101 * Math.cos(a)} y2={140 + 101 * Math.sin(a)} />; })}
      {[0, 15, 30, 45].map(n => { const a = n / 60 * 2 * Math.PI - Math.PI / 2; return <text key={n} className="d-num" x={140 + 78 * Math.cos(a)} y={140 + 78 * Math.sin(a) + 4} textAnchor="middle">{n === 0 ? 60 : n}</text>; })}
      <circle cx={140 + R * Math.cos(ang)} cy={140 + R * Math.sin(ang)} r="13" className="d-knob" />
      <circle cx={140 + R * Math.cos(ang)} cy={140 + R * Math.sin(ang)} r="4" className="d-knob-dot" />
    </svg>
    <div className="hc-dial-mid">{children}</div>
  </div>;
}

/** Small ring that shows the progress of a running timer. */
function Ring({ pct, children, done }: { pct: number; children: React.ReactNode; done?: boolean }) {
  const r = 34, c = 2 * Math.PI * r;
  return <div className={'hc-ring' + (done ? ' done' : '')}>
    <svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r={r} className="r-track" /><circle cx="40" cy="40" r={r} className="r-prog" strokeDasharray={`${Math.min(1, Math.max(0, pct)) * c} ${c}`} transform="rotate(-90 40 40)" /></svg>
    <span>{children}</span>
  </div>;
}

function TimerCard({ tm }: { tm: KTimer }) {
  const r = remaining(tm);
  const rep = tm.rep || 1;
  return <div className={'hc-timer hc-timer-round' + (tm.done ? ' done' : '') + (tm.paused ? ' paused' : '')}>
    <Ring pct={tm.done ? 1 : 1 - r / tm.total} done={tm.done}><b role="timer" aria-label={tm.name}>{tm.done ? '✓' : clock(r)}</b></Ring>
    <div className="hc-timer-body">
      <div className="hc-timer-top"><b>{tm.name}</b><span>{[rep > 1 ? `${t('runda')} ${tm.rnd || 1}/${rep}` : '', tm.meta].filter(Boolean).join(' · ')}</span></div>
      {tm.marks.length > 0 && <div className="hc-bar" aria-hidden="true"><i style={{ width: Math.min(100, Math.max(0, (1 - r / tm.total) * 100)) + '%' }} />{tm.marks.map(m => <b key={m} style={{ left: m / tm.total * 100 + '%' }} />)}</div>}
      <div className="hc-timer-ctrl">
        {tm.done
          ? <><button className="hot" onClick={() => actOn(tm.id, 'ack')}>{t('OK, wyłącz')}</button><button onClick={() => actOn(tm.id, 'plus2')}>+2 min</button></>
          : <><button onClick={() => actOn(tm.id, 'pause')}>{tm.paused ? t('Wznów') : t('Pauza')}</button><button onClick={() => actOn(tm.id, 'plus1')}>+1 min</button><button onClick={() => actOn(tm.id, 'reset')}>{t('Od nowa')}</button></>}
        <button onClick={() => actOn(tm.id, 'del')}>{t('Usuń')}</button>
      </div>
    </div>
  </div>;
}

const PRE = [0, 10, 30, 60, 120];
const QUICK = [1, 3, 5, 10, 15, 20, 30, 45];

function Minutnik() {
  const timers = useTimers();
  useTick(timers.some(x => !x.paused && !x.done));
  const [sec, setSec] = useState(600), [name, setName] = useState(''), [err, setErr] = useState('');
  const [half, setHalf] = useState(false), [pre, setPre] = useState(0), [rep, setRep] = useState(1), [sound, setSound] = useState(true), [vib, setVib] = useState(true);
  const m = Math.floor(sec / 60), s = sec % 60;
  const adj = (d: number) => setSec(v => Math.min(MAX, Math.max(0, v + d)));
  const start = () => {
    if (sec <= 0) { setErr(t('Ustaw czas dłuższy niż 0 sekund')); return; }
    setErr('');
    const bits = [half && sec >= 60 ? t('przypomnienie w połowie') : '', pre && pre < sec ? `${t('alert')} ${pre >= 60 ? pre / 60 + ' min' : pre + ' s'}` : ''].filter(Boolean);
    addTimer(name.trim() || 'Timer', sec, { marks: half && sec >= 60 ? [Math.round(sec / 2)] : [], act: 'Potrząśnij lub obróć', meta: bits.join(' · '), pre, rep, mute: !sound, vib });
    setName('');
  };
  return <div className="hc-stack">
    <div className="hc-card hc-setter">
      <Dial value={sec} onChange={setSec}>
        <b className="hc-dial-time">{pad(m)}:{pad(s)}</b>
        <span>{t('min : s')}</span>
      </Dial>
      <div className="hc-fine" role="group" aria-label={t('Dokładny czas')}>
        <button type="button" onClick={() => adj(-60)} aria-label="−1 min">−1m</button><button type="button" onClick={() => adj(-10)} aria-label="−10 s">−10s</button>
        <button type="button" onClick={() => adj(10)} aria-label="+10 s">+10s</button><button type="button" onClick={() => adj(60)} aria-label="+1 min">+1m</button>
      </div>
      <div className="hc-quick">{QUICK.map(q => <button type="button" key={q} onClick={() => setSec(q * 60)} aria-pressed={sec === q * 60}>{q} min</button>)}</div>
      <input className="hc-input" value={name} onChange={e => setName(e.target.value)} placeholder={t('Nazwa (np. Frytki)')} maxLength={40} aria-label={t('Nazwa timera')} />
      <details className="hc-adv"><summary>{t('Opcje zaawansowane')}</summary>
        <div className="hc-row wrap">
          <label className="hc-field"><span>{t('Minuty')}</span><input className="hc-input hc-num" type="number" inputMode="numeric" min={0} max={99} value={m} onChange={e => setSec(Math.min(99, Math.max(0, parseInt(e.target.value) || 0)) * 60 + s)} aria-label={t('Minuty')} /></label>
          <label className="hc-field"><span>{t('Sekundy')}</span><input className="hc-input hc-num" type="number" inputMode="numeric" min={0} max={59} value={s} onChange={e => setSec(m * 60 + Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} aria-label={t('Sekundy')} /></label>
        </div>
        <div className="hc-field"><span>{t('Alert przed końcem')}</span>
          <div className="hc-seg" role="group" aria-label={t('Alert przed końcem')}>{PRE.map(p => <button type="button" key={p} aria-pressed={pre === p} onClick={() => setPre(p)}>{p === 0 ? t('Brak') : p >= 60 ? p / 60 + ' min' : p + ' s'}</button>)}</div></div>
        <div className="hc-field"><span>{t('Powtórzenia (rundy)')}</span>
          <div className="hc-step"><button type="button" onClick={() => setRep(v => Math.max(1, v - 1))} aria-label={t('Mniej rund')}>−</button><b aria-live="polite">{rep}×</b><button type="button" onClick={() => setRep(v => Math.min(20, v + 1))} aria-label={t('Więcej rund')}>+</button></div></div>
        <label className="hc-check"><input type="checkbox" checked={half} onChange={e => setHalf(e.target.checked)} /> {t('Przypomnij w połowie, żeby potrząsnąć / obrócić')}</label>
        <label className="hc-check"><input type="checkbox" checked={sound} onChange={e => setSound(e.target.checked)} /> {t('Dźwięk')}</label>
        <label className="hc-check"><input type="checkbox" checked={vib} onChange={e => setVib(e.target.checked)} /> {t('Wibracje')}</label>
      </details>
      {err && <p className="hc-err" role="alert">{err}</p>}
      <button className="hc-primary" type="button" onClick={() => { unlockAudio(); start(); }}>{t('Uruchom timer')}</button>
    </div>
    <div className="hc-stack">
      {timers.length === 0 ? <p className="hc-empty">{t('Brak aktywnych timerów. Wybierz danie albo ustaw czas powyżej.')}</p> : timers.map(tm => <TimerCard key={tm.id} tm={tm} />)}
    </div>
    <p className="subtle">{t('Timer działa niezależnie od urządzenia. Zostaw aplikację otwartą: ekran nie zgaśnie, dopóki timer odlicza. Pierwsze dotknięcie włącza dźwięk.')}</p>
  </div>;
}

// ---- Stopwatch ---------------------------------------------------------------------------
interface SW { start: number; acc: number; running: boolean; laps: number[] }
const SWKEY = 'homecraft.stopwatch.v1';
const loadSW = (): SW => {
  try { const r = JSON.parse(localStorage.getItem(SWKEY) || ''); if (r && Number.isFinite(r.acc) && Array.isArray(r.laps)) return { start: Number(r.start) || 0, acc: r.acc, running: !!r.running, laps: r.laps.filter(Number.isFinite).slice(0, 200) }; } catch { /* none */ }
  return { start: 0, acc: 0, running: false, laps: [] };
};
const fmt = (ms: number) => { const t = Math.max(0, Math.floor(ms)), m = Math.floor(t / 60000), s = Math.floor(t % 60000 / 1000), c = Math.floor(t % 1000 / 10); return { m: pad(m), s: pad(s), c: pad(c), text: `${pad(m)}:${pad(s)}.${pad(c)}` }; };

function Stoper() {
  const [sw, setSw] = useState<SW>(loadSW);
  useEffect(() => { try { localStorage.setItem(SWKEY, JSON.stringify(sw)); } catch { /* ignore */ } }, [sw]);
  useTick(sw.running, 50);
  const ms = sw.acc + (sw.running ? Date.now() - sw.start : 0);
  const f = fmt(ms);
  const secAng = (ms % 60000) / 60000 * 360;
  const lapAng = sw.laps.length ? ((ms - sw.laps[sw.laps.length - 1]) % 60000) / 60000 * 360 : null;
  const toggle = () => { unlockAudio(); setSw(v => v.running ? { ...v, running: false, acc: v.acc + Date.now() - v.start } : { ...v, running: true, start: Date.now() }); };
  const lap = () => setSw(v => v.running ? { ...v, laps: [...v.laps, v.acc + Date.now() - v.start] } : v);
  const reset = () => setSw({ start: 0, acc: 0, running: false, laps: [] });
  const splits = sw.laps.map((l, i) => l - (sw.laps[i - 1] || 0));
  const best = splits.length > 1 ? Math.min(...splits) : -1, worst = splits.length > 1 ? Math.max(...splits) : -1;
  return <div className="hc-stack">
    <div className="hc-card hc-setter">
      <div className="hc-dial">
        <svg viewBox="0 0 280 280" role="img" aria-label={t('Stoper')}>
          <circle cx="140" cy="140" r="132" className="d-face" />
          <circle cx="140" cy="140" r={R} className="d-track" />
          <circle cx="140" cy="140" r={R} className="d-prog" strokeDasharray={`${ms % 60000 / 60000 * C} ${C}`} transform="rotate(-90 140 140)" />
          {Array.from({ length: 60 }, (_, i) => { const a = i / 60 * 2 * Math.PI - Math.PI / 2, big = i % 5 === 0, r1 = big ? 90 : 95; return <line key={i} className={big ? 'd-tick big' : 'd-tick'} x1={140 + r1 * Math.cos(a)} y1={140 + r1 * Math.sin(a)} x2={140 + 101 * Math.cos(a)} y2={140 + 101 * Math.sin(a)} />; })}
          {[0, 15, 30, 45].map(n => { const a = n / 60 * 2 * Math.PI - Math.PI / 2; return <text key={n} className="d-num" x={140 + 78 * Math.cos(a)} y={140 + 78 * Math.sin(a) + 4} textAnchor="middle">{n === 0 ? 60 : n}</text>; })}
          {lapAng !== null && <line className="d-hand lap" x1="140" y1="140" x2="140" y2="52" transform={`rotate(${lapAng} 140 140)`} />}
          <line className="d-hand" x1="140" y1="154" x2="140" y2="44" transform={`rotate(${secAng} 140 140)`} />
          <circle cx="140" cy="140" r="7" className="d-knob" />
        </svg>
        <div className="hc-dial-mid sm"><b className="hc-dial-time" role="timer" aria-label={t('Stoper')}>{f.m}:{f.s}<small>.{f.c}</small></b><span>{sw.laps.length ? `${t('okrążenie')} ${sw.laps.length + 1}` : t('min : s')}</span></div>
      </div>
      <div className="hc-sw-ctrl">
        <button type="button" onClick={sw.running ? lap : reset} disabled={!sw.running && ms === 0}>{sw.running ? t('Okrążenie') : t('Zeruj')}</button>
        <button type="button" className="hc-primary" onClick={toggle}>{sw.running ? t('Pauza') : ms > 0 ? t('Wznów') : t('Start')}</button>
      </div>
    </div>
    {splits.length > 0 && <div className="hc-card"><table className="hc-table hc-laps"><thead><tr><th>#</th><th>{t('Okrążenie')}</th><th>{t('Łącznie')}</th></tr></thead><tbody>
      {[...splits].map((x, i) => i).reverse().map(i => <tr key={i} className={splits[i] === best ? 'best' : splits[i] === worst ? 'worst' : ''}><td>{i + 1}</td><td>{fmt(splits[i]).text}</td><td>{fmt(sw.laps[i]).text}</td></tr>)}
    </tbody></table></div>}
    <p className="subtle">{t('Stoper liczy dalej także po zamknięciu aplikacji. Okrążenia zapisują się na tym urządzeniu.')}</p>
  </div>;
}

/** Kitchen timers (round dial) and a stopwatch; shared by Dom and Air Fryer. */
export function TimersScreen() {
  const [mode, setMode] = useState<'timer' | 'stopwatch'>('timer');
  return <div className="hc-stack">
    <div className="hc-seg hc-mode" role="group" aria-label={t('Tryb')}>
      <button aria-pressed={mode === 'timer'} onClick={() => setMode('timer')}>{t('Minutnik')}</button>
      <button aria-pressed={mode === 'stopwatch'} onClick={() => setMode('stopwatch')}>{t('Stoper')}</button>
    </div>
    {mode === 'timer' ? <Minutnik /> : <Stoper />}
  </div>;
}
