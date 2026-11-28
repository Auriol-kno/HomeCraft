import { createRoot } from 'react-dom/client';
import './theme';
import './legacy.css';
import './app.css';
import './palarnia.css';
import './appearance.css';
import './mode.css';
import './polish.css';
import './overrides.css';
import './bar.css';
import './line.css';
import './pastel.css';
import './editorial.css';
import { App } from './App';
import { loadCookbook } from './modules/cookbook-load';
createRoot(document.getElementById('root')!).render(<App />);
// Ask the browser to keep history and calibration (Safari may otherwise clear site data).
void navigator.storage?.persist?.().catch(()=>false);
// Offline: cache the app after the first visit so it opens without a network.
// The 600 cookbook recipes are a separate file: fetch it once the first screen is up, so the book opens
// instantly and works offline. Then cache what this version uses and drop older script/style files.
const idle=(fn:()=>void)=>{const w=window as Window&{requestIdleCallback?:(cb:()=>void,o?:{timeout:number})=>number};if(w.requestIdleCallback)w.requestIdleCallback(fn,{timeout:4000});else setTimeout(fn,2000);};
const sameOrigin=()=>performance.getEntriesByType('resource').map(e=>e.name).filter(u=>u.startsWith(location.origin));
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 window.addEventListener('load',()=>{navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').then(async reg=>{
  await navigator.serviceWorker.ready;
  const worker=()=>reg.active||navigator.serviceWorker.controller;
  worker()?.postMessage({type:'cache',urls:[location.href.split('#')[0],...sameOrigin()]});
  idle(()=>{loadCookbook().then(()=>{
   const urls=[location.href.split('#')[0],...sameOrigin()];
   worker()?.postMessage({type:'cache',urls});
   // Only online and only after this version's files are known: never prune while offline.
   if(navigator.onLine)worker()?.postMessage({type:'prune',keep:urls});
  }).catch(()=>{});});
 }).catch(()=>{});});
}else window.addEventListener('load',()=>idle(()=>{loadCookbook().catch(()=>{});}));
