import { messages } from './messages';
// Polish is the source language. English is looked up phrase by phrase in messages.ts
// (gettext style: the Polish phrase is the key; numbers stay dynamic).
export const currentLanguage=()=>document.documentElement.lang==='en'?'en':'pl';
const dictionary=new Map(messages.map(([pl,en])=>[pl.toLocaleLowerCase('pl'),en]));
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const pattern=new RegExp('(?<![\\p{L}])(?:'+[...dictionary.keys()].sort((a,b)=>b.length-a.length).map(escape).join('|')+')(?![\\p{L}])','giu');
export function translate(text:string):string {
 if(currentLanguage()==='pl')return text;
 return text.replace(pattern,match=>{if(match==='I')return match;const result=dictionary.get(match.toLocaleLowerCase('pl'))||match;if(match.length>1&&match===match.toUpperCase()&&/[\p{L}]/u.test(match))return result.toUpperCase();return result;}).replace(/(\d),(\d)/g,'$1.$2');
}
/** For React: translate a Polish UI phrase for the current language. */
export const t=translate;

// The brewing engine writes its text through setText/setHTML/setAttr, which translate at write
// time and remember the Polish source. A language switch re-renders the engine and re-applies
// the remembered sources in its static fragments. No MutationObserver is involved.
const textSource=new WeakMap<Text,string>();
const attrSource=new WeakMap<Element,Map<string,string>>();
const attrs=['aria-label','title','placeholder','aria-valuetext'];
const skip=(n:Node)=>!!n.parentElement?.closest('script,style,#appLanguage');
function localize(node:Node){
 if(node instanceof Text){if(skip(node))return;const source=textSource.has(node)?textSource.get(node)!:node.data;textSource.set(node,source);const out=translate(source);if(node.data!==out)node.data=out;return;}
 if(node instanceof Element){for(const name of attrs){const value=node.getAttribute(name);if(value===null)continue;let map=attrSource.get(node);if(!map)attrSource.set(node,map=new Map());const source=map.has(name)?map.get(name)!:value;map.set(name,source);const out=translate(source);if(value!==out)node.setAttribute(name,out);}}
 for(const child of node.childNodes)localize(child);
}
export function setText(el:Node|null,value:unknown){if(!el)return;const source=String(value??'');el.textContent=translate(source);const node=el instanceof Text?el:el.firstChild;if(node instanceof Text)textSource.set(node,source);}
export function setHTML(el:Element|null,html:unknown){if(!el)return;el.innerHTML=String(html??'');localize(el);}
export function setAttr(el:Element|null,name:string,value:unknown){if(!el)return;const source=String(value??'');let map=attrSource.get(el);if(!map)attrSource.set(el,map=new Map());map.set(name,source);el.setAttribute(name,translate(source));}
/** Localize the engine's static fragments now and after every language change. */
export function startLocalization(){
 const roots=()=>document.querySelectorAll('.engine-panel');
 const refresh=()=>{for(const r of roots())localize(r);};
 refresh();window.addEventListener('crema:preferences',refresh);
 return ()=>window.removeEventListener('crema:preferences',refresh);
}
