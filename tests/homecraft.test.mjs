// Unit tests for the Air Fryer and Dom data/logic (pure TypeScript, no browser needed).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DISHES, MODES, MODE_ORDER, FRYER_CATEGORIES, norm } from '../app/src/modules/fryer-data.ts';
import { settingText, TM_CATEGORIES, TM_RECIPES } from '../app/src/modules/thermomix-data.ts';
import { CATS, STAPLES, guessCat, parseEntry, listText } from '../app/src/modules/shopping-data.ts';
import { convert, INGREDIENTS, eggSeconds, EGG_BOIL, FOODS, FOOD_CATEGORIES, METHODS, cToF, fToC, num, kitchenGrams } from '../app/src/modules/home-data.ts';
import '../app/src/modules/cookbook-all.ts'; // registers the 600 lazily loaded cookbook recipes

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

// --- Shopping list: quantity parsing, aisle guessing, shareable text ---
assert.deepEqual(parseEntry('2 l mleko'), { name: 'mleko', qty: '2 l' });
assert.deepEqual(parseEntry('pomidory 1 kg'), { name: 'pomidory', qty: '1 kg' });
assert.deepEqual(parseEntry('chleb'), { name: 'chleb', qty: '' });
assert.deepEqual(parseEntry('jajka x10'), { name: 'jajka', qty: '10' });
assert.equal(guessCat('Pierś z kurczaka'), 'Mięso i ryby');
assert.equal(guessCat('płyn do naczyń'), 'Dom i chemia');
assert.equal(guessCat('coś dziwnego'), 'Inne');
const mismatched = CATS.flatMap(c => STAPLES[c].filter(n => guessCat(n) !== c));
assert(mismatched.length <= 6, 'staples mostly land in their own aisle: ' + mismatched.join(', '));
const txt = listText([{ id: '1', name: 'Mleko', qty: '2 l', cat: 'Nabiał i jajka', done: false }, { id: '2', name: 'Chleb', qty: '', cat: 'Pieczywo', done: true }]);
assert.equal(txt, 'NABIAŁ I JAJKA\n- Mleko (2 l)');

// --- Thermomix TM6: manual recipes are complete and settings read like the device display ---
assert(TM_RECIPES.length >= 12);
assert.equal(new Set(TM_RECIPES.map(r => r.id)).size, TM_RECIPES.length, 'recipe ids are unique');
for (const r of TM_RECIPES) {
  assert(TM_CATEGORIES.includes(r.c), `${r.id}: known category`);
  assert(r.ing.length > 0 && r.steps.length > 0, `${r.id}: has ingredients and steps`);
  for (const st of r.steps) if (st.set) {
    assert(typeof st.set.temp !== 'number' || (st.set.temp >= 37 && st.set.temp <= 100), `${r.id}: cooking temperature within 37–100 °C (Varoma for more)`);
    assert(settingText(st.set).length > 0, `${r.id}: readable setting`);
  }
}
assert.equal(settingText({ min: 18, temp: 100, speed: '4' }), '18 min · 100 °C · obr. 4');
assert.equal(settingText({ sec: 25, speed: '4', rev: true }), '25 s · obr. 4 · ↺ wstecz');
assert.equal(settingText({ min: 30, temp: 'Varoma', speed: '2' }), '30 min · Varoma · obr. 2');

// --- English dictionary has no duplicate keys (a duplicate silently overrides the first) ---
const src = readFileSync(new URL('../app/src/modules/en.ts', import.meta.url), 'utf8');
const keys = [...src.matchAll(/'((?:[^'\\]|\\.)*)':\s*'/g)].map(m => m[1]);
assert.equal(new Set(keys).size, keys.length, 'no duplicate English keys: ' + keys.filter((k, i) => keys.indexOf(k) !== i).join(' | '));
console.log('PASS: homecraft data tests (' + DISHES.length + ' dishes, ' + FOODS.length + ' foods, ' + INGREDIENTS.length + ' ingredients, ' + keys.length + ' English phrases)');
