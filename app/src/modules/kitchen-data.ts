// Kitchen OS: one cooking session planned backwards from the serving time.
// Pure data and scheduling (no DOM, no storage), so it is unit-tested in Node.
// Three views share it: Plan (Mission Control), Przygotuj (Mise en Place), Gotuj (Cooking Timeline).
// All times are estimates. The app never controls the appliance: settings are shown to set by hand.

/** Who or what is busy during a task. `hands` = the cook (one task at a time), `fryer` = the single
 *  Air Fryer basket (one load at a time), `wait` = passive time (soaking, resting), unlimited. */
export const LANES: { id: Lane; label: string }[] = [{ id: 'hands', label: 'Ty' }, { id: 'fryer', label: 'Air Fryer' }, { id: 'stove', label: 'Kuchenka' }, { id: 'oven', label: 'Piekarnik' }, { id: 'blender', label: 'Blender' }, { id: 'wait', label: 'Czeka' }];

export type { Recipe, KitchenTask, Ingredient, Lane } from './kitchen-types.ts';
import type { Recipe, KitchenTask, Lane } from './kitchen-types.ts';
export const PANKO_DINNER: Recipe = {
  id: 'panko-frytki-salatka',
  name: 'Kurczak w panko, frytki i sałatka',
  short: 'Kurczak w panko',
  servings: 2,
  note: 'Air Fryer COSORI 6 l ma jeden kosz, więc frytki i kurczak pieką się po kolei. Na końcu frytki wracają na 3 min, żeby były gorące i chrupiące.',
  ingredients: [
    { id: 'chicken', n: 'Pierś z kurczaka', q: '2 filety (ok. 500 g)' },
    { id: 'eggs', n: 'Jajka', q: '2 szt.' },
    { id: 'panko', n: 'Panko', q: '80 g' },
    { id: 'flour', n: 'Mąka pszenna', q: '3 łyżki' },
    { id: 'spices', n: 'Sól, pieprz, słodka papryka', q: 'do smaku' },
    { id: 'potatoes', n: 'Ziemniaki', q: '700 g' },
    { id: 'oil', n: 'Olej', q: '1 łyżka + spray' },
    { id: 'lettuce', n: 'Mix sałat', q: '150 g' },
    { id: 'tomato', n: 'Pomidor', q: '1 szt.' },
    { id: 'cucumber', n: 'Ogórek', q: '½ szt.' },
    { id: 'olive', n: 'Oliwa', q: '2 łyżki' },
    { id: 'lemon', n: 'Cytryna', q: '½ szt.' },
    { id: 'honey', n: 'Miód i musztarda', q: 'po 1 łyżeczce' },
  ],
  equipment: [
    { id: 'fryer', n: 'Air Fryer COSORI 6 l' },
    { id: 'boards', n: 'Dwie deski (osobna do surowego mięsa) i nóż' },
    { id: 'bowl', n: 'Duża miska z zimną wodą' },
    { id: 'towels', n: 'Ręczniki kuchenne' },
    { id: 'plates', n: '3 płaskie talerze: mąka, jajko, panko' },
    { id: 'thermo', n: 'Termometr do mięsa' },
    { id: 'salad', n: 'Miska na sałatkę i słoik na dressing' },
  ],
  prep: [
    { id: 'clean', n: 'Czysty blat i miejsce obok Air Fryera' },
    { id: 'basket', n: 'Pusty kosz Air Fryera (bez papieru przy rozgrzewaniu)' },
    { id: 'fridge', n: 'Kurczak w lodówce do czasu panierowania' },
  ],
  tasks: [
    { id: 'cut', title: 'Pokrój ziemniaki w słupki', detail: 'Słupki ok. 1 cm. Skórkę możesz zostawić.', lane: 'hands', min: 10, after: [] },
    { id: 'soak', title: 'Namaczaj frytki w zimnej wodzie', detail: 'Woda wypłukuje skrobię, więc frytki będą chrupiące. W tym czasie masz wolne ręce.', lane: 'wait', min: 30, after: ['cut'], timer: { name: 'Namaczanie frytek' } },
    { id: 'bread', title: 'Rozbij i panieruj kurczaka', detail: 'Rozbij piersi na równą grubość 1,5–2 cm, dopraw. Mąka → jajko → panko, dociśnij panierkę i odłóż na talerz.', lane: 'hands', min: 15, after: [], safety: 'Surowy drób: osobna deska, potem umyj ręce i deskę.' },
    { id: 'dry', title: 'Osusz frytki i wymieszaj z olejem', detail: 'Dokładnie osusz ręcznikiem, wymieszaj z 1 łyżką oleju. Sól dopiero po pieczeniu.', lane: 'hands', min: 5, after: ['soak'] },
    { id: 'preheat', title: 'Rozgrzej Air Fryer', detail: 'Ustaw ręcznie: PREHEAT, 200 °C. Pusty kosz, bez papieru.', lane: 'fryer', min: 3, after: [], fryer: { mode: 'PREHEAT', temp: 200 }, timer: { name: 'Rozgrzewanie Air Fryera' } },
    { id: 'fries', title: 'Frytki do Air Fryera', detail: 'Wsyp do rozgrzanego kosza, maks. do połowy. Potrząśnij koszem dwa razy, aplikacja przypomni.', lane: 'fryer', min: 20, after: ['dry', 'preheat'], fryer: { mode: 'AIR FRY', temp: 200 }, timer: { name: 'Frytki', marks: [0.4, 0.75], act: 'Potrząśnij kosz' } },
    { id: 'chicken', title: 'Kurczak do Air Fryera', detail: 'Przełóż frytki do miski i przykryj. Ułóż kurczaka jedną warstwą, spryskaj olejem. Obróć w połowie.', lane: 'fryer', min: 12, after: ['fries', 'bread'], fryer: { mode: 'AIR FRY', temp: 200 }, timer: { name: 'Kurczak panko', marks: [0.5], act: 'Obróć kurczaka' }, safety: 'Gotowy dopiero przy min. 75 °C w najgrubszym miejscu.' },
    { id: 'salad', title: 'Przygotuj sałatkę i dressing', detail: 'Umyj i osusz sałatę, pokrój pomidora i ogórka. W słoiku wymieszaj oliwę, sok z cytryny, miód i musztardę.', lane: 'hands', min: 10, after: [] },
    { id: 'rest', title: 'Kurczak odpoczywa, sprawdź temperaturę', detail: 'Wbij termometr w najgrubsze miejsce. Jeśli jest poniżej 75 °C, dopiecz 2–3 min.', lane: 'wait', min: 3, after: ['chicken'], timer: { name: 'Kurczak odpoczywa' }, safety: 'Kolor panierki nie mówi, czy mięso jest gotowe. Decyduje termometr.' },
    { id: 'recrisp', title: 'Frytki na 3 min do kosza', detail: 'Wsyp frytki z powrotem, żeby znów były gorące i chrupiące.', lane: 'fryer', min: 3, after: ['chicken'], fryer: { mode: 'AIR FRY', temp: 200 }, timer: { name: 'Frytki: dogrzanie' } },
    { id: 'serve', title: 'Polej sałatkę i podawaj', detail: 'Dressing dodaj tuż przed podaniem. Posól frytki.', lane: 'hands', min: 2, after: ['rest', 'recrisp', 'salad'] },
  ],
};
// Recipe registry. Kitchen OS starts with the sample dinner; the 600 cookbook recipes (~250 KB) live in
// cookbook-all.ts, loaded after the first screen or when the book opens (see cookbook-load.ts).
// The array is filled in place, so every importer sees the same list once it is registered.
export const RECIPES: Recipe[] = [PANKO_DINNER];
let cookbookReady = false;
const registryListeners = new Set<() => void>();
export const isCookbookLoaded = () => cookbookReady;
export const onCookbookLoaded = (l: () => void) => { registryListeners.add(l); return () => { registryListeners.delete(l); }; };
export function registerCookbook(list: readonly Recipe[]) {
  if (cookbookReady) return;
  const known = new Set(RECIPES.map(r => r.id));
  RECIPES.push(...list.filter(r => !known.has(r.id)));
  cookbookReady = true;
  registryListeners.forEach(l => l());
}
export const recipeById = (id: string) => RECIPES.find(r => r.id === id);

export interface Planned extends KitchenTask { start: number; end: number }
const MIN = 60000;

/** Backward ("as late as possible") list scheduling: every task ends right before the earliest of its
 *  successors, the last ones end at `serveAt`. `hands` and `fryer` take one task at a time, so a task
 *  that would overlap another on the same lane moves earlier. Deterministic for a given recipe. */
export function schedule(recipe: Recipe, serveAt: number): Planned[] {
  const tasks = recipe.tasks, order = new Map(tasks.map((t, i) => [t.id, i]));
  const succ = new Map<string, string[]>(tasks.map(t => [t.id, []]));
  for (const t of tasks) for (const d of t.after) succ.get(d)?.push(t.id);
  const placed = new Map<string, Planned>();
  const busy: Record<Lane, { start: number; end: number }[]> = { hands: [], fryer: [], stove: [], oven: [], blender: [], wait: [] };
  while (placed.size < tasks.length) {
    const ready = tasks.filter(t => !placed.has(t.id) && succ.get(t.id)!.every(s => placed.has(s)));
    if (!ready.length) throw new Error('Cykl zależności w przepisie ' + recipe.id);
    const bound = (t: KitchenTask) => Math.min(serveAt, ...succ.get(t.id)!.map(s => placed.get(s)!.start));
    ready.sort((a, b) => bound(b) - bound(a) || order.get(b.id)! - order.get(a.id)!);
    const t = ready[0], d = t.min * MIN;
    let end = bound(t);
    const resources = [...new Set([t.lane, ...(t.resources || [])])].filter(l => l !== 'wait');
    if (resources.length) {
      for (let moved = true; moved;) {
        moved = false;
        for (const resource of resources) for (const iv of busy[resource]) if (end - d < iv.end && end > iv.start) { end = iv.start; moved = true; }
      }
      for (const resource of resources) busy[resource].push({ start: end - d, end });
    }
    placed.set(t.id, { ...t, start: end - d, end });
  }
  const lane = (l: Lane) => LANES.findIndex(x => x.id === l);
  return tasks.map(t => placed.get(t.id)!).sort((a, b) => a.start - b.start || lane(a.lane) - lane(b.lane) || order.get(a.id)! - order.get(b.id)!);
}

/** Total time from the first task to serving, in minutes. */
export const totalMinutes = (recipe: Recipe) => { const p = schedule(recipe, 0); return Math.round(-Math.min(...p.map(t => t.start)) / MIN); };
export const handsMinutes = (recipe: Recipe) => recipe.tasks.filter(t => t.lane === 'hands' || t.resources?.includes('hands')).reduce((s, t) => s + t.min, 0);

/** First sensible serving time: now + the whole plan + a little slack, rounded up to 15 minutes. */
export function defaultServeAt(recipe: Recipe, now: number) {
  const d = new Date(now + (totalMinutes(recipe) + 10) * MIN);
  d.setSeconds(0, 0);
  const m = d.getMinutes(), up = (15 - m % 15) % 15;
  return d.getTime() + up * MIN;
}
/** Earliest possible serving time if cooking started right now (rounded up to a whole minute). */
export const earliestServeAt = (recipe: Recipe, now: number) => Math.ceil((now + totalMinutes(recipe) * MIN) / MIN) * MIN;

/** "HH:MM" on a given day → timestamp; an earlier time than `now` means tomorrow. */
export function timeToday(hhmm: string, now: number): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  const d = new Date(now); d.setHours(+m[1], +m[2], 0, 0);
  if (d.getTime() < now - 60 * MIN) d.setDate(d.getDate() + 1);
  return d.getTime();
}
export const hhmm = (ms: number) => { const d = new Date(ms); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
export const minLabel = (m: number) => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`;

// ---- progress during cooking -----------------------------------------------------------------
export interface Progress { started: Record<string, number>; done: Record<string, number> }
export interface Status {
  /** Tasks to do now: started and not finished, or due now with all prerequisites finished. */
  now: Planned[];
  /** The next pending tasks (not due yet), soonest first. */
  next: Planned[];
  /** Prerequisites that block a due task, by task id. */
  blocked: Record<string, string[]>;
  /** How far behind the plan the session is, in whole minutes (0 when on time or ahead). */
  lateMin: number;
  /** Expected serving time including the delay. */
  finishAt: number;
  doneCount: number; total: number; finished: boolean;
}
export function status(plan: Planned[], p: Progress, now: number, serveAt: number): Status {
  const done = (id: string) => p.done[id] != null;
  const ready = (t: Planned) => t.after.every(done);
  const open = plan.filter(t => !done(t.id));
  // A step becomes "now" up to a minute before its planned start (times are rounded to minutes).
  const due = (t: Planned) => t.start - MIN <= now;
  const nowTasks = open.filter(t => p.started[t.id] != null || (due(t) && ready(t)));
  const blocked: Record<string, string[]> = {};
  for (const t of open) if (p.started[t.id] == null && due(t) && !ready(t)) blocked[t.id] = t.after.filter(id => !done(id));
  const next = open.filter(t => !nowTasks.includes(t)).slice(0, 3);
  let late = 0;
  for (const t of open) {
    // Work by hand has no start button, so it only counts as late once its planned end has passed.
    // Timed tasks (Air Fryer, soaking, resting) are late as soon as they miss their start.
    const s = p.started[t.id];
    if (t.lane === 'hands') late = Math.max(late, now - t.end);
    else if (s == null) late = Math.max(late, now - t.start);
    else late = Math.max(late, s + t.min * MIN - t.end);
  }
  const lateMin = Math.max(0, Math.floor(late / MIN));
  const doneCount = plan.length - open.length;
  return { now: nowTasks, next, blocked, lateMin, finishAt: serveAt + lateMin * MIN, doneCount, total: plan.length, finished: open.length === 0 };
}
