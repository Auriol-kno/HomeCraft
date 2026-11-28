// Unit tests for the Kitchen OS planner (pure TypeScript, no browser).
import assert from 'node:assert/strict';
import { PANKO_DINNER as R, RECIPES, schedule, status, totalMinutes, handsMinutes, defaultServeAt, earliestServeAt, timeToday, hhmm } from '../app/src/modules/kitchen-data.ts';
import '../app/src/modules/cookbook-all.ts'; // registers the 600 lazily loaded cookbook recipes

const MIN = 60000;
const serve = new Date(2026, 10, 24, 18, 30).getTime();
const plan = schedule(R, serve);
const by = Object.fromEntries(plan.map(t => [t.id, t]));

// Data integrity: unique ids, known dependencies, timers only on timed lanes, appliance settings in range.
for (const r of RECIPES) {
  const ids = r.tasks.map(t => t.id);
  assert.equal(new Set(ids).size, ids.length, r.id + ': unique task ids');
  for (const t of r.tasks) {
    for (const d of t.after) assert(ids.includes(d), `${t.id}: dependency ${d} exists`);
    assert(t.min > 0 && Number.isInteger(t.min), `${t.id}: whole minutes`);
    if (t.lane !== 'hands') assert(t.timer, `${t.id}: timed task has a timer`);
    if (t.fryer) assert(t.fryer.temp >= 30 && t.fryer.temp <= 230, `${t.id}: COSORI range`);
  }
  const all = [...r.ingredients, ...r.equipment, ...r.prep].map(x => x.id);
  assert.equal(new Set(all).size, all.length, r.id + ': unique Mise en Place ids');
}

// The plan ends exactly at the serving time and respects every dependency.
assert.equal(Math.max(...plan.map(t => t.end)), serve);
for (const t of plan) for (const d of t.after) assert(by[d].end <= t.start, `${d} ends before ${t.id} starts`);
// One cook and one Air Fryer basket: no overlaps on those lanes.
for (const lane of ['hands', 'fryer']) {
  const xs = plan.filter(t => t.lane === lane).sort((a, b) => a.start - b.start);
  for (let i = 1; i < xs.length; i++) assert(xs[i - 1].end <= xs[i].start, `${lane}: ${xs[i - 1].id} overlaps ${xs[i].id}`);
}
// Fries before chicken, fries return for the last 3 minutes, chicken rests at the same time.
assert(by.fries.end <= by.chicken.start);
assert.equal(by.recrisp.start, by.chicken.end);
assert.equal(by.rest.start, by.chicken.end);
// Parallel work exists: breading happens while the fries are in the Air Fryer.
assert(by.bread.start < by.fries.end && by.bread.end > by.fries.start, 'breading runs in parallel with the fries');
// Known totals for the sample dinner: 82 min overall, 42 min of hands-on work, start 17:08 for 18:30.
assert.equal(totalMinutes(R), 82);
assert.equal(handsMinutes(R), 42);
assert.equal(hhmm(plan[0].start), '17:08');
assert.equal(plan[0].id, 'cut');
// Deterministic, and moving the serving time shifts every task by the same amount.
assert.deepEqual(schedule(R, serve), plan);
const later = schedule(R, serve + 15 * MIN);
for (const t of later) assert.equal(t.start, by[t.id].start + 15 * MIN);

// Serving time helpers.
const now = new Date(2026, 10, 24, 10, 13).getTime();
assert.equal(hhmm(defaultServeAt(R, now)), '11:45', 'now + 82 + 10 min, rounded up to 15');
assert.equal(earliestServeAt(R, now), now + 82 * MIN);
assert.equal(hhmm(timeToday('18:30', now)), '18:30');
assert.equal(new Date(timeToday('07:00', now)).getDate(), 25, 'earlier time means tomorrow');
assert.equal(timeToday('25:00', now), null);

// Status: before the start, nothing is due and the next task is shown.
const empty = { started: {}, done: {} };
let st = status(plan, empty, by.cut.start - 5 * MIN, serve);
assert.equal(st.now.length, 0); assert.equal(st.next[0].id, 'cut'); assert.equal(st.lateMin, 0);
// At the start the first task is due.
st = status(plan, empty, by.cut.start, serve);
assert.deepEqual(st.now.map(t => t.id), ['cut']);
// Work by hand is not late before its planned end; a missed timed start is.
st = status(plan, empty, by.cut.end - MIN, serve);
assert.equal(st.lateMin, 0);
st = status(plan, { started: {}, done: { cut: by.cut.end } }, by.soak.start + 4 * MIN, serve);
assert.equal(st.lateMin, 4); assert.equal(st.finishAt, serve + 4 * MIN);
assert(st.now.some(t => t.id === 'soak'));
// A due task with unfinished prerequisites is reported as blocked.
st = status(plan, { started: {}, done: { cut: 1, soak: 1, dry: 1, preheat: 1, fries: 1 } }, by.chicken.start, serve);
assert.deepEqual(st.blocked.chicken, ['bread']);
// Parallel "now": fries running in the Air Fryer while breading is due.
const p2 = { started: { fries: by.fries.start }, done: { cut: 1, soak: 1, dry: 1, preheat: 1 } };
st = status(plan, p2, by.bread.start + MIN, serve);
assert.deepEqual(st.now.map(t => t.id).sort(), ['bread', 'fries']);
// Everything done → finished.
st = status(plan, { started: {}, done: Object.fromEntries(plan.map(t => [t.id, 1])) }, serve, serve);
assert(st.finished); assert.equal(st.doneCount, plan.length);

console.log(`PASS: Kitchen OS planner (${plan.length} steps, ${totalMinutes(R)} min, start ${hhmm(plan[0].start)} for ${hhmm(serve)})`);
