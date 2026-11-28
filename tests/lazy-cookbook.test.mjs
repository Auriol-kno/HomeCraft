// The cookbook is a lazily loaded chunk: before it arrives nothing may drop saved data.
import assert from 'node:assert/strict';
import { RECIPES, isCookbookLoaded, recipeById, onCookbookLoaded } from '../app/src/modules/kitchen-data.ts';
import { parseFavourites } from '../app/src/modules/cookbook-data.ts';

assert.equal(isCookbookLoaded(), false);
assert.equal(RECIPES.length, 1, 'only the sample dinner before loading');
const saved = JSON.stringify({ v: 1, ids: ['book-005', 'book-412', 'book-005', 'Zły id!', 7] });
assert.deepEqual(parseFavourites(saved), ['book-005', 'book-412'], 'favourites kept (format-checked) before loading');
let notified = 0; onCookbookLoaded(() => notified++);
await import('../app/src/modules/cookbook-all.ts');
assert.equal(isCookbookLoaded(), true); assert.equal(notified, 1);
assert.equal(RECIPES.length, 600); assert.equal(new Set(RECIPES.map(r => r.id)).size, 600);
assert.equal(RECIPES[0].id, 'panko-frytki-salatka', 'order kept: sample dinner first');
assert(recipeById('book-005'));
assert.deepEqual(parseFavourites(JSON.stringify({ v: 1, ids: ['book-005', 'book-99999'] })), ['book-005'], 'unknown ids dropped once loaded');
console.log('PASS: lazy cookbook registry (favourites safe before load, 600 recipes in fixed order after)');
