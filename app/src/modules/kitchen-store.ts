// Saved Kitchen OS session (one at a time). Own key, so coffee, timers, favourites and shopping
// data are never read or rewritten here. Invalid or unknown data falls back to a fresh plan.
import { useSyncExternalStore } from 'react';
import { recordBookCooking } from './cookbook-store';
import { defaultServeAt, isCookbookLoaded, onCookbookLoaded, PANKO_DINNER, recipeById, type Recipe } from './kitchen-data';
import { loadCookbook } from './cookbook-load';

export const KITCHEN_KEY = 'homecraft.kitchen.v1';
export interface KitchenSession {
  v: 1; recipe: string; serveAt: number; cooking: boolean; recorded?:boolean;
  started: Record<string, number>; done: Record<string, number>;
  /** Linked shared-timer ids by task id. */
  timers: Record<string, string>;
  /** Checked Mise en Place items (ingredients, equipment, preparation). */
  mise: string[];
}
const nums = (o: unknown, ids: Set<string>): Record<string, number> => {
  const out: Record<string, number> = {};
  if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (ids.has(k) && Number.isFinite(v)) out[k] = v as number;
  return out;
};
const fresh = (recipe: Recipe = PANKO_DINNER): KitchenSession => ({ v: 1, recipe: recipe.id, serveAt: defaultServeAt(recipe, Date.now()), cooking: false, started: {}, done: {}, timers: {}, mise: [] });
function load(): KitchenSession {
  try {
    const raw = JSON.parse(localStorage.getItem(KITCHEN_KEY) || 'null');
    const recipe = raw && raw.v === 1 && typeof raw.recipe === 'string' ? recipeById(raw.recipe) : undefined;
    // A saved cookbook recipe before the cookbook chunk arrives: keep the saved session untouched,
    // load the recipes and read it again (never fall back to a fresh plan and overwrite it).
    if (!recipe && raw && raw.v === 1 && typeof raw.recipe === 'string' && !isCookbookLoaded()) { pendingRecipe = raw.recipe; fetchSaved(); return fresh(); }
    if (!recipe || !Number.isFinite(raw.serveAt)) return fresh();
    // A plan left unstarted for more than 12 h is stale: offer a new serving time instead.
    if (!raw.cooking && raw.serveAt < Date.now() - 12 * 3600e3) return fresh(recipe);
    const ids = new Set(recipe.tasks.map(t => t.id));
    const mise = new Set([...recipe.ingredients, ...recipe.equipment, ...recipe.prep].map(x => x.id));
    const timers: Record<string, string> = {};
    if (raw.timers && typeof raw.timers === 'object') for (const [k, v] of Object.entries(raw.timers)) if (ids.has(k) && typeof v === 'string') timers[k] = v;
    return { v: 1, recipe: recipe.id, serveAt: raw.serveAt, cooking: !!raw.cooking, recorded: !!raw.recorded || recipe.tasks.every(t=>raw.done?.[t.id]!=null), started: nums(raw.started, ids), done: nums(raw.done, ids), timers,
      mise: Array.isArray(raw.mise) ? raw.mise.filter((x: unknown): x is string => typeof x === 'string' && mise.has(x)) : [] };
  } catch { return fresh(); }
}
let session: KitchenSession | null = null;
/** Saved recipe id waiting for the cookbook chunk; writes are held back until then. */
let pendingRecipe: string | null = null;
/** 'failed' = the recipes could not be loaded (e.g. offline before they were ever cached). Writes stay
 *  blocked in both states, so the saved session is never replaced by the sample dinner. */
let pendingState: 'loading' | 'failed' = 'loading';
export const isKitchenPending = () => pendingRecipe !== null;
export const kitchenPendingState = () => pendingState;
const listeners = new Set<() => void>();
/** New snapshot object so useSyncExternalStore re-renders, then notify. */
const touch = () => { if (session) session = { ...session }; listeners.forEach(l => l()); };
function fetchSaved() {
  pendingState = 'loading';
  loadCookbook().catch(() => { if (pendingRecipe) { pendingState = 'failed'; touch(); } });
}
const get = () => (session ??= load());
export const getKitchen = get;
export function setKitchen(update: (s: KitchenSession) => KitchenSession) {
  if (pendingRecipe) return; // the saved session is still loading: do not overwrite it
  const previous=get(), next=update(previous);
  const recipe=recipeById(next.recipe);
  // Count a completed session once even if the user undoes and rechecks the final task.
  if(recipe&&previous.recipe===next.recipe&&next.cooking&&!next.recorded&&recipe.tasks.every(t=>next.done[t.id]!=null)){
   recordBookCooking(next.recipe);next.recorded=true;
  }
  session=next;
  try { localStorage.setItem(KITCHEN_KEY, JSON.stringify(session)); } catch { /* storage blocked */ }
  listeners.forEach(l => l());
}
export const selectKitchenRecipe = (recipe: Recipe) => setKitchen(() => fresh(recipe));
export const resetKitchen = () => setKitchen(s => fresh(recipeById(s.recipe)));
const subscribe = (l: () => void) => { listeners.add(l); return () => { listeners.delete(l); }; };
export const useKitchen = () => useSyncExternalStore(subscribe, get, get);
if (typeof window !== 'undefined') window.addEventListener('storage', e => { if (e.key === KITCHEN_KEY) { pendingRecipe = null; session = load(); listeners.forEach(l => l()); } });
// The recipes arrived: read the saved session again (also after an earlier failed attempt).
onCookbookLoaded(() => { if (pendingRecipe) { pendingRecipe = null; session = load(); listeners.forEach(l => l()); } });
