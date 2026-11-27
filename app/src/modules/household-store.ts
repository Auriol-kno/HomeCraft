export const PANTRY_KEY = 'homecraft.pantry.v1';
export const EXPENSE_KEY = 'homecraft.expenses.v1';

export const PANTRY_LOCATIONS = ['Lodówka', 'Zamrażarka', 'Spiżarnia'] as const;
export const PANTRY_CATEGORIES = ['Warzywa i owoce', 'Nabiał i jajka', 'Mięso i ryby', 'Produkty suche', 'Napoje', 'Inne'] as const;
export const PANTRY_UNITS = ['szt.', 'g', 'kg', 'ml', 'l', 'opak.'] as const;
export const EXPIRY_TYPES = ['Należy spożyć do', 'Najlepiej spożyć przed'] as const;
export const EXPENSE_CATEGORIES = ['Żywność', 'Napoje', 'Chemia i dom', 'Jedzenie na mieście', 'Inne'] as const;

export type PantryLocation = typeof PANTRY_LOCATIONS[number];
export type PantryCategory = typeof PANTRY_CATEGORIES[number];
export type PantryUnit = typeof PANTRY_UNITS[number];
export type ExpiryType = typeof EXPIRY_TYPES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: PantryUnit;
  location: PantryLocation;
  category: PantryCategory;
  expiresAt?: string;
  expiryType: ExpiryType;
  minimum: number;
  unitPrice: number;
  updatedAt: number;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  amount: number;
  category: ExpenseCategory;
  store: string;
  note: string;
}

export interface ExpenseState { budgets: Record<string,number>; entries: ExpenseEntry[] }

export const MAX_VALUE = 1_000_000;
export const MAX_PANTRY_ITEMS = 500;
export const MAX_EXPENSE_ENTRIES = 2000;
const finite = (v: unknown, min = 0, max = MAX_VALUE) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const date = (v: unknown) => { if(typeof v!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false; const [y,m,d]=v.split('-').map(Number), parsed=new Date(Date.UTC(y,m-1,d)); return parsed.getUTCFullYear()===y&&parsed.getUTCMonth()===m-1&&parsed.getUTCDate()===d; };
const oneOf = <T extends readonly string[]>(v: unknown, choices: T): v is T[number] => typeof v === 'string' && choices.includes(v);

export function validatePantry(raw: unknown): PantryItem[] | null {
  if (!raw || typeof raw !== 'object' || (raw as {v?:unknown}).v !== 1 || !Array.isArray((raw as {items?:unknown}).items)) return null;
  const out: PantryItem[] = [], ids=new Set<string>();
  for (const x of (raw as {items:unknown[]}).items.slice(0, MAX_PANTRY_ITEMS)) {
    if (!x || typeof x !== 'object') continue;
    const p = x as Record<string, unknown>;
    if (typeof p.id !== 'string' || !p.id || ids.has(p.id) || typeof p.name !== 'string' || !p.name.trim() || !finite(p.quantity) || !oneOf(p.unit, PANTRY_UNITS) || !oneOf(p.location, PANTRY_LOCATIONS) || !oneOf(p.category, PANTRY_CATEGORIES) || !oneOf(p.expiryType,EXPIRY_TYPES) || !finite(p.minimum) || !finite(p.unitPrice) || !finite(p.updatedAt, 1,Number.MAX_SAFE_INTEGER)) continue;
    if (p.expiresAt !== undefined && p.expiresAt !== '' && !date(p.expiresAt)) continue;
    ids.add(p.id); out.push({ id:p.id.slice(0,80), name:p.name.trim().slice(0,80), quantity:p.quantity as number, unit:p.unit, location:p.location, category:p.category, expiresAt:p.expiresAt ? String(p.expiresAt) : undefined, expiryType:p.expiryType, minimum:p.minimum as number, unitPrice:p.unitPrice as number, updatedAt:p.updatedAt as number });
  }
  return out;
}

export function validateExpenses(raw: unknown): ExpenseState | null {
  if (!raw || typeof raw !== 'object' || (raw as {v?:unknown}).v !== 1 || !(raw as {budgets?:unknown}).budgets || typeof (raw as {budgets?:unknown}).budgets !== 'object' || Array.isArray((raw as {budgets?:unknown}).budgets) || !Array.isArray((raw as {entries?:unknown}).entries)) return null;
  const budgets:Record<string,number>={}; for(const [month,value] of Object.entries((raw as {budgets:Record<string,unknown>}).budgets).slice(0,120)){if(!/^\d{4}-\d{2}$/.test(month)||!finite(value))return null;budgets[month]=value as number;}
  const entries: ExpenseEntry[] = [], ids=new Set<string>();
  for (const x of (raw as {entries:unknown[]}).entries.slice(0, MAX_EXPENSE_ENTRIES)) {
    if (!x || typeof x !== 'object') continue;
    const p = x as Record<string, unknown>;
    if (typeof p.id !== 'string' || !p.id || ids.has(p.id) || !date(p.date) || !finite(p.amount, 0.01) || !oneOf(p.category, EXPENSE_CATEGORIES) || typeof p.store !== 'string' || typeof p.note !== 'string') continue;
    ids.add(p.id); entries.push({ id:p.id.slice(0,80), date:p.date as string, amount:Math.round((p.amount as number)*100)/100, category:p.category, store:p.store.trim().slice(0,80), note:p.note.trim().slice(0,120) });
  }
  return { budgets, entries };
}

export function loadPantry(storage: Pick<Storage,'getItem'>): PantryItem[] {
  try { const text=storage.getItem(PANTRY_KEY); if (!text) return []; return validatePantry(JSON.parse(text)) ?? []; } catch { return []; }
}
export function loadExpenses(storage: Pick<Storage,'getItem'>): ExpenseState {
  try { const text=storage.getItem(EXPENSE_KEY); if (!text) return {budgets:{},entries:[]}; return validateExpenses(JSON.parse(text)) ?? {budgets:{},entries:[]}; } catch { return {budgets:{},entries:[]}; }
}
export const pantryEnvelope = (items: PantryItem[]) => JSON.stringify({v:1,items});
export const expenseEnvelope = (state: ExpenseState) => JSON.stringify({v:1,...state});

export function daysUntil(iso: string | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const today=Date.UTC(now.getFullYear(),now.getMonth(),now.getDate());
  return Math.ceil((Date.parse(`${iso}T00:00:00Z`)-today)/86_400_000);
}
export const isLow = (item: PantryItem) => item.minimum > 0 && item.quantity <= item.minimum;
export const pantryValue = (items: PantryItem[]) => Math.round(items.reduce((sum,x)=>sum+x.quantity*x.unitPrice,0)*100)/100;
export const monthKey = (iso: string) => iso.slice(0,7);
export const monthTotal = (state: ExpenseState, month: string) => Math.round(state.entries.filter(x=>monthKey(x.date)===month).reduce((sum,x)=>sum+x.amount,0)*100)/100;
export function categoryTotals(state: ExpenseState, month: string): {category:ExpenseCategory;amount:number}[] {
  return EXPENSE_CATEGORIES.map(category=>({category,amount:Math.round(state.entries.filter(x=>monthKey(x.date)===month&&x.category===category).reduce((s,x)=>s+x.amount,0)*100)/100})).filter(x=>x.amount>0).sort((a,b)=>b.amount-a.amount);
}
