// Coffee gear catalogue: 10 popular grinders + complete Lelit model families, validated saved state and service dates.
import assert from 'node:assert/strict';
import { GRINDERS, MACHINES, GEAR, parseGear, taskStatus, overdueCount, taskKey, gearById } from '../app/src/modules/coffee-gear-data.ts';

assert.equal(GRINDERS.length, 14); assert.equal(MACHINES.length, 20);
assert.equal(GRINDERS.filter(g => g.brand === 'lelit').length, 4, 'Lelit grinder families: Fred Prima, Fred Tempo, William and Steve');
assert.equal(MACHINES.filter(g => g.brand === 'lelit' && !g.range).length, 12, 'all current Lelit home-machine families');
assert.equal(MACHINES.filter(g => g.brand === 'lelit' && g.range === 'legacy').length, 2, 'retained legacy Lelit machines');
assert.equal(MACHINES.filter(g => g.brand === 'lelit' && g.range === 'professional').length, 1, 'professional GiuliettaX');
assert.equal(GRINDERS.filter(g => g.drive === 'manual').length, 5, '5 hand grinders');
assert.equal(GRINDERS.filter(g => g.drive === 'electric' && !g.brand).length, 5, '5 electric grinders');
assert.equal(new Set(GEAR.map(g => g.id)).size, 34, 'unique ids');
for (const g of GEAR) {
  assert(g.specs.length >= 5, g.id + ' has specifications');
  assert(g.espresso.length >= 2, g.id + ' has an espresso start');
  assert(g.service.length >= 2, g.id + ' has service tasks');
  assert(g.sources.length >= 1 && g.sources.every(s => /^https:\/\//.test(s.url)), g.id + ' has https sources');
  assert.equal(new Set(g.service.map(t => t.id)).size, g.service.length, g.id + ' unique task ids');
  for (const t of g.service) assert(Number.isInteger(t.everyDays) && t.everyDays >= 1 && t.everyDays <= 730);
}
// No backflush with detergent on a machine without a 3-way valve (Dedica).
assert(!gearById('delonghi-dedica').service.some(t => t.id === 'backflush-detergent'));
assert(gearById('gaggia-classic').service.some(t => t.id === 'backflush-detergent'));
for (const id of ['lelit-steve', 'lelit-anna-em', 'lelit-anita-em', 'lelit-victoria3', 'lelit-elizabeth3', 'lelit-giuliettax']) assert(gearById(id), `${id} is in the catalogue`);

// Saved state validation: unknown ids, wrong kinds, bad numbers and unknown keys are dropped.
assert.deepEqual(parseGear(null), { v: 1, grinder: null, machine: null, done: {}, every: {} });
assert.deepEqual(parseGear('{bad json'), { v: 1, grinder: null, machine: null, done: {}, every: {} });
const parsed = parseGear(JSON.stringify({ v: 1, grinder: 'gaggia-classic', machine: 'gaggia-classic',
  done: { 'gaggia-classic:gasket': 1000, 'nope:x': 5, 'gaggia-classic:descale': -1 }, every: { 'gaggia-classic:gasket': 180, 'gaggia-classic:descale': 0.5 } }));
assert.equal(parsed.grinder, null, 'a machine is not a grinder'); assert.equal(parsed.machine, 'gaggia-classic');
assert.deepEqual(parsed.done, { 'gaggia-classic:gasket': 1000 }); assert.deepEqual(parsed.every, { 'gaggia-classic:gasket': 180 });

// Due dates.
const DAY = 86400000, now = Date.UTC(2026, 10, 28, 12), g = gearById('gaggia-classic'), task = g.service.find(t => t.id === 'backflush-detergent');
const at = days => ({ v: 1, grinder: null, machine: g.id, done: { [taskKey(g, task)]: now - days * DAY }, every: {} });
assert.equal(taskStatus({ v: 1, grinder: null, machine: g.id, done: {}, every: {} }, g, task, now).state, 'never');
assert.equal(taskStatus(at(1), g, task, now).state, 'ok');
assert.equal(taskStatus(at(18), g, task, now).state, 'soon');
assert.equal(taskStatus(at(25), g, task, now).state, 'overdue');
assert.equal(taskStatus({ ...at(25), every: { [taskKey(g, task)]: 30 } }, g, task, now).state, 'soon', 'user interval wins');
assert.equal(overdueCount(at(25), now), 1);
console.log('PASS: coffee gear (10 popular grinders, complete current Lelit families, legacy and professional machines, sources, safe saved state, service due dates)');
