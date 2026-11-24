export type Theme = 'pastel' | 'palarnia' | 'bar' | 'soft' | 'line';
export type Density = 'standard' | 'compact';
export type Language = 'pl' | 'en';
export type Mode = 'system' | 'light' | 'dark';
export interface Preferences { theme:Theme; density:Density; language:Language; mode:Mode }
const key='cremalab.preferences.v1';
const themes:Theme[]=['pastel','palarnia','bar','soft','line'];
// 'sage' (Szałwia) was replaced by 'bar' (Kawiarnia) in the same place in the list.
const migrate=(t:unknown)=>t==='sage'?'bar':t;
const modes:Mode[]=['system','light','dark'];
const fallback:Preferences={theme:'pastel',density:'standard',language:'pl',mode:'system'};
export const readPreferences=():Preferences=>{try{const p=JSON.parse(localStorage.getItem(key)||'{}');const theme=migrate(p.theme) as Theme;return {theme:themes.includes(theme)?theme:'pastel',density:p.density==='compact'?'compact':'standard',language:p.language==='en'?'en':'pl',mode:modes.includes(p.mode)?p.mode:'system'};}catch{return {...fallback};}};
const darkQuery=typeof matchMedia==='function'?matchMedia('(prefers-color-scheme: dark)'):null;
export const isDark=(p:Preferences)=>p.mode==='dark'||(p.mode==='system'&&!!darkQuery?.matches);
const bars:Record<Theme,[string,string]>={pastel:['#B9C9C4','#18211F'],palarnia:['#F5EEE2','#1B1512'],bar:['#F3F1EC','#120F0D'],soft:['#E7E7E5','#1F2125'],line:['#ECEEE6','#151714']};
export function applyPreferences(p:Preferences){const root=document.documentElement;root.dataset.theme=p.theme;root.dataset.density=p.density;root.dataset.mode=p.mode;root.lang=p.language;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',bars[p.theme][isDark(p)?1:0]);}
export function savePreferences(p:Preferences){applyPreferences(p);try{localStorage.setItem(key,JSON.stringify(p));}catch{}window.dispatchEvent(new CustomEvent('crema:preferences',{detail:p}));}
// Pastel became the main look on 2026-11-24. Once per device, a saved old default (Palarnia) moves to
// Pastel; any other chosen theme stays. The previous theme can be picked again in Ustawienia.
const pastelKey='homecraft.pastelDefault.v1';
try{if(!localStorage.getItem(pastelKey)){localStorage.setItem(pastelKey,'1');const raw=JSON.parse(localStorage.getItem(key)||'null');if(raw&&raw.theme==='palarnia')localStorage.setItem(key,JSON.stringify({...readPreferences(),theme:'pastel'}));}}catch{}
applyPreferences(readPreferences());
// Follow the phone when the mode is "system" (e.g. iOS switches to dark at sunset).
darkQuery?.addEventListener?.('change',()=>applyPreferences(readPreferences()));
