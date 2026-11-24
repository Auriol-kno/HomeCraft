import { recipe } from './cookbook-recipes.ts';
import type { Category, Cuisine, Diet, CookbookRecipe } from './cookbook-recipes.ts';
import { CAKES } from './cookbook-cakes-data.ts';
import { SIDES } from './cookbook-salads-sauces-data.ts';
type Step=Parameters<typeof recipe>[6][number];
function ingredients(raw:string):[string,number,number][]{
 return raw.split('|').filter(Boolean).map(s=>{const [n,g,k]=s.split(':');return [n,Number(g),Number(k)];});
}
const patterns:[string,RegExp][]=[
 ['gluten',/mąka pszenna|herbatniki|grzanki|makaron|bulgur/],['jaja',/jajka/],
 ['mleko',/mleko|masło(?! orzechowe)|twaróg|śmietank|mascarpone|serek|feta|mozzarella|jogurt|parmezan|cheddar|kajmak|czekolada/],
 ['orzechy',/orzechy włoskie|orzechy laskowe|migdał|pistacj|orzeszki piniowe/],['orzeszki ziemne',/masło orzechowe/],['sezam',/tahini|sezam/],['ryby',/tuńczyk/],['gorczyca',/musztard/],['seler',/seler/]
];
export const ADDITIONAL_COOKBOOK_RECIPES:CookbookRecipe[]=[...CAKES,...SIDES].map((d,index)=>{
 const ing=[...ingredients(d.base),...ingredients(d.extra)];
 const names=ing.map(x=>x[0]).join(' ').toLowerCase();
 const allergens=patterns.filter(([,p])=>p.test(names)).map(([a])=>a);
 const steps:Step[]=[];
 if(d.cat==='Ciasta'){
  const yeast=/drożdż/.test(names), tort=d.name.startsWith('Tort'), cheese=d.name.startsWith('Sernik'), short=/Szarlotka|Kruche/.test(d.name);
  // Full method is kept in the first card; subsequent timers identify stages.
  steps.push([20,'Przygotuj ciasto i dodatki',d.method+' Wariant: '+d.detail+' Nie próbuj surowej mąki ani jaj.']);
  if(yeast){steps.push([75,'Pierwsze wyrastanie','Przykryj ciasto, odstaw do podwojenia objętości.','wait'],[10,'Formowanie','Uformuj ciasto i rozłóż nadzienie zgodnie z instrukcją.'],[35,'Drugie wyrastanie','Przykryj i odstaw do napuszenia.','wait']);}
  if(short)steps.push([30,'Chłodzenie ciasta','Schłodź kruche ciasto przed formowaniem.','wait']);
  steps.push([d.min,'Pieczenie','Piecz w temperaturze podanej w instrukcji. Sprawdź upieczenie środka przed wyjęciem.','oven'],[50,'Studzenie','Ostudź na kratce.','wait']);
  if(tort)steps.push([25,'Przełożenie tortu','Przekrój biszkopt, ubij zimny krem i przełóż zgodnie z instrukcją.'],[180,'Chłodzenie tortu','Przechowuj w lodówce.','wait']);
  if(cheese)steps.push([240,'Chłodzenie sernika','Po ostudzeniu schłodź w lodówce.','wait']);
  if(d.name.startsWith('Ciasto marchewkowe'))steps.push([8,'Polewa','Wymieszaj serek z cukrem pudrem, posmaruj ostudzone ciasto.']);
 }else{
  steps.push([10,'Przygotuj składniki',d.detail]);
  steps.push([d.min||8,'Przygotuj danie',d.method,d.min?'stove':'hands']);
 }
 steps.push([3,'Podaj','Podziel na porcje. Sprawdź alergeny na etykietach produktów gotowych.']);
 const safe=/pierś z kurczaka/.test(names)?'poultry':d.cat==='Ciasta'?'egg':undefined;
 const r=recipe('book-'+String(index+350),d.name,d.c as Cuisine,d.cat as Category,d.servings,ing,steps,allergens,safe,'Domowa interpretacja; nieprzetestowana w kuchni.');
 r.book.sources=[];
 const diets:Diet[]=[];
 if(!/kurczak|tuńczyk/.test(names)){diets.push('Wegetariańska');if(!allergens.includes('mleko')&&!allergens.includes('jaja')&&!/miód/.test(names))diets.push('Wegańska');}
 r.book.diets=diets;
 return r;
});
