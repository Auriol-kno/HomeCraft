// Product photos for "Moja lodówka". A photo belongs to the product name (not to one stock row), so the
// same icon comes back when the product is added again. Photos are cropped to a 256 px square JPEG
// (~15–30 KB) and kept in IndexedDB on this device only: localStorage is too small for images, and the
// JSON backup does not include them.
import { useSyncExternalStore } from 'react';

export const PHOTO_SIZE = 256;
const DB = 'homecraft-photos', STORE = 'pantry', VERSION = 1;

/** Product name → photo key: case, extra spaces and Polish diacritics do not matter. */
export const photoKey = (name: string) => name.toLocaleLowerCase('pl').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l').replace(/\s+/g, ' ').trim().slice(0, 80);

/** Centre square crop of a w × h image, as source rectangle. */
export function squareCrop(w: number, h: number) { const side = Math.min(w, h); return { sx: Math.round((w - side) / 2), sy: Math.round((h - side) / 2), side }; }

let dbPromise: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  return dbPromise ??= new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no IndexedDB')); return; }
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => { if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(req.error); };
  });
}
function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(db => new Promise<T>((resolve, reject) => {
    const r = run(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  }));
}

// In-memory map key → object URL, shared by every component.
const urls = new Map<string, string>();
let loaded = false, version = 0;
const listeners = new Set<() => void>();
const notify = () => { version++; listeners.forEach(l => l()); };
async function loadAll() {
  if (loaded) return; loaded = true;
  try {
    const db = await open();
    await new Promise<void>((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).openCursor();
      req.onsuccess = () => { const c = req.result; if (!c) { resolve(); return; } if (c.value instanceof Blob && typeof c.key === 'string') urls.set(c.key, URL.createObjectURL(c.value)); c.continue(); };
      req.onerror = () => reject(req.error);
    });
    notify();
  } catch { /* no IndexedDB (e.g. private mode): items simply show their initial letter */ }
}
const subscribe = (l: () => void) => { listeners.add(l); void loadAll(); return () => { listeners.delete(l); }; };
/** Re-renders when photos change; read URLs with `photoUrl`. */
export const usePhotos = () => useSyncExternalStore(subscribe, () => version, () => version);
export const photoUrl = (name: string) => urls.get(photoKey(name));

/** Decode any image the browser can show (JPEG, PNG, HEIC in Safari), crop square, scale, compress. */
async function toSquareJpeg(file: Blob): Promise<Blob> {
  let source: CanvasImageSource, w: number, h: number, cleanup = () => {};
  try { const bmp = await createImageBitmap(file); source = bmp; w = bmp.width; h = bmp.height; cleanup = () => bmp.close(); }
  catch {
    const url = URL.createObjectURL(file), img = new Image(); img.src = url;
    await img.decode(); source = img; w = img.naturalWidth; h = img.naturalHeight; cleanup = () => URL.revokeObjectURL(url);
  }
  try {
    const { sx, sy, side } = squareCrop(w, h);
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = PHOTO_SIZE;
    const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('no canvas');
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(source, sx, sy, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error('encode')), 'image/jpeg', 0.82));
  } finally { cleanup(); }
}

export async function setPhoto(name: string, file: Blob): Promise<void> {
  const key = photoKey(name); if (!key) throw new Error('empty name');
  const blob = await toSquareJpeg(file);
  await tx('readwrite', s => s.put(blob, key));
  const old = urls.get(key); if (old) URL.revokeObjectURL(old);
  urls.set(key, URL.createObjectURL(blob)); notify();
}
export async function removePhoto(name: string): Promise<void> {
  const key = photoKey(name);
  await tx('readwrite', s => s.delete(key));
  const old = urls.get(key); if (old) URL.revokeObjectURL(old);
  urls.delete(key); notify();
}
