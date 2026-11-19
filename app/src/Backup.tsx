import { useRef, useState } from 'react';
import { translate, t } from './i18n';
import { coffeesKey, photosKey, validStore, validPhotos } from './coffees';
const keys=['cremalab.iphone.v3','cremalab.iphone.v2','cremalab.theme','cremalab.preferences.v1',coffeesKey,photosKey] as const;
// Keys added after the first backup format: older backups simply do not contain them.
const optional:string[]=['cremalab.preferences.v1',coffeesKey,photosKey];
const methods=['espresso','aeropress','v60','french','turkish','moka'];
function validData(raw: unknown): raw is Record<string,string|null> {
 if(!raw || typeof raw!=='object')return false;
 const values=raw as Record<string,unknown>;
 if(!keys.every(k=>values[k]===null || typeof values[k]==='string' || optional.includes(k)&&values[k]===undefined))return false;
 if(values['cremalab.theme']!==null&&!['palarnia','cafe','bar','studio'].includes(String(values['cremalab.theme'])))return false;
 try { if(typeof values[coffeesKey]==='string'&&!validStore(JSON.parse(values[coffeesKey] as string)))return false; if(typeof values[photosKey]==='string'&&!validPhotos(JSON.parse(values[photosKey] as string)))return false; if(typeof values['cremalab.preferences.v1']==='string'){const p=JSON.parse(values['cremalab.preferences.v1']);if(!['palarnia','bar','sage','soft'].includes(p.theme)||!['standard','compact'].includes(p.density)||!['pl','en'].includes(p.language)||p.mode!==undefined&&!['system','light','dark'].includes(p.mode))return false;} for(const key of keys.slice(0,2)) {const str=values[key];if(str===null)continue;const s=JSON.parse(String(str));if(!s||!methods.includes(s.method)||!s.params||!s.lelit)return false;
 // Imported history reaches the existing engine's HTML renderer: accept only
 // plain text and bounded numeric values, never markup or invalid ratings.
 const safe=(v:unknown):boolean=>typeof v==='string'?!/[<>]/.test(v):typeof v==='number'?Number.isFinite(v):v===null||typeof v==='boolean'||(typeof v==='object'&&Object.values(v).every(safe));
 if(!safe(s)||s.hist&&(!Array.isArray(s.hist)||s.hist.length>100||!s.hist.every((h:{method:string;stars:number;taste:string;body:string})=>h&&methods.includes(h.method)&&Number.isInteger(h.stars)&&h.stars>=1&&h.stars<=5&&['kwasne','wodniste','ok','gorzkie','cierpkie'].includes(h.taste)&&['slaba','ok','mocna'].includes(h.body))))return false;
 }}catch{return false;}return true;
}
export const backupKey='cremalab.backup.v1';
export const lastBackup=():number=>{try{return Number(JSON.parse(localStorage.getItem(backupKey)||'{}').at)||0;}catch{return 0;}};
const markBackup=()=>{try{localStorage.setItem(backupKey,JSON.stringify({at:Date.now()}));}catch{}window.dispatchEvent(new CustomEvent('crema:data'));};
export function Backup(){
 const input=useRef<HTMLInputElement>(null);const [message,setMessage]=useState('');
 function download(){try{const data=Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)]));const blob=new Blob([JSON.stringify({app:'Crema Lab',version:1,data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`crema-lab-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);markBackup();setMessage('Kopia danych jest gotowa do zapisania.');}catch{setMessage('Nie udało się odczytać danych z przeglądarki.');}}
 async function restore(file?:File){if(!file)return;try{if(file.size>12_000_000)throw Error();const backup=JSON.parse(await file.text());if(backup.app!=='Crema Lab'||backup.version!==1||!validData(backup.data))throw Error();if(!window.confirm(translate('Zastąpić ustawienia i historię danymi z kopii? Bieżące parzenie zostanie zakończone.')))return;
 const before=keys.map(k=>[k,localStorage.getItem(k)] as const);try{keys.forEach(k=>{if(optional.includes(k)&&backup.data[k]===undefined)return;backup.data[k]===null?localStorage.removeItem(k):localStorage.setItem(k,backup.data[k]);});}catch(error){before.forEach(([k,v])=>v===null?localStorage.removeItem(k):localStorage.setItem(k,v));throw error;}location.reload();
 }catch{setMessage('Nie można wczytać kopii. Wybierz poprawny plik Crema Lab.');}finally{if(input.current)input.current.value='';}}
 return <details className="details-card backup" id="backupCard"><summary>{t('Kopia Twoich danych')} <span>↓</span></summary><p className="subtle">{t('Zapisz historię, kalibrację i ustawienia do pliku. Możesz przenieść je na inne urządzenie.')}</p><div className="backup-actions"><button onClick={download}>{t('Eksportuj kopię')}</button><button onClick={()=>input.current?.click()}>{t('Wczytaj kopię')}</button></div><input ref={input} type="file" accept="application/json,.json" hidden onChange={e=>void restore(e.target.files?.[0])}/><p role="status" className="subtle">{message&&t(message)}</p></details>
}
