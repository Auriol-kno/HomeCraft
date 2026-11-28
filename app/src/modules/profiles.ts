// User profiles: a named snapshot of every app setting, stored on this device (homecraft.profiles.v1).
// A profile holds settings only: appearance and language, brewing parameters and alerts, and the
// "Mój sprzęt" choice with its service intervals. History, coffees, recipes, fridge and expenses are
// shared data and are never overwritten when a profile is switched.

export const PROFILES_KEY = 'homecraft.profiles.v1';
export const PREFS_KEY = 'cremalab.preferences.v1';
export const BREW_KEY = 'cremalab.iphone.v3';
export const GEAR_KEY_P = 'homecraft.coffeegear.v1';
/** Brewing-engine fields that are settings (not history or service counters). */
export const BREW_FIELDS = ['method', 'pre', 'pidx', 'params', 'grinder', 'lelit', 'milk', 'roast', 'alerts'] as const;
export const MAX_PROFILES = 8;

export interface ProfileData { prefs?: Record<string, unknown>; brew?: Record<string, unknown>; gear?: Record<string, unknown> }
export interface Profile { id: string; name: string; savedAt: number; data: ProfileData }
export interface ProfilesState { v: 1; active: string | null; list: Profile[] }
type Store = Pick<Storage, 'getItem' | 'setItem'>;

const obj = (x: unknown): Record<string, unknown> | undefined => x && typeof x === 'object' && !Array.isArray(x) ? x as Record<string, unknown> : undefined;
const json = (raw: string | null) => { try { return obj(JSON.parse(raw || 'null')); } catch { return undefined; } };
export const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 40);

export function parseProfiles(raw: string | null): ProfilesState {
  const v = json(raw);
  if (!v || v.v !== 1 || !Array.isArray(v.list)) return { v: 1, active: null, list: [] };
  const list: Profile[] = [];
  for (const p of v.list) {
    const o = obj(p), data = obj(o?.data);
    if (!o || !data || typeof o.id !== 'string' || typeof o.name !== 'string' || !cleanName(o.name) || typeof o.savedAt !== 'number') continue;
    if (list.some(x => x.id === o.id) || list.length >= MAX_PROFILES) continue;
    const d: ProfileData = {};
    for (const k of ['prefs', 'brew', 'gear'] as const) { const x = obj(data[k]); if (x) d[k] = x; }
    list.push({ id: o.id, name: cleanName(o.name), savedAt: o.savedAt, data: d });
  }
  const active = typeof v.active === 'string' && list.some(p => p.id === v.active) ? v.active : null;
  return { v: 1, active, list };
}

/** Current settings of the app, read from their own storage keys. */
export function snapshot(store: Store): ProfileData {
  const brew = json(store.getItem(BREW_KEY)), out: ProfileData = {};
  const prefs = json(store.getItem(PREFS_KEY)), gear = json(store.getItem(GEAR_KEY_P));
  if (prefs) out.prefs = prefs;
  if (brew) { const b: Record<string, unknown> = {}; for (const k of BREW_FIELDS) if (k in brew) b[k] = brew[k]; out.brew = b; }
  if (gear) out.gear = gear;
  return out;
}

/** Write a profile's settings back. Brewing history and other fields in the engine state are kept. */
export function applySnapshot(store: Store, data: ProfileData) {
  if (data.prefs) store.setItem(PREFS_KEY, JSON.stringify(data.prefs));
  if (data.brew) {
    const cur = json(store.getItem(BREW_KEY)) ?? {}, next: Record<string, unknown> = { ...cur };
    for (const k of BREW_FIELDS) if (k in data.brew) next[k] = data.brew[k];
    store.setItem(BREW_KEY, JSON.stringify(next));
  }
  if (data.gear) store.setItem(GEAR_KEY_P, JSON.stringify(data.gear));
}

const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
/** Save current settings under a name (same name, case-insensitive, overwrites that profile). */
export function saveProfile(state: ProfilesState, name: string, data: ProfileData, now: number): ProfilesState | null {
  const n = cleanName(name); if (!n) return null;
  const same = state.list.find(p => p.name.toLocaleLowerCase('pl') === n.toLocaleLowerCase('pl'));
  if (!same && state.list.length >= MAX_PROFILES) return null;
  const p: Profile = { id: same?.id ?? newId(), name: n, savedAt: now, data };
  return { v: 1, active: p.id, list: same ? state.list.map(x => x.id === p.id ? p : x) : [...state.list, p] };
}
export const removeProfile = (state: ProfilesState, id: string): ProfilesState =>
  ({ v: 1, active: state.active === id ? null : state.active, list: state.list.filter(p => p.id !== id) });
