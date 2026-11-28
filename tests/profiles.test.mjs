// User profiles: snapshot of all settings, apply keeps history, validation, overwrite by name, limit.
import assert from 'node:assert/strict';
import { applySnapshot, BREW_KEY, GEAR_KEY_P, MAX_PROFILES, parseProfiles, PREFS_KEY, removeProfile, saveProfile, snapshot } from '../app/src/modules/profiles.ts';

const mem = init => { const m = new Map(Object.entries(init)); return { getItem: k => m.has(k) ? m.get(k) : null, setItem: (k, v) => m.set(k, String(v)), m }; };
const a = mem({
  [PREFS_KEY]: JSON.stringify({ theme: 'pastel', mode: 'dark', density: 'compact', language: 'en' }),
  [BREW_KEY]: JSON.stringify({ method: 'v60', alerts: { sound: false, voice: true, flash: true }, grinder: 'lelit', hist: [{ ts: 1 }], maint: { x: 1 } }),
  [GEAR_KEY_P]: JSON.stringify({ v: 1, grinder: 'niche-zero', machine: null, done: {}, every: {} }),
});
const snap = snapshot(a);
assert.equal(snap.prefs.theme, 'pastel');
assert.deepEqual(Object.keys(snap.brew).sort(), ['alerts', 'grinder', 'method'], 'only settings, no history or counters');
assert.equal(snap.gear.grinder, 'niche-zero');

const b = mem({ [BREW_KEY]: JSON.stringify({ method: 'espresso', hist: [{ ts: 9 }, { ts: 8 }], maint: { y: 2 } }) });
applySnapshot(b, snap);
const brew = JSON.parse(b.getItem(BREW_KEY));
assert.equal(brew.method, 'v60'); assert.equal(brew.alerts.voice, true);
assert.equal(brew.hist.length, 2, 'history kept'); assert.deepEqual(brew.maint, { y: 2 }, 'service counters kept');
assert.equal(JSON.parse(b.getItem(PREFS_KEY)).language, 'en');
assert.equal(JSON.parse(b.getItem(GEAR_KEY_P)).grinder, 'niche-zero');

let s = parseProfiles(null);
s = saveProfile(s, '  Anna  ', snap, 1000); assert.equal(s.list[0].name, 'Anna'); assert.equal(s.active, s.list[0].id);
const id = s.active;
s = saveProfile(s, 'anna', { prefs: { theme: 'line' } }, 2000); assert.equal(s.list.length, 1, 'same name overwrites'); assert.equal(s.list[0].id, id); assert.equal(s.list[0].data.prefs.theme, 'line');
assert.equal(saveProfile(s, '   ', snap, 1), null, 'empty name refused');
for (let i = 1; i < MAX_PROFILES; i++) s = saveProfile(s, 'P' + i, snap, i);
assert.equal(s.list.length, MAX_PROFILES); assert.equal(saveProfile(s, 'Nowy', snap, 1), null, 'limit');
s = removeProfile(s, s.active); assert.equal(s.active, null); assert.equal(s.list.length, MAX_PROFILES - 1);

const round = parseProfiles(JSON.stringify(s)); assert.deepEqual(round, s, 'round trip');
assert.deepEqual(parseProfiles('{"v":1,"active":"x","list":[{"id":"x"},{"id":"y","name":"Ok","savedAt":1,"data":{"prefs":[1]}},5]}'),
  { v: 1, active: null, list: [{ id: 'y', name: 'Ok', savedAt: 1, data: {} }] }, 'bad entries dropped');
assert.deepEqual(parseProfiles('nie json'), { v: 1, active: null, list: [] });
console.log('PASS: profiles (settings snapshot, history kept on apply, overwrite by name, limit, validation)');
