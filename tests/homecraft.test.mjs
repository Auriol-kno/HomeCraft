// Unit tests for the Air Fryer and Dom data/logic (pure TypeScript, no browser needed).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISHES, MODES, MODE_ORDER, FRYER_CATEGORIES, norm } from '../app/src/modules/fryer-data.ts';
import { convert, INGREDIENTS, eggSeconds, EGG_BOIL, FOODS, FOOD_CATEGORIES, METHODS, cToF, fToC, num, kitchenGrams } from '../app/src/modules/home-data.ts';

// --- Air Fryer: the 37 dishes of the original cheat sheet ---
assert.equal(DISHES.length, 37);
assert.equal(new Set(DISHES.map(d => d.id)).size, DISHES.length, 'dish ids are unique');
for (const d of DISHES) {
  assert(MODES[d.m], `${d.id}: known mode`);
  assert(d.t >= 30 && d.t <= 230, `${d.id}: temperature within 30–230 °C`);
  assert(Number.isInteger(d.min) && d.min > 0, `${d.id}: minutes`);
  assert(d.st.length > 0, `${d.id}: has steps`);
  assert(d.s.every(f => f > 0 && f < 1), `${d.id}: shake marks are fractions`);
  assert(d.s.length === 0 || d.act, `${d.id}: shake marks need an instruction`);
  assert(FRYER_CATEGORIES.includes(d.c), `${d.id}: category listed`);
}
assert.equal(MODE_ORDER.length, 9);
assert.equal(norm('Łosoś'), 'losos');

// --- Measures: the case from the brief (szklanka cukru) ---
const sugar = INGREDIENTS.find(i => i.id === 'cukier');
const cup = convert(sugar, 1, 'szklanka');
assert.equal(cup.g, 220); assert.equal(cup.dag, 22); assert.equal(cup.ml, 250);
assert.equal(convert(sugar, 220, 'g').szklanka, 1);
assert.equal(convert(sugar, 22, 'dag').g, 220);
assert.equal(convert(sugar, 0.22, 'kg').szklanka, 1);
assert.equal(convert(INGREDIENTS.find(i => i.id === 'woda'), 1, 'lyzka').g, 15);
assert.equal(convert(INGREDIENTS.find(i => i.id === 'woda'), 3, 'lyzeczka').lyzka, 1);
assert.equal(convert(sugar, 0, 'g').g, 0);
assert.equal(new Set(INGREDIENTS.map(i => i.id)).size, INGREDIENTS.length);
assert(INGREDIENTS.every(i => i.cup > 0 && i.cup < 400));
assert.equal(num(21.95, 1), '22'); assert.equal(num(16.666, 1), '16,7'); assert.equal(num(NaN), '—');
assert.equal(kitchenGrams(212), 210); assert.equal(kitchenGrams(37.4), 37);

// --- Eggs ---
assert.equal(eggSeconds('boil', 'soft', 'M', 'fridge'), 270);
assert.equal(eggSeconds('boil', 'hard', 'L', 'fridge'), 600);
assert.equal(eggSeconds('boil', 'hard', 'S', 'room'), 510);
assert(EGG_BOIL.every(e => e.sec >= 60));
assert.equal(eggSeconds('steam', 'nonsense', 'M', 'fridge'), 360, 'unknown style falls back to the first style');

// --- Cooking times ---
assert.equal(new Set(FOODS.map(f => f.id)).size, FOODS.length);
for (const f of FOODS) {
  assert(FOOD_CATEGORIES.includes(f.c), `${f.id}: category listed`);
  assert(Object.keys(f.ways).length > 0, `${f.id}: at least one method`);
  for (const [m, w] of Object.entries(f.ways)) { assert(METHODS.some(x => x.id === m)); assert(w.min > 0 && w.t, `${f.id}/${m}`); }
}

// --- Temperatures ---
assert.equal(cToF(180), 356); assert.equal(Math.round(fToC(350)), 177);

// --- English dictionary has no duplicate keys (a duplicate silently overrides the first) ---
const src = readFileSync(new URL('../app/src/modules/en.ts', import.meta.url), 'utf8');
const keys = [...src.matchAll(/'((?:[^'\\]|\\.)*)':\s*'/g)].map(m => m[1]);
assert.equal(new Set(keys).size, keys.length, 'no duplicate English keys: ' + keys.filter((k, i) => keys.indexOf(k) !== i).join(' | '));
console.log('PASS: homecraft data tests (' + DISHES.length + ' dishes, ' + FOODS.length + ' foods, ' + INGREDIENTS.length + ' ingredients, ' + keys.length + ' English phrases)');
