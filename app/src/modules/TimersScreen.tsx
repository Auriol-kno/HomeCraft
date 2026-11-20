import { useEffect, useRef, useState, type KeyboardEvent as KEvent, type PointerEvent as PEvent } from 'react';
import { t } from './en';
import { actOn, addTimer, clearPreset, clock, peekPreset, remaining, unlockAudio, useTick, useTimers, type KTimer } from './timers';

const R = 112, C = 2 * Math.PI * R;
const pad = (n: number) => String(n).padStart(2, '0');
const MAX = 99 * 60 + 59;

/** Two concentric rings: outer = seconds (a full turn carries into minutes), inner = minutes (up to 99). */
const RINGS = [
  { id: 's', r: 124, w: 16, max: 59, label: 'Sekundy', unit: 's' },
  { id: 'm', r: 94, w: 14, max: 99, label: 'Minuty', unit: 'min' },
] as const;
type RingId = typeof RINGS[number]['id'];
const parts = (sec: number) => ({ m: Math.floor(sec / 60), s: sec % 60 });
const polar = (r: number, frac: number) => { const a = frac * 2 * Math.PI - Math.PI / 2; return [140 + r * Math.cos(a), 140 + r * Math.sin(a)] as const; };
const clampSec = (v: number) => Math.min(MAX, Math.max(0, v));

function Dial({ value, onChange, children }: { value: number; onChange: (sec: number) => void; children: React.ReactNode }) {
  const svg = useRef<SVGSVGElement>(null);
  const active = useRef<RingId | null>(null);
  const last = useRef(0); // previous seconds position while dragging, to detect full turns
  const p = parts(value);
  const pick = (e: PEvent): RingId => {
    const b = svg.current!.getBoundingClientRect();
    const d = Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / (b.width / 280);
    return d > 109 ? 's' : 'm';
  };
  const drag = (e: PEvent, id: RingId, start = false) => {
    const b = svg.current!.getBoundingClientRect();
    const a = Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) + Math.PI / 2;
    const n = Math.round((((a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI)) * 60) % 60;
    const pos = id === 'm' ? p.m % 60 : p.s;
    if (start) last.current = pos;
    let delta = n - last.current;
    if (delta < -30) delta += 60; else if (delta > 30) delta -= 60;
    last.current = n;
    if (delta) onChange(clampSec(value + delta * (id === 'm' ? 60 : 1)));
  };
  const key = (e: KEvent, id: RingId) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : e.key === 'PageUp' ? 5 : e.key === 'PageDown' ? -5 : 0;
    if (!step) return;
    e.preventDefault();
    if (id === 's') onChange(clampSec(value + step));
    else onChange(clampSec(value + step * 60));
  };
  return <div className="hc-dial">
    <svg ref={svg} viewBox="0 0 280 280" role="group" aria-label={t('Pokrętło czasu')}
      onPointerDown={e => { active.current = pick(e); (e.target as Element).setPointerCapture?.(e.pointerId); drag(e, active.current, true); }}
      onPointerMove={e => { if (active.current) drag(e, active.current); }} onPointerUp={() => { active.current = null; }} onPointerCancel={() => { active.current = null; }}>
      <circle cx="140" cy="140" r="138" className="d-face" />
      {RINGS.map(ring => {
        const val = p[ring.id], frac = (ring.id === 'm' ? val % 60 : val) / 60, C2 = 2 * Math.PI * ring.r, [kx, ky] = polar(ring.r, frac);
        return <g key={ring.id} className={'d-ring d-' + ring.id} role="slider" tabIndex={0} aria-label={t(ring.label)} aria-valuemin={0} aria-valuemax={ring.max} aria-valuenow={val} aria-valuetext={`${val} ${ring.unit}`} onKeyDown={e => key(e, ring.id)}>
          <circle cx="140" cy="140" r={ring.r} className="d-track" strokeWidth={ring.w} />
          <circle cx="140" cy="140" r={ring.r} className="d-prog" strokeWidth={ring.w} strokeDasharray={`${frac * C2} ${C2}`} transform="rotate(-90 140 140)" />
          {Array.from({ length: 60 }, (_, i) => { if (i % 5) return null; const [x1, y1] = polar(ring.r - ring.w / 2, i / 60), [x2, y2] = polar(ring.r + ring.w / 2, i / 60); return <line key={i} className="d-tick" x1={x1} y1={y1} x2={x2} y2={y2} />; })}
          <circle cx={kx} cy={ky} r={ring.w / 2 + 3} className="d-knob" />
          <circle cx={kx} cy={ky} r="3" className="d-knob-dot" />
        </g>;
      })}
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
  const [pre0] = useState(peekPreset);
  useEffect(() => { clearPreset(); }, []);
  const [sec, setSec] = useState(pre0 ? Math.min(MAX, pre0.sec) : 600), [name, setName] = useState(pre0?.name || ''), [err, setErr] = useState('');
  const [runId, setRunId] = useState<string | null>(null);
  const cur = timers.find(x => x.id === runId);
  const shown = cur ? Math.max(0, Math.ceil(remaining(cur))) : sec;
  const [half, setHalf] = useState(false), [pre, setPre] = useState(0), [rep, setRep] = useState(1), [sound, setSound] = useState(true), [vib, setVib] = useState(true);
  const { m, s } = parts(shown);
  const adj = (d: number) => setSec(v => Math.min(MAX, Math.max(0, v + d)));
  const start = () => {
    if (sec <= 0) { setErr(t('Ustaw czas dłuższy niż 0 sekund')); return; }
    setErr('');
    const bits = [half && sec >= 60 ? t('przypomnienie w połowie') : '', pre && pre < sec ? `${t('alert')} ${pre >= 60 ? pre / 60 + ' min' : pre + ' s'}` : ''].filter(Boolean);
    const id = addTimer(name.trim() || 'Timer', sec, { marks: half && sec >= 60 ? [Math.round(sec / 2)] : pre0?.marks && sec === pre0.sec ? pre0.marks : [], act: pre0?.act || 'Potrząśnij lub obróć', meta: [pre0?.meta, ...bits].filter(Boolean).join(' · '), pre, rep, mute: !sound, vib });
    setRunId(id);
    setName('');
  };
  return <div className="hc-stack">
    <div className="hc-card hc-setter">
      <Dial value={shown} onChange={v => { if (!cur) setSec(v); }}>
        <b className="hc-dial-time">{pad(m)}:{pad(s)}</b>
        <span>{cur ? (cur.done ? t('koniec') : cur.paused ? t('pauza') : t('odlicza')) : t('min : s')}</span>
        <div className="hc-dial-ctl">
          <button type="button" className="hc-dc" aria-label={cur ? t('Zeruj timer') : t('Zeruj')} onClick={() => { if (cur) { actOn(cur.id, 'del'); setRunId(null); } else { setSec(0); setErr(''); } }}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" /></svg></button>
          <button type="button" className="hc-dc main" aria-label={!cur ? t('Uruchom timer') : cur.done ? t('OK, wyłącz') : cur.paused ? t('Wznów') : t('Pauza')}
            onClick={() => { unlockAudio(); if (!cur) start(); else if (cur.done) { actOn(cur.id, 'ack'); setRunId(null); } else actOn(cur.id, 'pause'); }}>
            {cur && !cur.done && !cur.paused
              ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14" /></svg>
              : cur?.done ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
              : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" className="fill" /></svg>}
          </button>
        </div>
      </Dial>
      <div className="hc-legend" aria-hidden="true"><span><i style={{ background: 'var(--cool)' }} />{t('Sekundy')} ({t('zewnętrzny')})</span><span><i style={{ background: 'var(--accent)' }} />{t('Minuty')} ({t('wewnętrzny')})</span></div>
      <div className="hc-fine" role="group" aria-label={t('Dokładny czas')}>
        <button type="button" onClick={() => adj(-60)} aria-label="−1 min">−1m</button><button type="button" onClick={() => adj(-10)} aria-label="−10 s">−10s</button>
        <button type="button" onClick={() => adj(10)} aria-label="+10 s">+10s</button><button type="button" onClick={() => adj(60)} aria-label="+1 min">+1m</button>
      </div>
      <div className="hc-quick">{QUICK.map(q => <button type="button" key={q} onClick={() => setSec(q * 60)} aria-pressed={sec === q * 60}>{q} min</button>)}</div>
      <input className="hc-input" value={name} onChange={e => setName(e.target.value)} placeholder={t('Nazwa (np. Frytki)')} maxLength={40} aria-label={t('Nazwa timera')} />
      <details className="hc-adv"><summary>{t('Opcje zaawansowane')}</summary>
        <div className="hc-row wrap">
          <label className="hc-field"><span>{t('Minuty')}</span><input className="hc-input hc-num" type="number" inputMode="numeric" min={0} max={99} value={m} onChange={e => setSec(clampSec(Math.max(0, parseInt(e.target.value) || 0) * 60 + s))} aria-label={t('Minuty')} /></label>
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
