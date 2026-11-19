// Coffee (bean) database: names the user has brewed, an optional package photo per coffee,
// and per-method summaries built from the rating history. Pure logic plus small storage helpers.
export const coffeesKey = 'cremalab.coffees.v1';
export const photosKey = 'cremalab.photos.v1';
export const MAX_COFFEES = 200;

export interface Coffee { id: string; name: string; ts: number; last: number }
export interface CoffeeStore { list: Coffee[]; current: string | null }
export interface HistEntry {
 ts: number; method: string; preset?: number; dose: number; ratio: number; temp?: number | null; grind?: number;
 grinder?: string; ldial?: number; ltime?: number; time?: number | null; stars: number; taste?: string; body?: string; coffee?: string | null;
}
export interface MethodSummary { method: string; count: number; avg: number; best: number }
export interface CoffeeSummary { count: number; avg: number; methods: MethodSummary[] }

/** Trim, collapse spaces, drop markup characters; empty means "no coffee". */
export function cleanName(raw: unknown): string {
 return String(raw ?? '').replace(/[<>"`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
}
const keyOf = (name: string) => cleanName(name).toLocaleLowerCase('pl');
export const findByName = (store: CoffeeStore, name: string) => store.list.find(c => keyOf(c.name) === keyOf(name)) || null;
export const findById = (store: CoffeeStore, id: string | null | undefined) => (id && store.list.find(c => c.id === id)) || null;

/** Add a coffee, or return the existing one with the same name (case-insensitive). */
export function addCoffee(store: CoffeeStore, raw: string, now = Date.now()): Coffee | null {
 const name = cleanName(raw); if (!name) return null;
 const found = findByName(store, name); if (found) { found.last = now; return found; }
 const coffee: Coffee = { id: 'c' + now.toString(36) + Math.random().toString(36).slice(2, 6), name, ts: now, last: now };
 store.list.unshift(coffee);
 store.list = store.list.slice(0, MAX_COFFEES);
 return coffee;
}
export function touch(store: CoffeeStore, id: string, now = Date.now()) { const c = findById(store, id); if (c) c.last = now; }
/** Most recently used first. */
export const recent = (store: CoffeeStore) => [...store.list].sort((a, b) => b.last - a.last);

/** Index of the best entry for a coffee and method: most stars, then the newest. */
export function bestEntry(hist: HistEntry[], coffee: string, method: string): number {
 let best = -1;
 hist.forEach((h, i) => {
  if (h.coffee !== coffee || h.method !== method) return;
  if (best < 0 || h.stars > hist[best].stars || (h.stars === hist[best].stars && h.ts > hist[best].ts)) best = i;
 });
 return best;
}
export function summarize(hist: HistEntry[], coffee: string): CoffeeSummary {
 const mine = hist.filter(h => h.coffee === coffee);
 const methods = [...new Set(mine.map(h => h.method))].map(method => {
  const rows = mine.filter(h => h.method === method);
  return { method, count: rows.length, avg: rows.reduce((s, h) => s + h.stars, 0) / rows.length, best: bestEntry(hist, coffee, method) };
 }).sort((a, b) => b.count - a.count);
 return { count: mine.length, avg: mine.length ? mine.reduce((s, h) => s + h.stars, 0) / mine.length : 0, methods };
}

export function validStore(v: unknown): v is CoffeeStore {
 if (!v || typeof v !== 'object') return false;
 const s = v as CoffeeStore;
 return Array.isArray(s.list) && s.list.length <= MAX_COFFEES && (s.current === null || typeof s.current === 'string')
  && s.list.every(c => c && typeof c.id === 'string' && /^[\w-]{1,40}$/.test(c.id) && typeof c.name === 'string' && c.name === cleanName(c.name) && c.name.length > 0
   && Number.isFinite(c.ts) && Number.isFinite(c.last));
}
export const validPhoto = (v: unknown) => typeof v === 'string' && v.length < 400_000 && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v);
export function validPhotos(v: unknown): v is Record<string, string> {
 return !!v && typeof v === 'object' && !Array.isArray(v) && Object.entries(v as object).every(([k, p]) => /^[\w-]{1,40}$/.test(k) && validPhoto(p));
}

export function loadStore(): CoffeeStore {
 try { const v = JSON.parse(localStorage.getItem(coffeesKey) || 'null'); if (validStore(v)) return v; } catch { /* fall through */ }
 return { list: [], current: null };
}
export function saveStore(store: CoffeeStore): boolean {
 try { localStorage.setItem(coffeesKey, JSON.stringify(store)); return true; } catch { return false; }
}
export function loadPhotos(): Record<string, string> {
 try { const v = JSON.parse(localStorage.getItem(photosKey) || '{}'); if (validPhotos(v)) return v; } catch { /* fall through */ }
 return {};
}
export function savePhoto(id: string, dataUrl: string | null): boolean {
 const photos = loadPhotos();
 if (dataUrl) photos[id] = dataUrl; else delete photos[id];
 try { localStorage.setItem(photosKey, JSON.stringify(photos)); return true; } catch { return false; }
}

/** Shrink a camera photo to a small JPEG thumbnail (longest side `size` px). */
export async function makeThumb(file: Blob, size = 320): Promise<string> {
 const url = URL.createObjectURL(file);
 try {
  const img = new Image(); img.src = url; await img.decode();
  const k = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d')!.drawImage(img, 0, 0, w, h);
  return c.toDataURL('image/jpeg', 0.72);
 } finally { URL.revokeObjectURL(url); }
}
