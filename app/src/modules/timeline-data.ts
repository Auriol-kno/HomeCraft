// Read-only projections of existing schedules. No session or timer writes.
import type { Lane } from './kitchen-types.ts';
import type { Planned } from './kitchen-data.ts';
import { FRYER_PREHEAT_SECONDS, DISH_FINISH_STAGES, MODES, type Dish } from './fryer-data.ts';
export const taskUses = (task: Planned, lane: Lane) => task.lane === lane || !!task.resources?.includes(lane);
export function timelineBounds(plan: readonly Planned[]) {
 const start = plan.length ? Math.min(...plan.map(t=>t.start)) : 0;
 const end = plan.length ? Math.max(...plan.map(t=>t.end)) : start;
 return {start,end,minutes:Math.round((end-start)/60000)};
}
export const formatTimelineOffset = (seconds:number) => `${Math.floor(seconds/60)} min${seconds%60 ? ` ${seconds%60} s` : ''}`;
export function timelineEvents(plan: readonly Planned[]) {
 const {start}=timelineBounds(plan);
 return plan.flatMap(task=>(task.timer?.marks||[]).map(f=>({id:`${task.id}-${f}`,minute:Math.round((task.start-start)/1000+task.min*60*f)/60,label:task.timer?.act||'Sprawdź jedzenie'}))).sort((a,b)=>a.minute-b.minute);
}
/** Air Fryer sheet data has appliance time only. Do not infer preparation times from prose. */
export function dishTimeline(d: Dish): Planned[] {
 const pre=d.pre?FRYER_PREHEAT_SECONDS/60:0;
 const base={lane:'fryer' as const,resources:[]};
 const plan: Planned[] = [
  ...(pre?[{...base,id:'preheat',title:'Rozgrzewanie',detail:'',min:pre,after:[],start:0,end:pre*60000}]:[]),
  {...base,id:'cook',title:MODES[d.m].pl,detail:d.st.join(' '),min:d.min,after:pre?['preheat']:[],start:pre*60000,end:(pre+d.min)*60000,timer:{name:d.n,marks:d.s,act:d.act||'Sprawdź jedzenie'}},
 ];
 for (const [i,stage] of (DISH_FINISH_STAGES[d.id]||[]).entries()) { const previous=plan[plan.length-1];plan.push({...base,id:`finish-${i}`,title:stage.title,detail:stage.title,min:stage.min,after:[previous.id],start:previous.end,end:previous.end+stage.min*60000,fryer:{mode:MODES[stage.mode].tag,temp:stage.temp}}); }
 return plan;
}
