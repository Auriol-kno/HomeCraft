import { useEffect, useRef, useState } from 'react';
import { CookingTimeline } from './CookingTimeline';
import { RECIPES, schedule, recipeById, totalMinutes, handsMinutes, minLabel } from './kitchen-data';
import type { Recipe } from './kitchen-types';
import { bookInfo, BOOK_CATEGORIES, BOOK_CUISINES, BOOK_DIETS, BOOK_DEVICES, EMPTY_FILTERS, filterRecipes, recipeKcal, healthLevel, difficultyLabel, type BookSort } from './cookbook-data';
import { toggleBookFavourite, useBookFavourites, useBookFeedback, rateBookRecipe, recordBookCooking } from './cookbook-store';
import { getKitchen, selectKitchenRecipe } from './kitchen-store';
import { actOn, useTimers } from './timers';
import { t } from './en';
import './cookbook.css';
let rememberedFilters = {...EMPTY_FILTERS};
let rememberedLimit = 20;
const chosen=()=>{const [a,b,id]=location.hash.slice(1).split('/');return a==='dom'&&b==='recipes'&&id?recipeById(id):undefined;};
// Editorial ingredient-based estimate; not Nutri-Score or a clinical assessment.
function HealthDot({recipe}:{recipe:Recipe}){
 const level=healthLevel(recipe);
 const labels={green:'Więcej składników roślinnych',moderate:'Umiarkowany udział składników roślinnych',occasional:'Raczej okazjonalnie',unknown:'Brak danych'};
 return <span className={'hc-health-dot '+level} role="img" aria-label={t(labels[level])} title={t(labels[level])}/>;
}
export function Cookbook({onPlan}:{onPlan:()=>void}){
 const favourites=useBookFavourites(), feedback=useBookFeedback(), timers=useTimers();
 const [filters,setFilters]=useState({...rememberedFilters}),[limit,setLimit]=useState(rememberedLimit),[selected,setSelected]=useState<Recipe|undefined>(chosen),[confirm,setConfirm]=useState(false);
 const [advanced,setAdvanced]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null), lastRecipe=useRef<string|undefined>('');
 useEffect(()=>{const sync=()=>{setSelected(chosen());setConfirm(false);};window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync);},[]);
 useEffect(()=>{if(selected?.id!==lastRecipe.current){heading.current?.focus();lastRecipe.current=selected?.id;heading.current?.closest('main')?.scrollTo(0,0);}},[selected]);
 const change=(next:Partial<typeof filters>)=>{setFilters(f=>{rememberedFilters={...f,...next};return rememberedFilters;});rememberedLimit=20;setLimit(20);};
 const open=(r:Recipe)=>{setSelected(r);setConfirm(false);location.hash=`dom/recipes/${r.id}`;};
 const back=()=>{setSelected(undefined);setConfirm(false);location.hash='dom/recipes';};
 const start=(r:Recipe)=>{
  const session=getKitchen();
  if(session.recipe===r.id){onPlan();return;}
  if(session.cooking||session.mise.length||Object.keys(session.started).length||Object.keys(session.done).length){setConfirm(true);return;}
  replace(r);
 };
 const replace=(r:Recipe)=>{
  const linked=Object.values(getKitchen().timers);
  timers.filter(timer=>linked.includes(timer.id)).forEach(timer=>actOn(timer.id,'del'));
  selectKitchenRecipe(r);setConfirm(false);onPlan();
 };
 const star=(r:Recipe)=><button className="hc-ghost hc-book-star" aria-pressed={favourites.includes(r.id)} aria-label={`${t(favourites.includes(r.id)?'Usuń z ulubionych':'Dodaj do ulubionych')}: ${r.name}`} onClick={event=>{event.stopPropagation();toggleBookFavourite(r.id);}}>{favourites.includes(r.id)?'★':'☆'}</button>;
 if(selected){const info=bookInfo(selected), review=feedback[selected.id];return <section className="screen hc-book" aria-label={t('Szczegóły przepisu')}>
  <button className="hc-ghost" onClick={back}>← {t('Wróć do książki')}</button>
  <article className="hc-card hc-book-detail">
   <div className="hc-book-top"><p className="hc-tag">{t(info.cuisine)} · {t(info.category)}</p>{star(selected)}</div>
   <h2 ref={heading} tabIndex={-1} className="hc-k-title hc-health-title"><HealthDot recipe={selected}/>{selected.name}</h2>
   <p className="hc-book-labels">{info.diets.map(d=><span key={d}>{t(d)}</span>)}{info.devices.map(d=><span key={d}>{t(d)}</span>)}</p>
   <p className="hc-book-facts"><b>≈ {recipeKcal(selected)} {t('kcal / porcję')}</b><span>{selected.servings} {t('porcje')}</span><span>{minLabel(totalMinutes(selected))} · {t('Twoja praca')}: {handsMinutes(selected)} min</span></p>
   <div className="hc-book-feedback">
    <div className="hc-rating" role="group" aria-label={t('Twoja ocena')}><span>{t('Twoja ocena')}</span>{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={n+' / 5'} aria-pressed={review?.rating===n} onClick={()=>rateBookRecipe(selected.id,n)}>{n<=(review?.rating||0)?'★':'☆'}</button>)}{!!review?.rating&&<button className="hc-ghost" onClick={()=>rateBookRecipe(selected.id,0)}>{t('Usuń ocenę')}</button>}</div>
    <p>{t('Trudność (szacunkowa)')}: <b>{t(difficultyLabel(selected))}</b> · {t('Przygotowano')}: {review?.count||0} {t('razy')}{review?.last?' · '+new Date(review.last).toLocaleDateString(document.documentElement.lang==='en'?'en-GB':'pl-PL'):''}</p>
    <button className="hc-ghost" onClick={()=>recordBookCooking(selected.id)}>{t('Ugotowałem / upiekłem poza planem')} ✓</button>
   </div>
   <CookingTimeline plan={schedule(selected,0)} relative showSteps />
   <p>{selected.note}</p>
   <p>{t('Alergeny')}: {info.allergens.length?info.allergens.join(', '):t('Sprawdź etykiety składników.')}</p>
   <p className="hc-book-note">{t('Kcal są szacunkowe: suma energii składników podzielona przez liczbę porcji. Uwzględniają podany tłuszcz i dodatki. Marki produktów i rzeczywisty uzysk zmieniają wynik.')}</p>
   <button className="hc-primary" onClick={()=>start(selected)}>{getKitchen().recipe===selected.id?t('Otwórz plan gotowania'):t('Zaplanuj ten przepis')} →</button>
   {confirm&&<div className="hc-book-confirm" role="group" aria-label={t('Zmiana przepisu')}>
    <p>{t('Zastąpić obecny plan? Postęp przygotowania i timery tego gotowania zostaną usunięte. Pozostałe timery zostają.')}</p>
    <button className="hc-primary" onClick={()=>replace(selected)}>{t('Zastąp plan')}</button><button className="hc-ghost" onClick={()=>setConfirm(false)}>{t('Anuluj')}</button>
   </div>}
   <h3>{t('Składniki')} · {selected.servings} {t('porcje')}</h3>
   <ul className="hc-book-ingredients">{selected.ingredients.map(i=><li key={i.id}><b>{i.n}</b><span>{i.q}</span></li>)}</ul>
   <h3>{t('Sprzęt')}</h3><ul>{selected.equipment.map(i=><li key={i.id}>{i.n}</li>)}</ul>
   <h3>{t('Krok po kroku')}</h3><ol className="hc-book-steps">{selected.tasks.map(task=><li key={task.id}><h4>{task.title} · {task.min} min</h4><p>{task.detail}</p>{task.safety&&<p className="hc-book-note">{task.safety}</p>}</li>)}</ol>
   <details><summary>{t('Jak oszacowano kcal i źródła')}</summary>
    <p>{t('Orientacyjne wartości redakcyjne kcal/100 g, nie pomiar laboratoryjny. Masy dotyczą części jadalnych; ryż, kasze i makarony podano na sucho. Przepisy są opracowaniami HomeCraft, a linki służą jako inspiracja i zasady bezpieczeństwa. Nie potwierdzono testem w kuchni.')}</p>
    <ul>{info.nutrition.map((i,index)=><li key={index}>{i.n}: {i.grams} g × {i.kcal100} kcal/100 g</li>)}</ul>
    <ul>{info.sources.map(url=><li key={url}><a href={url} target="_blank" rel="noreferrer">{new URL(url).hostname}</a></li>)}</ul>
   </details>
  </article>
 </section>;}
 const list=filterRecipes(filters,favourites,RECIPES,feedback);
 return <section className="screen hc-book" aria-label={t('Książka kucharska')}>
  <h2 ref={heading} tabIndex={-1}>{t('Wybierz przepis')}</h2>
  <p className="hc-book-intro">{RECIPES.length} {t('przepisów do codziennego gotowania. Wybierz danie, przygotuj składniki i gotuj z timerami.')}</p>
  <div className="hc-book-sections" role="group" aria-label={t('Dział książki')}><button className="hc-ghost" aria-pressed={!filters.category} onClick={()=>change({category:''})}>{t('Wszystkie')}</button>{BOOK_CATEGORIES.map(c=><button key={c} className="hc-ghost" aria-pressed={filters.category===c} onClick={()=>change({category:filters.category===c?'':c})}>{t(c)}</button>)}</div>
  <div className="hc-card hc-book-filters">
   <label className="hc-field"><span>{t('Szukaj przepisu lub składnika')}</span><input className="hc-input" type="search" aria-label={t('Szukaj przepisu lub składnika')} value={filters.query} onChange={e=>change({query:e.target.value})} placeholder={t('Np. kurczak, pierogi, tofu…')}/></label>
   <button type="button" className="hc-ghost hc-editorial-filter-toggle" aria-expanded={advanced} aria-controls="book-advanced-filters" onClick={()=>setAdvanced(v=>!v)}><span aria-hidden="true">☷</span> {t('Filtry i sortowanie')} {advanced?'−':'+'}</button>
   <div id="book-advanced-filters" className={'hc-editorial-advanced'+(advanced?' is-open':'')}>
   <div className="hc-book-filter-row">
    <label className="hc-field"><span>{t('Kuchnia')}</span><select className="hc-input" aria-label={t('Kuchnia')} value={filters.cuisine} onChange={e=>change({cuisine:e.target.value})}><option value="">{t('Wszystkie')}</option>{BOOK_CUISINES.map(c=><option key={c} value={c}>{t(c)}</option>)}</select></label>
    <label className="hc-field"><span>{t('Rodzaj posiłku')}</span><select className="hc-input" aria-label={t('Rodzaj posiłku')} value={filters.category} onChange={e=>change({category:e.target.value})}><option value="">{t('Wszystkie')}</option>{BOOK_CATEGORIES.map(c=><option key={c} value={c}>{t(c)}</option>)}</select></label>
   </div>
   <div className="hc-book-filter-row">
    <label className="hc-field"><span>{t('Dieta')}</span><select className="hc-input" aria-label={t('Dieta')} value={filters.diet} onChange={e=>change({diet:e.target.value})}><option value="">{t('Wszystkie')}</option>{BOOK_DIETS.map(d=><option key={d} value={d}>{t(d)}</option>)}</select></label>
    <label className="hc-field"><span>{t('Urządzenie')}</span><select className="hc-input" aria-label={t('Urządzenie')} value={filters.device} onChange={e=>change({device:e.target.value})}><option value="">{t('Wszystkie')}</option>{BOOK_DEVICES.map(d=><option key={d} value={d}>{t(d)}</option>)}</select></label>
   </div>
   <label className="hc-field"><span>{t('Sortowanie')}</span><select className="hc-input" aria-label={t('Sortowanie')} value={filters.sort} onChange={e=>change({sort:e.target.value as BookSort})}>
    <option value="name">{t('Nazwa A–Z')}</option><option value="time">{t('Najkrótszy czas')}</option><option value="kcal">{t('Najmniej kcal na porcję')}</option><option value="kcal-desc">{t('Najwięcej kcal na porcję')}</option><option value="rating">{t('Najwyżej ocenione')}</option><option value="health">{t('Więcej składników roślinnych')}</option><option value="difficulty">{t('Najłatwiejsze')}</option><option value="cooked">{t('Najczęściej przygotowywane')}</option><option value="recent">{t('Ostatnio przygotowywane')}</option>
   </select></label>
   <div className="hc-book-filter-row"><label className="hc-field"><span>{t('Trudność')}</span><select className="hc-input" value={filters.difficulty||''} onChange={e=>change({difficulty:e.target.value})}><option value="">{t('Wszystkie')}</option>{['Łatwy','Średni','Zaawansowany'].map((x,i)=><option key={x} value={i+1}>{t(x)}</option>)}</select></label><label className="hc-field"><span>{t('Wskaźnik składników')}</span><select className="hc-input" value={filters.health||''} onChange={e=>change({health:e.target.value})}><option value="">{t('Wszystkie')}</option><option value="green">{t('Więcej roślin')}</option><option value="moderate">{t('Umiarkowanie')}</option><option value="occasional">{t('Okazjonalnie')}</option></select></label></div>
   </div>
   <div className="hc-book-switches"><button className="hc-ghost" aria-pressed={!!filters.ratedOnly} onClick={()=>change({ratedOnly:!filters.ratedOnly})}>{t('Ocenione')}</button><button className="hc-ghost" aria-pressed={filters.quick} onClick={()=>change({quick:!filters.quick})}>{t('Do 30 min')}</button><button className="hc-ghost" aria-pressed={filters.favouritesOnly} onClick={()=>change({favouritesOnly:!filters.favouritesOnly})}>★ {t('Ulubione')} ({favourites.length})</button></div>
  </div>
  <p role="status">{t('Wyniki')}: {list.length} / {RECIPES.length}</p>
  {!list.length&&<div className="hc-card"><p>{t('Brak pasujących przepisów. Zmień filtry lub dodaj przepisy do ulubionych.')}</p><button className="hc-ghost" onClick={()=>change({...EMPTY_FILTERS})}>{t('Wyczyść filtry')}</button></div>}
  <p className="hc-health-legend"><span><i className="hc-health-dot green"/>{t("Więcej roślin")}</span><span><i className="hc-health-dot moderate"/>{t("Umiarkowanie")}</span><span><i className="hc-health-dot occasional"/>{t("Okazjonalnie")}</span><small>{t("Orientacyjna ocena składników, nie pełna wartość odżywcza.")}</small></p><div className="hc-book-grid">{list.slice(0,limit).map(r=><article key={r.id} className="hc-card hc-book-card">
   <button type="button" className="hc-book-open" onClick={()=>open(r)} aria-label={`${t('Otwórz przepis')}: ${r.name}`}/>
   <div className="hc-book-top"><p className="hc-tag">{t(bookInfo(r).cuisine)} · {t(bookInfo(r).category)}</p>{star(r)}</div>
   <h2 className="hc-health-title"><HealthDot recipe={r}/>{r.name}</h2><p className="hc-book-labels">{bookInfo(r).diets.slice(0,2).map(d=><span key={d}>{t(d)}</span>)}{bookInfo(r).devices.slice(0,1).map(d=><span key={d}>{t(d)}</span>)}</p><p className="hc-book-facts"><b>≈ {recipeKcal(r)} {t('kcal / porcję')}</b><span>{minLabel(totalMinutes(r))} · {r.servings} {t('porcje')}</span></p>
   <p className="hc-book-review"><span>{feedback[r.id]?.rating?'★ '+feedback[r.id].rating+'/5':t('Bez oceny')}</span><span>{t(difficultyLabel(r))}</span>{!!feedback[r.id]?.count&&<span>{feedback[r.id].count}× {t('Przygotowano')}</span>}</p>
  </article>)}</div>
  {list.length>limit&&<button className="hc-primary" onClick={()=>setLimit(n=>{rememberedLimit=n+20;return rememberedLimit;})}>{t('Pokaż kolejne 20')}</button>}
  <p className="hc-book-note">{t('Kcal i czasy są orientacyjne. Przepisy nie zostały przetestowane na fizycznych urządzeniach. Większe ilości mogą wymagać kilku partii i dłuższego czasu.')}</p>
 </section>;
}
