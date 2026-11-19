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
import { App } from './App';
createRoot(document.getElementById('root')!).render(<App />);
// Ask the browser to keep history and calibration (Safari may otherwise clear site data).
void navigator.storage?.persist?.().catch(()=>false);
// Offline: cache the app after the first visit so it opens without a network.
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 window.addEventListener('load',()=>{navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').then(async reg=>{
  await navigator.serviceWorker.ready;
  const urls=performance.getEntriesByType('resource').map(e=>e.name).filter(u=>u.startsWith(location.origin));
  (reg.active||navigator.serviceWorker.controller)?.postMessage({type:'cache',urls:[location.href.split('#')[0],...urls]});
 }).catch(()=>{});});
}
