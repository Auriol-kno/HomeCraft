import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { t } from './en';
import { actOn, addTimer, clock, remaining, TOAST_EVENT, unlockAudio, useTick, useTimers, type KTimer } from './timers';

export function Icon({ d }: { d: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>;
}
export const ICONS = {
  dishes: 'M4 11h16a8 8 0 0 1-16 0Zm3-6c0 1.5 1 1.5 1 3m4-3c0 1.5 1 1.5 1 3m4-3c0 1.5 1 1.5 1 3',
  timer: 'M9 2h6m-3 0v3m7 0 2 2M12 9v5l3 2M21 14a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
  modes: 'M3 6h18M3 12h18M3 18h18M8 3v6m8 0v6m-8 3v3',
  egg: 'M12 3C8 3 5 10 5 14a7 7 0 0 0 14 0c0-4-3-11-7-11Z',
  pot: 'M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-6Zm-2 0h2m16 0h2M8 6c0-1.5 1-1.5 1-3m4 3c0-1.5 1-1.5 1-3',
  scale: 'M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0L6 7Zm12 0-3 7a3 3 0 0 0 6 0l-3-7Z',
  star: 'M12 17.3l-6.2 3.7 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.8 1.6 7z',
  close: 'M6 6l12 12M18 6 6 18',
  coffee: 'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Zm12 1h2a3 3 0 0 1 0 6h-2M3 22h16M8 2v3m4-3v3',
  fryer: 'M5 9h14l-1.2 9a2 2 0 0 1-2 1.7H8.2a2 2 0 0 1-2-1.7L5 9Zm2-4h10a2 2 0 0 1 2 2v2H5V7a2 2 0 0 1 2-2Zm8 7v3',
  home: 'M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6',
};

/** Bottom sheet dialog used for dish details. */
export function Sheet({ overline, title, onClose, children, headExtra }: { overline?: string; title: string; onClose: () => void; children: ReactNode; headExtra?: ReactNode }) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey); closeBtn.current?.focus();
    const prev = document.activeElement as HTMLElement | null;
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [onClose]);
  return <div className="hc-scrim" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="hc-sheet" role="dialog" aria-modal="true" aria-labelledby="hc-sheet-title">
      <div className="hc-grab" />
      <div className="hc-sheet-head">
        <div>{overline && <p className="overline">{overline}</p>}<h2 id="hc-sheet-title">{title}</h2></div>
        <div className="hc-row">{headExtra}<button className="hc-icon-btn" ref={closeBtn} onClick={onClose} aria-label={t('Zamknij')}><Icon d={ICONS.close} /></button></div>
      </div>
      {children}
    </div>
  </div>;
}

const quick = [1, 3, 5, 8, 10, 12, 15, 20, 25, 30];
function TimerCard({ tm }: { tm: KTimer }) {
  const r = remaining(tm), pct = Math.min(100, Math.max(0, (1 - r / tm.total) * 100));
  return <div className={'hc-timer' + (tm.done ? ' done' : '') + (tm.paused ? ' paused' : '')}>
    <div className="hc-timer-top"><b>{tm.name}</b><span>{tm.meta}</span></div>
    <div className="hc-timer-time" role="timer" aria-label={tm.name}>{tm.done ? t('GOTOWE') : clock(r)}</div>
    <div className="hc-bar" aria-hidden="true"><i style={{ width: pct + '%' }} />{tm.marks.map(m => <b key={m} style={{ left: m / tm.total * 100 + '%' }} />)}</div>
    <div className="hc-timer-ctrl">
      {tm.done
        ? <><button className="hot" onClick={() => actOn(tm.id, 'ack')}>{t('OK, wyłącz')}</button><button onClick={() => actOn(tm.id, 'plus2')}>+2 min</button></>
        : <><button onClick={() => actOn(tm.id, 'pause')}>{tm.paused ? t('Wznów') : t('Pauza')}</button><button onClick={() => actOn(tm.id, 'plus1')}>+1 min</button><button onClick={() => actOn(tm.id, 'reset')}>{t('Od nowa')}</button></>}
      <button onClick={() => actOn(tm.id, 'del')}>{t('Usuń')}</button>
    </div>
  </div>;
}

/** Independent timers with an optional "shake / turn" reminder halfway. Shared by Air Fryer and Dom. */
export function TimersScreen() {
  const timers = useTimers();
  useTick(timers.some(x => !x.paused && !x.done));
  const [name, setName] = useState(''), [min, setMin] = useState('10'), [sec, setSec] = useState('0'), [shake, setShake] = useState(true), [err, setErr] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const total = (parseInt(min) || 0) * 60 + (parseInt(sec) || 0);
    if (total <= 0) { setErr(t('Ustaw czas dłuższy niż 0 sekund')); return; }
    setErr('');
    addTimer(name.trim() || 'Timer', total, shake && total >= 60 ? [Math.round(total / 2)] : [], 'Potrząśnij lub obróć', shake && total >= 60 ? t('przypomnienie w połowie') : '');
    setName('');
  };
  return <div className="hc-stack">
    <form className="hc-card hc-form" onSubmit={submit}>
      <input className="hc-input" value={name} onChange={e => setName(e.target.value)} placeholder={t('Nazwa (np. Frytki)')} maxLength={40} aria-label={t('Nazwa timera')} />
      <div className="hc-row">
        <input className="hc-input hc-num" type="number" inputMode="numeric" min={0} max={999} value={min} onChange={e => setMin(e.target.value)} aria-label={t('Minuty')} /><span>min</span>
        <input className="hc-input hc-num" type="number" inputMode="numeric" min={0} max={59} value={sec} onChange={e => setSec(e.target.value)} aria-label={t('Sekundy')} /><span>s</span>
      </div>
      <div className="hc-quick">{quick.map(m => <button type="button" key={m} onClick={() => { setMin(String(m)); setSec('0'); }}>{m} min</button>)}</div>
      <label className="hc-check"><input type="checkbox" checked={shake} onChange={e => setShake(e.target.checked)} /> {t('Przypomnij w połowie, żeby potrząsnąć / obrócić')}</label>
      {err && <p className="hc-err" role="alert">{err}</p>}
      <button className="hc-primary" type="submit" onClick={unlockAudio}>{t('Uruchom timer')}</button>
    </form>
    <div className="hc-stack">
      {timers.length === 0 ? <p className="hc-empty">{t('Brak aktywnych timerów. Wybierz danie albo ustaw czas powyżej.')}</p> : timers.map(tm => <TimerCard key={tm.id} tm={tm} />)}
    </div>
    <p className="subtle">{t('Timer działa niezależnie od urządzenia. Zostaw aplikację otwartą: ekran nie zgaśnie, dopóki timer odlicza. Pierwsze dotknięcie włącza dźwięk.')}</p>
  </div>;
}

/** Full-screen alarm for any finished kitchen timer, whichever module is open. */
export function KitchenAlarm() {
  const timers = useTimers();
  const ringing = timers.filter(x => x.done && !x.ack);
  useEffect(() => { const old = document.title; if (ringing.length) document.title = '⏰ ' + t('GOTOWE'); return () => { document.title = old; }; }, [ringing.length]);
  if (!ringing.length) return null;
  return <div className="hc-alarm" role="alertdialog" aria-labelledby="hc-alarm-title">
    <div className="hc-alarm-big">{t('GOTOWE')}</div>
    <h2 id="hc-alarm-title">{ringing.map(x => x.name).join(', ')}</h2>
    <p>{t('Wyjmij jedzenie. Mięso sprawdź termometrem.')}</p>
    <button className="hc-primary" autoFocus onClick={() => ringing.forEach(x => actOn(x.id, 'ack'))}>{t('Wyłącz alarm')}</button>
    <button className="hc-ghost" onClick={() => ringing.forEach(x => actOn(x.id, 'plus2'))}>{t('Jeszcze 2 min')}</button>
  </div>;
}

/** Toast for "shake it now" reminders. */
export function Toaster() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    let timer = 0;
    const on = (e: Event) => { setMsg(String((e as CustomEvent).detail)); window.clearTimeout(timer); timer = window.setTimeout(() => setMsg(''), 6000); };
    window.addEventListener(TOAST_EVENT, on);
    return () => { window.removeEventListener(TOAST_EVENT, on); window.clearTimeout(timer); };
  }, []);
  return msg ? <div className="hc-toast" role="status">{msg}</div> : null;
}

/** Compact "next timer" pill shown in the module bar when a kitchen timer is running elsewhere. */
export function TimerPill({ onOpen }: { onOpen: () => void }) {
  const timers = useTimers();
  const active = timers.filter(x => !x.ack && !x.done);
  useTick(active.some(x => !x.paused));
  if (!active.length) return null;
  const next = [...active].sort((a, b) => remaining(a) - remaining(b))[0];
  return <button className="hc-pill" onClick={onOpen} aria-label={t('Timery kuchenne') + ': ' + next.name}><Icon d={ICONS.timer} /><b>{clock(remaining(next))}</b>{active.length > 1 && <span>+{active.length - 1}</span>}</button>;
}
