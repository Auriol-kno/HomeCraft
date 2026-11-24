import { useSyncExternalStore } from 'react';
import { BOOK_KEY, parseFavourites, type FeedbackMap } from './cookbook-data';
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

export const FEEDBACK_KEY='homecraft.cookbook.feedback.v1';
const empty={rating:0,count:0,last:0};
function loadFeedback():FeedbackMap{
 try{
  const raw=JSON.parse(localStorage.getItem(FEEDBACK_KEY)||'{}'), result:FeedbackMap={};
  for(const [id,value] of Object.entries(raw)){
   if(!/^book-\d+$|^[a-z0-9-]+$/.test(id)||!value||typeof value!=='object')continue;
   const v=value as {rating?:number;count?:number;last?:number};
   result[id]={rating:Number.isInteger(v.rating)&&v.rating!>=1&&v.rating!<=5?v.rating!:0,count:Number.isSafeInteger(v.count)&&v.count!>=0?v.count!:0,last:Number.isFinite(v.last)&&v.last!>=0?v.last!:0};
  }
  return result;
 }catch{return {};}
}
let feedback:FeedbackMap|null=null;
const feedbackListeners=new Set<()=>void>();
const getFeedback=()=>feedback??=loadFeedback();
const subscribeFeedback=(l:()=>void)=>{feedbackListeners.add(l);return()=>{feedbackListeners.delete(l);};};
export const useBookFeedback=()=>useSyncExternalStore(subscribeFeedback,getFeedback,getFeedback);
function updateFeedback(id:string,fn:(v:typeof empty)=>typeof empty){
 feedback={...getFeedback(),[id]:fn(getFeedback()[id]||empty)};
 try{localStorage.setItem(FEEDBACK_KEY,JSON.stringify(feedback));}catch{window.dispatchEvent(new CustomEvent(TOAST_EVENT,{detail:t('Nie udało się zapisać oceny. Zmiana działa do zamknięcia aplikacji.')}));}
 feedbackListeners.forEach(l=>l());
}
export function rateBookRecipe(id:string,rating:number){if(Number.isInteger(rating)&&rating>=0&&rating<=5)updateFeedback(id,v=>({...v,rating}));}
export function recordBookCooking(id:string){updateFeedback(id,v=>({...v,count:v.count+1,last:Date.now()}));}
if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===FEEDBACK_KEY||e.key===null){feedback=loadFeedback();feedbackListeners.forEach(l=>l());}});
