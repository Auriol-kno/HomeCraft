import assert from 'node:assert/strict';
import { TM_RECIPES } from '../app/src/modules/thermomix-data.ts';
import { TM_POPULAR_RECIPES } from '../app/src/modules/thermomix-recipes-extra.ts';
import { categoryTotals, daysUntil, expenseEnvelope, isLow, loadExpenses, loadPantry, monthTotal, pantryEnvelope, pantryValue, validateExpenses, validatePantry } from '../app/src/modules/household-store.ts';
import '../app/src/modules/cookbook-all.ts'; // registers the 600 lazily loaded cookbook recipes

assert.equal(TM_POPULAR_RECIPES.length,50,'exactly 50 new TM6 recipes');
assert.equal(TM_RECIPES.length,65,'15 retained + 50 new TM6 recipes');
assert.equal(new Set(TM_RECIPES.map(x=>x.id)).size,TM_RECIPES.length,'unique TM6 ids');
for(const recipe of TM_POPULAR_RECIPES){
 assert(recipe.n&&recipe.c&&recipe.yield&&recipe.ing.length>=2&&recipe.steps.length>=1,recipe.id+' complete');
 for(const st of recipe.steps) if(st.set?.temp&&typeof st.set.temp==='number') assert(st.set.temp>=30&&st.set.temp<=120,recipe.id+' temperature in TM6 range');
 for(const st of recipe.steps) if(typeof st.set?.temp==='number'&&st.set.temp>=95) assert(/koszycz|Varoma|miark/.test(st.text),recipe.id+': hot step states safe lid setup');
}
for(const id of ['popular-bolognese','popular-pulpety','popular-kurczak','popular-losos']) assert(/°C/.test(TM_RECIPES.find(x=>x.id===id)?.note||''),id+' has internal temperature warning');
assert(/71 °C/.test(TM_RECIPES.find(x=>x.id==='popular-jajecznica').note));
assert(/4 dni/.test(TM_RECIPES.find(x=>x.id==='popular-pesto').note));

const pantry=[{id:'a',name:'Mleko',quantity:2,unit:'l',location:'Lodówka',category:'Nabiał i jajka',expiresAt:'2026-11-29',expiryType:'Należy spożyć do',minimum:1,unitPrice:4.99,updatedAt:Date.now()}];
assert.deepEqual(validatePantry(JSON.parse(pantryEnvelope(pantry))),pantry);
assert.equal(validatePantry({v:2,items:pantry}),null);
assert.deepEqual(validatePantry({v:1,items:[...pantry,{id:2}]}),pantry,'invalid rows ignored');
assert.deepEqual(loadPantry({getItem:()=>'{broken'}),[],'corrupted pantry is safe');
assert.equal(isLow(pantry[0]),false); assert.equal(pantryValue(pantry),9.98);
assert.equal(validatePantry({v:1,items:[{...pantry[0],expiresAt:'2026-02-31'}]}).length,0,'impossible date rejected');
assert.equal(daysUntil('2026-11-29',new Date('2026-11-27T12:00:00Z')),2);

const expenses={budgets:{'2026-11':1000,'2026-12':1200},entries:[{id:'e1',date:'2026-11-27',amount:120.25,category:'Żywność',store:'Sklep',note:''},{id:'e2',date:'2026-11-02',amount:30,category:'Napoje',store:'',note:'kawa'},{id:'e3',date:'2026-10-31',amount:10,category:'Inne',store:'',note:''}]};
assert.deepEqual(validateExpenses(JSON.parse(expenseEnvelope(expenses))),expenses);
assert.equal(validateExpenses({v:7,budget:0,entries:[]}),null);
assert.deepEqual(loadExpenses({getItem:()=>'{bad'}),{budgets:{},entries:[]});
assert.equal(monthTotal(expenses,'2026-11'),150.25);
assert.deepEqual(categoryTotals(expenses,'2026-11').map(x=>[x.category,x.amount]),[['Żywność',120.25],['Napoje',30]]);

console.log('PASS: 50 TM6 recipes, pantry and expense stores');
