// Shared kitchen timers for the Air Fryer and Home modules. They are independent of the
// coffee brewing engine, survive reloads (absolute end time in localStorage), keep the screen
// awake while counting and ring/vibrate when finished or when a "shake it" mark is reached.
import { useEffect, useState, useSyncExternalStore } from 'react';

export interface KTimer {
  id: string; name: string; total: number; endAt: number; paused: boolean; remain: number;
  marks: number[]; fired: number[]; act: string; meta: string; done: boolean; ack: boolean;
  /** Advanced options (all optional so older saved timers keep working). */
  pre?: number; rep?: number; rnd?: number; mute?: boolean; vib?: boolean;
}
export interface TimerOptions { marks?: number[]; act?: string; meta?: string; pre?: number; rep?: number; mute?: boolean; vib?: boolean }
const KEY = 'homecraft.timers.v1';
const load = (): KTimer[] => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.filter(t => t && typeof t.id === 'string' && Number.isFinite(t.total) && Number.isFinite(t.endAt)).slice(0, 20);
  } catch { return []; }
};
let timers: KTimer[] = load();
const listeners = new Set<() => void>();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(timers)); } catch { /* storage full or blocked */ } };
const emit = () => { timers = [...timers]; persist(); listeners.forEach(l => l()); };
export const remaining = (t: KTimer) => t.paused ? t.remain : (t.endAt - Date.now()) / 1000;
for (const t of timers) if (!t.paused && !t.done && remaining(t) <= 0) t.done = true;

export const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const getTimers = () => timers;
export const useTimers = () => useSyncExternalStore(subscribe, getTimers, getTimers);
/** Re-render every `ms` while `active`, so countdowns stay live. */
export function useTick(active: boolean, ms = 250) {
  const [, set] = useState(0);
  useEffect(() => { if (!active) return; const id = setInterval(() => set(n => n + 1), ms); return () => clearInterval(id); }, [active, ms]);
}

export function clock(sec: number) {
  sec = Math.max(0, Math.ceil(sec));
  const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0');
}

// ---- sound -------------------------------------------------------------------------------
let ac: AudioContext | null = null;
export function unlockAudio() {
  try {
    if (!ac) { const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; ac = new C(); }
    if (ac.state === 'suspended') void ac.resume();
  } catch { /* no audio */ }
}
if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', unlockAudio, { passive: true });
  document.addEventListener('keydown', unlockAudio);
}
function beep(freq: number, dur: number, when = 0) {
  if (!ac) return;
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + when;
  o.type = 'square'; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
const vibrate = (p: number[], on = true) => { if (!on) return; try { navigator.vibrate?.(p); } catch { /* unsupported */ } };
export const soundMark = (mute = false, vib = true) => { if (!mute) { beep(988, .12); beep(988, .12, .18); } vibrate([150, 80, 150], vib); };
export const soundDone = (mute = false, vib = true) => { if (!mute) { [0, .2, .4].forEach(w => beep(1319, .14, w)); [.8, 1, 1.2].forEach(w => beep(1568, .14, w)); } vibrate([300, 120, 300, 120, 300], vib); };

// ---- wake lock ---------------------------------------------------------------------------
let wl: WakeLockSentinel | null = null;
async function syncWake() {
  const need = timers.some(t => !t.paused && !t.done);
  try {
    if (need && !wl && navigator.wakeLock) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); }
    else if (!need && wl) { await wl.release(); wl = null; }
  } catch { wl = null; }
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void syncWake(); });

// ---- actions -----------------------------------------------------------------------------
export function addTimer(name: string, total: number, marksOrOpts: number[] | TimerOptions = [], act = 'Potrząśnij kosz', meta = '') {
  unlockAudio();
  const o: TimerOptions = Array.isArray(marksOrOpts) ? { marks: marksOrOpts, act, meta } : marksOrOpts;
  const rep = Math.max(1, Math.min(20, Math.round(o.rep || 1)));
  timers.unshift({ id: Date.now() + Math.random().toString(36).slice(2, 6), name: name || 'Timer', total, endAt: Date.now() + total * 1000, paused: false, remain: total, marks: o.marks || [], fired: [], act: o.act ?? 'Potrząśnij kosz', meta: o.meta ?? '', done: false, ack: false,
    pre: o.pre && o.pre < total ? o.pre : 0, rep, rnd: 1, mute: !!o.mute, vib: o.vib !== false });
  if (timers.length > 20) timers.length = 20;
  emit(); void syncWake();
}
export type TimerAction = 'pause' | 'plus1' | 'plus2' | 'reset' | 'ack' | 'del';
export function actOn(id: string, a: TimerAction) {
  const t = timers.find(x => x.id === id); if (!t) return;
  if (a === 'pause') { if (t.paused) { t.endAt = Date.now() + t.remain * 1000; t.paused = false; } else { t.remain = remaining(t); t.paused = true; } }
  if (a === 'plus1') { if (t.paused) t.remain += 60; else t.endAt += 60000; t.total += 60; }
  if (a === 'plus2') { t.total += 120; t.endAt = Date.now() + 120000; t.remain = 120; t.done = false; t.ack = false; t.paused = false; t.marks = []; }
  if (a === 'reset') { t.rnd = 1; t.endAt = Date.now() + t.total * 1000; t.remain = t.total; t.paused = false; t.fired = []; t.done = false; t.ack = false; }
  if (a === 'ack' || a === 'del') timers = timers.filter(x => x.id !== id);
  emit(); void syncWake();
}

// ---- engine tick (module level, runs once) -----------------------------------------------
export const TOAST_EVENT = 'homecraft:toast';
const toast = (message: string) => window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
export const PRE_MSG = (sec: number) => sec >= 60 ? `${Math.round(sec / 60)} min` : `${sec} s`;
let ringing: ReturnType<typeof setInterval> | null = null;
function tick() {
  let changed = false;
  for (const t of timers) {
    if (t.paused || t.done) continue;
    const r = remaining(t), el = t.total - r;
    for (const m of t.marks) if (el >= m && !t.fired.includes(m) && r > 3) { t.fired.push(m); changed = true; soundMark(t.mute, t.vib); toast(`${t.act} — ${t.name}`); }
    if (t.pre && r <= t.pre && !t.fired.includes(-1) && r > 0) { t.fired.push(-1); changed = true; soundMark(t.mute, t.vib); toast(`Zostało ${PRE_MSG(t.pre)} — ${t.name}`); }
    if (r <= 0) {
      changed = true;
      if ((t.rnd || 1) < (t.rep || 1)) { t.rnd = (t.rnd || 1) + 1; t.endAt = Date.now() + t.total * 1000; t.fired = []; soundMark(t.mute, t.vib); toast(`${t.name}: ${t.rnd}/${t.rep}`); }
      else t.done = true;
    }
  }
  const anyRinging = timers.some(t => t.done && !t.ack);
  const loud = () => { const r = timers.filter(t => t.done && !t.ack); soundDone(r.every(t => t.mute), r.some(t => t.vib !== false)); };
  if (anyRinging && !ringing) { loud(); let n = 0; ringing = setInterval(() => { if (++n > 40 || !timers.some(t => t.done && !t.ack)) { clearInterval(ringing!); ringing = null; return; } loud(); }, 2200); }
  if (changed) { emit(); void syncWake(); }
}
if (typeof window !== 'undefined') { setInterval(tick, 250); void syncWake(); }

// ---- preset handed from a recipe to the timer dial (e.g. tap the time next to a dish) ---------
export interface Preset { sec: number; name: string; meta: string; marks?: number[]; act?: string }
let preset: Preset | null = null;
export const setPreset = (p: Preset) => { preset = p; };
export const peekPreset = () => preset;
export const clearPreset = () => { preset = null; };
