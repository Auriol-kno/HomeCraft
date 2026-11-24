import { useSyncExternalStore } from 'react';
import { BOOK_KEY, parseFavourites } from './cookbook-data';
import { TOAST_EVENT } from './timers';
import { t } from './en';
let cached: string[] | null = null;
const listeners = new Set<()=>void>();
function read(){try{return parseFavourites(localStorage.getItem(BOOK_KEY));}catch{return [];}}
const get=()=>cached??=read();
const subscribe=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l);};};
export const useBookFavourites=()=>useSyncExternalStore(subscribe,get,get);
export function toggleBookFavourite(id: string){
 const ids=get(), next=ids.includes(id)?ids.filter(x=>x!==id):[...ids,id];
 cached=next;
 try{localStorage.setItem(BOOK_KEY,JSON.stringify({v:1,ids:next}));}catch{
  window.dispatchEvent(new CustomEvent(TOAST_EVENT,{detail:t('Nie udało się zapisać ulubionych. Zmiana działa do zamknięcia aplikacji.')}));
 }
 listeners.forEach(l=>l());
}
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===BOOK_KEY||e.key===null){cached=read();listeners.forEach(l=>l());}});
