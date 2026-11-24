import {normalizeTimers} from '../app/src/modules/timer-validation.ts';
import assert from 'node:assert/strict';
import { RECIPES, schedule, totalMinutes, PANKO_DINNER } from '../app/src/modules/kitchen-data.ts';
import { DISH_FINISH_STAGES, DISHES } from '../app/src/modules/fryer-data.ts';
import { dishTimeline, timelineBounds, timelineEvents, taskUses } from '../app/src/modules/timeline-data.ts';
for(const r of RECIPES){
 const before=JSON.stringify(r),plan=schedule(r,0),bounds=timelineBounds(plan);
 assert.equal(bounds.minutes,totalMinutes(r));
 assert.equal(plan.length,r.tasks.length);
 assert.equal(bounds.end,0);
 for(const event of timelineEvents(plan))assert(event.minute>=0&&event.minute<=bounds.minutes,r.id);
 assert.equal(JSON.stringify(r),before,'preview never mutates recipes');
}
assert.equal(timelineBounds(schedule(PANKO_DINNER,0)).minutes,82);
const fries=DISHES.find(d=>d.id==='frytki');
assert.equal(timelineBounds(dishTimeline(fries)).minutes,23,'only explicit appliance time: 3 + 20');
assert.deepEqual(timelineEvents(dishTimeline(fries)).map(e=>e.minute),[11,18]);
for(const d of DISHES){const before=JSON.stringify(d),p=dishTimeline(d);assert.equal(timelineBounds(p).minutes,d.min+(d.pre?3:0)+(DISH_FINISH_STAGES[d.id]||[]).reduce((s,x)=>s+x.min,0));assert.equal(p.length,(d.pre?2:1)+(DISH_FINISH_STAGES[d.id]||[]).length);assert.equal(JSON.stringify(d),before);}
assert(taskUses({lane:'stove',resources:['hands']},'hands'));
assert(!taskUses({lane:'stove',resources:['hands']},'oven'));
assert.deepEqual(timelineBounds([]),{start:0,end:0,minutes:0});
console.log('PASS: read-only timeline for 100 recipes and 37 Air Fryer dishes, shared resources and exact reminders');

const ribs=dishTimeline(DISHES.find(d=>d.id==='zeberka'));assert.equal(timelineBounds(ribs).minutes,34);assert.equal(ribs[1].fryer.temp,230);assert.equal(ribs[1].min,4);
assert.equal(timelineEvents(dishTimeline(DISHES.find(d=>d.id==='frytki-mroz')))[0].minute,7.5);

const legacy={id:'keep',total:60,endAt:Date.now()+60000};const safe=normalizeTimers([legacy]);assert.equal(safe[0].id,'keep');assert.deepEqual(safe[0].marks,[]);assert.deepEqual(safe[0].fired,[]);assert.equal(legacy.marks,undefined);
assert.equal(normalizeTimers([null,{id:'broken',total:'x',endAt:0}]).length,0);
const valid={...legacy,marks:[15,30],fired:[-1,15],pre:5,rep:2,rnd:2,paused:true,remain:40};assert.deepEqual(normalizeTimers([valid])[0].fired,[-1,15]);assert.equal(normalizeTimers([valid])[0].remain,40);
