// Unit tests for the pure brewing advice. Run: node --experimental-strip-types tests/advice.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { advise } from '../app/src/advice.ts';

const espresso = { dose: 18, ratio: 2, temp: 93, grind: 3.6 };
const kpro = { type: 'kpro' };
const lelit = (over = {}) => ({ type: 'lelit', lelit: { dial: 5.5, time: 7.2, rate: 2.5, fineLower: true, ...over } });
const row = (a, name) => a.rows.find(r => r[0] === name)?.[1] ?? '';

test('kwaśne espresso na K-Pro: drobniej o 2 kliknięcia i cieplej o 1 °C', () => {
  const a = advise('espresso', espresso, 1, 'kwasne', 'ok', 27, 3, kpro);
  assert.equal(a.z, 'under');
  assert.equal(a.delta.grind, 3.4);
  assert.equal(a.delta.temp, 94);
  assert.match(row(a, 'Mielenie'), /Drobniej: 3,6 → 3,4 \(2 klik\.\)/);
});

test('gorzkie espresso: grubiej i chłodniej', () => {
  const a = advise('espresso', espresso, 1, 'gorzkie', 'ok', 27, 3, kpro);
  assert.equal(a.z, 'over');
  assert.equal(a.delta.grind, 3.8);
  assert.equal(a.delta.temp, 92);
});

test('za szybki shot dostaje wskazówkę o czasie, za długi także', () => {
  assert.match(row(advise('espresso', espresso, 1, 'kwasne', 'ok', 18, 3, kpro), 'Czas'), /za szybki/);
  assert.match(row(advise('espresso', espresso, 1, 'gorzkie', 'ok', 36, 3, kpro), 'Czas'), /za długi/);
});

test('Lelit William: kierunek FINE zależy od ustawienia skali', () => {
  assert.equal(advise('espresso', espresso, 1, 'kwasne', 'ok', 27, 3, lelit()).delta.lelitDial, 5);
  assert.equal(advise('espresso', espresso, 1, 'kwasne', 'ok', 27, 3, lelit({ fineLower: false })).delta.lelitDial, 6);
  assert.equal(advise('espresso', espresso, 1, 'gorzkie', 'ok', 27, 3, lelit()).delta.lelitDial, 6);
});

test('Lelit William przy 1: nie schodzi niżej', () => {
  const a = advise('espresso', espresso, 1, 'kwasne', 'ok', 27, 3, lelit({ dial: 1 }));
  assert.equal(a.delta.lelitDial, undefined);
  assert.match(row(a, 'Mielenie'), /nie schodź niżej/);
});

test('Lelit William: czas mielenia dopasowany do dawki', () => {
  const a = advise('espresso', espresso, 1, 'ok', 'ok', 27, 5, lelit({ time: 5.5 }));
  assert.equal(a.delta.lelitTime, 7.2);
});

test('wodniste espresso: mocniejsza proporcja', () => {
  assert.equal(advise('espresso', espresso, 1, 'wodniste', 'ok', 27, 3, kpro).delta.ratio, 1.8);
});

test('zbalansowane i 5 gwiazdek: nic nie zmieniaj', () => {
  const a = advise('espresso', espresso, 1, 'ok', 'ok', 27, 5, kpro);
  assert.deepEqual(a.delta, {});
  assert.match(row(a, 'Przepis'), /Nic nie zmieniaj/);
});

test('V60 gorzkie: grubiej o 4 kliknięcia i chłodniej o 2 °C', () => {
  const a = advise('v60', { dose: 15, ratio: 16, temp: 94, grind: 8.5 }, 0, 'gorzkie', 'ok', 200, 3, kpro);
  assert.equal(a.delta.grind, 8.9);
  assert.equal(a.delta.temp, 92);
});

test('po turecku: bez temperatury, z poradą o ogniu', () => {
  const a = advise('turkish', { dose: 7, ratio: 10, temp: null, grind: 2.6 }, 0, 'kwasne', 'ok', 180, 3, kpro);
  assert.equal(a.delta.temp, undefined);
  assert.ok(row(a, 'Ogień'));
});

test('mielenie nie wychodzi poza skalę 0–10', () => {
  assert.equal(advise('espresso', { ...espresso, grind: 0.1 }, 1, 'kwasne', 'ok', 27, 3, kpro).delta.grind, 0);
  assert.equal(advise('french', { dose: 30, ratio: 15, temp: 94, grind: 9.9 }, 0, 'gorzkie', 'ok', 250, 3, kpro).delta.grind, 10);
});

test('angielski separator dziesiętny', () => {
  assert.match(row(advise('espresso', espresso, 1, 'kwasne', 'ok', 27, 3, kpro, '.'), 'Mielenie'), /3\.6 → 3\.4/);
});
