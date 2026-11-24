import type { KTimer } from './timers.ts';
/** Validate saved records without writing or losing a usable legacy timer. */
export function normalizeTimers(raw: unknown): KTimer[] {
 if(!Array.isArray(raw))return [];
 return raw.filter(t=>t&&typeof t==='object'&&typeof t.id==='string'&&t.id.length>0&&Number.isFinite(t.total)&&t.total>0&&Number.isFinite(t.endAt)).slice(0,20).map(t=>{
  const marks=Array.isArray(t.marks)?t.marks.filter((n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<t.total):[];
  const fired=Array.isArray(t.fired)?t.fired.filter((n:unknown)=>n===-1||marks.includes(n)):[];
  const rep=Number.isInteger(t.rep)&&t.rep>=1&&t.rep<=20?t.rep:1;
  return {...t,id:t.id,name:typeof t.name==='string'?t.name:'Timer',total:t.total,endAt:t.endAt,paused:t.paused===true,remain:Number.isFinite(t.remain)&&t.remain>=0?t.remain:t.total,marks,fired,
   act:typeof t.act==='string'?t.act:'Sprawdź jedzenie',meta:typeof t.meta==='string'?t.meta:'',done:t.done===true,ack:t.ack===true,
   pre:Number.isFinite(t.pre)&&t.pre>0&&t.pre<t.total?t.pre:0,rep,rnd:Number.isInteger(t.rnd)&&t.rnd>=1&&t.rnd<=rep?t.rnd:1,mute:t.mute===true,vib:t.vib!==false};
 });
}
