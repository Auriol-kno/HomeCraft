import assert from 'node:assert/strict';
import { RECIPES, schedule, totalMinutes, handsMinutes, PANKO_DINNER } from '../app/src/modules/kitchen-data.ts';
import { bookInfo, recipeKcal, filterRecipes, EMPTY_FILTERS, parseFavourites, normalizeBook } from '../app/src/modules/cookbook-data.ts';
assert.equal(RECIPES.length,100);
assert.equal(new Set(RECIPES.map(r=>r.id)).size,100);
assert.equal(new Set(RECIPES.map(r=>r.name)).size,100);
assert(RECIPES.filter(r=>bookInfo(r).cuisine==='Polska').length>=20);
assert(RECIPES.filter(r=>bookInfo(r).cuisine==='Azjatycka').length>=20);
assert.equal(RECIPES.filter(r=>bookInfo(r).category==='Napoje').length,10);
for(const r of RECIPES){
 assert(r.servings>0&&r.ingredients.length>0&&r.tasks.length>=2,r.name);
 const meta=bookInfo(r); assert(meta.nutrition.length>=r.ingredients.length);
 for(const i of meta.nutrition)assert(i.grams>0&&Number.isFinite(i.kcal100)&&i.kcal100>=0,r.name+': nutrition');
 assert(recipeKcal(r)>0&&recipeKcal(r)<2000,r.name+': plausible calorie range');
 assert.equal(recipeKcal(r),Math.round(meta.nutrition.reduce((s,i)=>s+i.grams*i.kcal100/100,0)/r.servings));
 const p=schedule(r,0), ids=new Map(p.map(t=>[t.id,t]));
 assert.equal(Math.max(...p.map(t=>t.end)),0);
 for(const task of p){for(const dep of task.after)assert(ids.get(dep).end<=task.start);}
 for(const resource of ['hands','fryer','stove','oven','blender']){
  const tasks=p.filter(t=>t.lane===resource||t.resources?.includes(resource)).sort((a,b)=>a.start-b.start);
  for(let i=1;i<tasks.length;i++)assert(tasks[i-1].end<=tasks[i].start,r.name+': exclusive '+resource);
 }
 for(const task of r.tasks)if(task.fryer)assert(task.fryer.temp>=30&&task.fryer.temp<=230);
 assert(totalMinutes(r)>0);
}
assert.equal(normalizeBook('ŁÓDŹ'),'lodz');
assert(filterRecipes({...EMPTY_FILTERS,query:'losos'},[]).every(r=>normalizeBook(r.name+' '+r.ingredients.map(i=>i.n).join(' ')).includes('losos')));
assert(filterRecipes({...EMPTY_FILTERS,query:'kurczak ryz'},[]).length>0,'AND search across ingredients');
for(const mode of ['time','kcal','kcal-desc']){
 const xs=filterRecipes({...EMPTY_FILTERS,sort:mode},[]);
 const val=mode==='time'?totalMinutes:recipeKcal;
 for(let i=1;i<xs.length;i++)assert(mode==='kcal-desc'?val(xs[i-1])>=val(xs[i]):val(xs[i-1])<=val(xs[i]));
}
assert(filterRecipes({...EMPTY_FILTERS,quick:true},[]).every(r=>totalMinutes(r)<=30));
assert.deepEqual(filterRecipes({...EMPTY_FILTERS,favouritesOnly:true},[]),[]);
assert.deepEqual(filterRecipes({...EMPTY_FILTERS,favouritesOnly:true},[PANKO_DINNER.id]).map(r=>r.id),[PANKO_DINNER.id]);
for(const raw of [null,'{','null','[]','42','{"v":2,"ids":[]}','{"v":1,"ids":"oops"}'])assert.deepEqual(parseFavourites(raw),[]);
assert.deepEqual(parseFavourites(JSON.stringify({v:1,ids:['book-001','book-001',null,4,'unknown']})),['book-001']);
// A future 500-recipe catalogue must use exactly the same query logic.
const fiveHundred=Array.from({length:5},(_,batch)=>RECIPES.map(r=>({...r,id:r.id+'-'+batch}))).flat();
assert.equal(filterRecipes(EMPTY_FILTERS,[],fiveHundred).length,500);
// Multi-resource step: a cook stirring on the hob excludes both another hands task and the same hob.
const multi={...PANKO_DINNER,tasks:[{id:'a',title:'a',detail:'',lane:'hands',resources:['stove'],min:5,after:[]},{id:'b',title:'b',detail:'',lane:'stove',min:5,after:[]},{id:'c',title:'c',detail:'',lane:'hands',min:2,after:['a','b']}]};
const mp=schedule(multi,0);assert.equal(totalMinutes(multi),12);assert.equal(mp.length,3);
console.log('PASS: 100 recipes, 500-record queries, kcal sums, stable ids, search/sort/favourites validation and resource-safe schedules');

const get=id=>RECIPES.find(r=>r.id===id);
assert(handsMinutes(get('book-007'))>=44,'active frying belongs to hands-on work');
assert.equal(get('book-047').tasks.filter(t=>t.fryer?.mode==='AIR FRY').length,2,'two quesadilla batches');
assert(get('book-047').tasks.filter(t=>t.fryer?.mode==='AIR FRY').every(t=>t.min===6));
for(const id of ['book-017','book-020','book-061']){const r=get(id);const boil=r.tasks.find(t=>t.title==='Gotuj jajka od wrzenia');assert(boil&&boil.min===10&&boil.timer);assert.equal(r.tasks.find(t=>t.title==='Zagotuj wodę z jajkami').timer,undefined);}
assert.deepEqual(get('book-045').tasks.find(t=>t.fryer?.mode==='AIR FRY').timer.marks,[8/22,16/22]);
assert(get('book-024').equipment.some(i=>/Termometr/.test(i.n)));
