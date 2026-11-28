import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { t } from './en';
import { SHOP_ADD_EVENT } from './shopping-data';
import { photoUrl, removePhoto, setPhoto, usePhotos } from './pantry-photos';
import { categoryTotals, daysUntil, expenseEnvelope, EXPENSE_CATEGORIES, EXPENSE_KEY, EXPIRY_TYPES, isLow, loadExpenses, loadPantry, MAX_EXPENSE_ENTRIES, MAX_PANTRY_ITEMS, MAX_VALUE, monthTotal, PANTRY_CATEGORIES, pantryEnvelope, PANTRY_KEY, PANTRY_LOCATIONS, PANTRY_UNITS, pantryValue, type ExpenseCategory, type ExpenseEntry, type ExpenseState, type ExpiryType, type PantryCategory, type PantryItem, type PantryLocation, type PantryUnit } from './household-store';

const id = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
const money = (v:number) => new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(v);
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const currentMonth = () => today().slice(0,7);

function useStoredState<T>(initial:()=>T,key:string,serialize:(x:T)=>string):[T,React.Dispatch<React.SetStateAction<T>>,boolean]{
 const [state,setState]=useState<T>(initial),[error,setError]=useState(false); const first=useRef(true);
 useEffect(()=>{if(first.current){first.current=false;return;}try{localStorage.setItem(key,serialize(state));setError(false);}catch{setError(true);}},[key,serialize,state]);
 return [state,setState,error];
}

/** Round photo button for a product. Tap → take or pick a photo, or remove it. */
function ProductPhoto({name,onNotice}:{name:string;onNotice:(m:string)=>void}){
 usePhotos();
 const url=photoUrl(name), [open,setOpen]=useState(false), [busy,setBusy]=useState(false);
 const pick=async(file?:File)=>{if(!file)return;setBusy(true);try{await setPhoto(name,file);onNotice(`${t('Zapisano zdjęcie')}: ${name}`);}catch{onNotice(t('Nie udało się zapisać zdjęcia na tym urządzeniu.'));}finally{setBusy(false);setOpen(false);}};
 const drop=async()=>{try{await removePhoto(name);onNotice(`${t('Usunięto zdjęcie')}: ${name}`);}catch{onNotice(t('Nie udało się usunąć zdjęcia.'));}setOpen(false);};
 return <div className="hc-photo">
  <button type="button" className={'hc-photo-btn'+(url?' has-photo':'')} aria-expanded={open} aria-label={url?`${t('Zdjęcie produktu')}: ${name}. ${t('Zmień lub usuń')}`:`${t('Dodaj zdjęcie')}: ${name}`} onClick={()=>setOpen(o=>!o)} disabled={busy}>
   {url?<img src={url} alt="" />:<span aria-hidden="true">{name.trim().charAt(0).toLocaleUpperCase('pl')||'?'}</span>}
  </button>
  {open&&<div className="hc-photo-menu" role="group" aria-label={t('Zdjęcie produktu')}>
   <label className="hc-primary hc-photo-pick">{url?t('Zmień zdjęcie'):t('Zrób lub wybierz zdjęcie')}<input type="file" accept="image/*" capture="environment" onChange={e=>{void pick(e.target.files?.[0]);e.target.value='';}} /></label>
   {url&&<button type="button" className="hc-ghost" onClick={()=>void drop()}>{t('Usuń zdjęcie')}</button>}
   <button type="button" className="hc-ghost" onClick={()=>setOpen(false)}>{t('Anuluj')}</button>
  </div>}
 </div>;
}

export function PantryScreen(){
 const [newPhoto,setNewPhoto]=useState<File|null>(null), newPhotoUrl=useMemo(()=>newPhoto?URL.createObjectURL(newPhoto):'',[newPhoto]);
 useEffect(()=>()=>{if(newPhotoUrl)URL.revokeObjectURL(newPhotoUrl);},[newPhotoUrl]);
 const [items,setItems,saveError]=useStoredState(()=>loadPantry(localStorage),PANTRY_KEY,pantryEnvelope);
 const listRef=useRef<HTMLDivElement>(null);
 const [name,setName]=useState(''),[quantity,setQuantity]=useState('1'),[unit,setUnit]=useState<PantryUnit>('szt.'),[location,setLocation]=useState<PantryLocation>('Lodówka'),[category,setCategory]=useState<PantryCategory>('Inne'),[expires,setExpires]=useState(''),[expiryType,setExpiryType]=useState<ExpiryType>('Należy spożyć do'),[minimum,setMinimum]=useState('0'),[value,setValue]=useState('0');
 const [query,setQuery]=useState(''),[where,setWhere]=useState<'Wszystkie'|PantryLocation>('Wszystkie'),[status,setStatus]=useState<'Wszystkie'|'Kończy się'|'Krótki termin'>('Wszystkie'),[notice,setNotice]=useState('');
 const expiring=items.filter(x=>{const d=daysUntil(x.expiresAt);return d!==null&&d<=3;}); const low=items.filter(isLow);
 const list=useMemo(()=>items.filter(x=>(where==='Wszystkie'||x.location===where)&&(!query.trim()||x.name.toLocaleLowerCase('pl').includes(query.trim().toLocaleLowerCase('pl')))&&(status==='Wszystkie'||status==='Kończy się'&&isLow(x)||status==='Krótki termin'&&expiring.some(y=>y.id===x.id))).sort((a,b)=>{const ad=daysUntil(a.expiresAt)??99999,bd=daysUntil(b.expiresAt)??99999;return ad-bd||Number(isLow(b))-Number(isLow(a))||a.name.localeCompare(b.name,'pl')}),[items,where,query,status,expiring]);
 const submit=(e:FormEvent)=>{e.preventDefault();const q=Number(quantity.replace(',','.')),min=Number(minimum.replace(',','.')),val=Number(value.replace(',','.'));if(items.length>=MAX_PANTRY_ITEMS){setNotice(t('Osiągnięto limit produktów.'));return;}if(!name.trim()||!Number.isFinite(q)||q<=0||q>MAX_VALUE||!Number.isFinite(min)||min<0||min>MAX_VALUE||!Number.isFinite(val)||val<0||val>MAX_VALUE){setNotice(t('Sprawdź wartości w formularzu.'));return;}const saved=name.trim().slice(0,80);setItems(v=>[{id:id(),name:saved,quantity:q,unit,location,category,expiresAt:expires||undefined,expiryType,minimum:min,unitPrice:val,updatedAt:Date.now()},...v]);if(newPhoto){const f=newPhoto;setNewPhoto(null);setPhoto(saved,f).catch(()=>setNotice(t('Produkt zapisany, ale zdjęcia nie udało się zapisać.')));}setName('');setQuantity('1');setExpires('');setMinimum('0');setValue('0');setNotice(t('Produkt zapisany.'));};
 const adjust=(item:PantryItem,direction:-1|1)=>{const unitStep=['kg','l'].includes(item.unit)?.1:['g','ml'].includes(item.unit)?100:1;setItems(v=>v.map(x=>x.id===item.id?{...x,quantity:Math.min(MAX_VALUE,Math.max(0,Math.round((x.quantity+direction*unitStep)*100)/100)),updatedAt:Date.now()}:x));};
 const toShopping=()=>{const rows=low.map(x=>({name:x.name,qty:x.minimum?`${x.minimum} ${x.unit}`:''}));if(!rows.length){setNotice(t('Brak produktów do uzupełnienia.'));return;}window.dispatchEvent(new CustomEvent(SHOP_ADD_EVENT,{detail:rows}));setNotice(t('Dodano braki do listy zakupów.'));};
 return <section className="screen hc-household" aria-label={t('Moja lodówka')}>
  <div className="hc-metrics"><div><b>{items.length}</b><span>{t('produktów')}</span></div><div><b>{expiring.length}</b><span>{t('krótki termin')}</span></div><div><b>{low.length}</b><span>{t('do uzupełnienia')}</span></div><div><b>{money(pantryValue(items))}</b><span>{t('wartość zapasów')}</span></div></div>
  <details className="details-card" open><summary>{t('Dodaj produkt')} <span>+</span></summary><form className="hc-house-form" onSubmit={submit}>
   <div className="hc-field hc-wide hc-photo-new"><label className={'hc-photo-btn'+(newPhotoUrl?' has-photo':'')} aria-label={newPhoto?t('Zmień zdjęcie'):t('Dodaj zdjęcie produktu (opcjonalnie)')}>{newPhotoUrl?<img src={newPhotoUrl} alt="" />:<span aria-hidden="true">+</span>}<input type="file" accept="image/*" capture="environment" onChange={e=>{setNewPhoto(e.target.files?.[0]||null);e.target.value='';}} /></label><span>{newPhoto?t('Zdjęcie gotowe. Będzie ikonką tego produktu.'):t('Zdjęcie produktu (opcjonalnie). Posłuży jako ikonka.')}</span>{newPhoto&&<button type="button" className="hc-ghost" onClick={()=>setNewPhoto(null)}>{t('Usuń')}</button>}</div>
   <label className="hc-field hc-wide"><span>{t('Nazwa produktu')}</span><input className="hc-input" value={name} onChange={e=>setName(e.target.value)} maxLength={80} required /></label>
   <label className="hc-field"><span>{t('Ilość')}</span><input className="hc-input" inputMode="decimal" value={quantity} onChange={e=>setQuantity(e.target.value)} required /></label>
   <label className="hc-field"><span>{t('Jednostka')}</span><select className="hc-input" value={unit} onChange={e=>setUnit(e.target.value as PantryUnit)}>{PANTRY_UNITS.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></label>
   <label className="hc-field"><span>{t('Miejsce')}</span><select className="hc-input" value={location} onChange={e=>setLocation(e.target.value as PantryLocation)}>{PANTRY_LOCATIONS.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></label>
   <label className="hc-field"><span>{t('Kategoria')}</span><select className="hc-input" value={category} onChange={e=>setCategory(e.target.value as PantryCategory)}>{PANTRY_CATEGORIES.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></label>
   <label className="hc-field"><span>{t('Termin przydatności')}</span><input className="hc-input" type="date" value={expires} onChange={e=>setExpires(e.target.value)} /></label>
   <label className="hc-field"><span>{t('Rodzaj daty')}</span><select className="hc-input" value={expiryType} onChange={e=>setExpiryType(e.target.value as ExpiryType)}>{EXPIRY_TYPES.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></label>
   <label className="hc-field"><span>{t('Minimum zapasu')}</span><input className="hc-input" inputMode="decimal" value={minimum} onChange={e=>setMinimum(e.target.value)} /></label>
   <label className="hc-field"><span>{t('Cena jednostkowa (zł)')}</span><input className="hc-input" inputMode="decimal" value={value} onChange={e=>setValue(e.target.value)} /></label>
   <button className="hc-primary hc-wide" type="submit">{t('Dodaj do zapasów')}</button>
  </form></details>
  {(notice||saveError)&&<p className="hc-note" role="status">{saveError?t('Nie udało się zapisać danych lokalnie.'):notice}</p>}
  <div className="hc-card hc-pantry-tools"><input className="hc-input" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('Szukaj produktu')} aria-label={t('Szukaj produktu')} /><div className="hc-row"><select className="hc-input" value={where} onChange={e=>setWhere(e.target.value as typeof where)} aria-label={t('Miejsce')}><option value="Wszystkie">{t('Wszystkie')}</option>{PANTRY_LOCATIONS.map(x=><option key={x} value={x}>{t(x)}</option>)}</select><select className="hc-input" value={status} onChange={e=>setStatus(e.target.value as typeof status)} aria-label={t('Status zapasu')}><option value="Wszystkie">{t('Wszystkie')}</option><option value="Kończy się">{t('Kończy się')}</option><option value="Krótki termin">{t('Krótki termin')}</option></select></div><button className="hc-ghost" onClick={toShopping}>{t('Dodaj braki do zakupów')} ({low.length})</button></div>
  {!list.length&&<p className="hc-empty" role="status">{t('Brak pasujących produktów.')}</p>}
  <p className="hc-tip">{t('Zdjęcia produktów są tylko na tym urządzeniu i nie trafiają do kopii danych.')}</p>
  <p className="hc-tip">{t('Daty są ważne tylko przy przechowywaniu zgodnym z etykietą. Po dacie „należy spożyć do” nie jedz produktu; „najlepiej spożyć przed” dotyczy głównie jakości.')}</p>
  <div ref={listRef} className="hc-pantry-list" tabIndex={-1} aria-label={t('Lista zapasów')}>{list.map(x=>{const d=daysUntil(x.expiresAt),unsafe=d!==null&&d<0&&x.expiryType==='Należy spożyć do';return <article key={x.id} className={`hc-card hc-stock${unsafe?' is-unsafe':''}`}><div className="hc-stock-head"><ProductPhoto name={x.name} onNotice={setNotice}/><div><p className="hc-tag">{t(x.location)} · {t(x.category)}</p><h3 className="hc-h3">{x.name}</h3><p className={unsafe?'hc-expired':'subtle'}>{x.expiresAt?`${t(x.expiryType)}: ${x.expiresAt} · `:''}{d!==null&&(d<0?(unsafe?t('nie spożywaj'):t('po terminie jakościowym')):d===0?t('zużyj dzisiaj'):t('zostało dni')+`: ${d}`)}</p></div></div><div className="hc-stock-qty"><button onClick={()=>adjust(x,-1)} aria-label={`${t('Zmniejsz')} ${x.name}, ${x.quantity} ${t(x.unit)}`}>−</button><b aria-live="polite">{x.quantity} {t(x.unit)}</b><button onClick={()=>adjust(x,1)} aria-label={`${t('Zwiększ')} ${x.name}, ${x.quantity} ${t(x.unit)}`}>+</button></div><div className="hc-stock-bottom">{isLow(x)?<span className="hc-alert">{t('Kończy się')}</span>:<span>{money(x.quantity*x.unitPrice)}</span>}<button className="hc-x" onClick={()=>{setItems(v=>v.filter(i=>i.id!==x.id));setNotice(`${t('Usunięto')}: ${x.name}`);requestAnimationFrame(()=>listRef.current?.focus());}} aria-label={`${t('Usuń')} ${x.name}`}>×</button></div></article>})}</div>
 </section>;
}

export function ExpensesScreen(){
 const [state,setState,saveError]=useStoredState(()=>loadExpenses(localStorage),EXPENSE_KEY,expenseEnvelope);
 const listRef=useRef<HTMLDivElement>(null);
 const [month,setMonth]=useState(currentMonth()),[amount,setAmount]=useState(''),[dateValue,setDateValue]=useState(today()),[category,setCategory]=useState<ExpenseCategory>('Żywność'),[store,setStore]=useState(''),[note,setNote]=useState(''),[budget,setBudget]=useState(''),[actionNote,setActionNote]=useState('');
 useEffect(()=>setBudget(String(state.budgets[month]||'')),[month,state.budgets]);
 const monthBudget=state.budgets[month]||0,total=monthTotal(state,month),left=monthBudget-total, rows=state.entries.filter(x=>x.date.startsWith(month)).sort((a,b)=>b.date.localeCompare(a.date)); const cats=categoryTotals(state,month);
 const submit=(e:FormEvent)=>{e.preventDefault();const n=Number(amount.replace(',','.'));if(state.entries.length>=MAX_EXPENSE_ENTRIES){setActionNote(t('Osiągnięto limit wydatków.'));return;}if(!Number.isFinite(n)||n<=0||n>MAX_VALUE){setActionNote(t('Sprawdź wartości w formularzu.'));return;}const entry:ExpenseEntry={id:id(),date:dateValue,amount:Math.round(n*100)/100,category,store:store.trim().slice(0,80),note:note.trim().slice(0,120)};setState(v=>({...v,entries:[entry,...v.entries]}));setAmount('');setNote('');setActionNote(t('Wydatek zapisany.'));};
 const saveBudget=()=>{const n=Number(budget.replace(',','.'));if(Number.isFinite(n)&&n>=0&&n<=MAX_VALUE){setState(v=>({...v,budgets:{...v.budgets,[month]:Math.round(n*100)/100}}));setActionNote(t('Budżet zapisany.'));}else setActionNote(t('Sprawdź wartości w formularzu.'));};
 return <section className="screen hc-household" aria-label={t('Kontrola wydatków')}>
  <div className="hc-card hc-budget-head"><label className="hc-field"><span>{t('Miesiąc')}</span><input className="hc-input" type="month" value={month} onChange={e=>setMonth(e.target.value)} /></label><label className="hc-field"><span>{t('Budżet miesięczny (zł)')}</span><span className="hc-inline-input"><input className="hc-input" inputMode="decimal" value={budget} onChange={e=>setBudget(e.target.value)} /><button className="hc-ghost" onClick={saveBudget}>{t('Zapisz')}</button></span></label></div>
  <div className="hc-metrics hc-budget-metrics"><div><b>{money(total)}</b><span>{t('wydano')}</span></div><div className={monthBudget&&left<0?'is-over':''}><b>{monthBudget?money(Math.abs(left)):'—'}</b><span>{monthBudget?(left>=0?t('zostało'):t('ponad budżet')):t('ustaw budżet')}</span></div><div><b>{rows.length}</b><span>{t('transakcji')}</span></div></div>
  {monthBudget>0&&<div className="hc-budget-bar" role="progressbar" aria-label={t('Wykorzystanie budżetu')} aria-valuemin={0} aria-valuemax={monthBudget} aria-valuenow={Math.min(total,monthBudget)} aria-valuetext={`${t('wydano')} ${money(total)} / ${money(monthBudget)}${left<0?`, ${t('ponad budżet')} ${money(-left)}`:''}`}><i style={{width:`${Math.min(100,total/monthBudget*100)}%`}} /></div>}
  <details className="details-card" open><summary>{t('Dodaj wydatek')} <span>+</span></summary><form className="hc-house-form" onSubmit={submit}>
   <label className="hc-field"><span>{t('Kwota (zł)')}</span><input className="hc-input" inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} required /></label><label className="hc-field"><span>{t('Data')}</span><input className="hc-input" type="date" value={dateValue} onChange={e=>setDateValue(e.target.value)} required /></label>
   <label className="hc-field"><span>{t('Kategoria')}</span><select className="hc-input" value={category} onChange={e=>setCategory(e.target.value as ExpenseCategory)}>{EXPENSE_CATEGORIES.map(x=><option key={x} value={x}>{t(x)}</option>)}</select></label><label className="hc-field"><span>{t('Sklep')}</span><input className="hc-input" value={store} onChange={e=>setStore(e.target.value)} maxLength={80} /></label>
   <label className="hc-field hc-wide"><span>{t('Notatka')}</span><input className="hc-input" value={note} onChange={e=>setNote(e.target.value)} maxLength={120} /></label><button className="hc-primary hc-wide" type="submit">{t('Zapisz wydatek')}</button>
  </form></details>
  {saveError&&<p className="hc-note" role="alert">{t('Nie udało się zapisać danych lokalnie.')}</p>}<p className="hc-note" role="status" aria-live="polite">{actionNote}</p>
  {cats.length>0&&<div className="hc-card"><h3 className="hc-h3">{t('Struktura wydatków')}</h3>{cats.map(x=><div className="hc-expense-cat" key={x.category}><span>{t(x.category)}</span><span><i style={{width:`${total?x.amount/total*100:0}%`}} /></span><b>{money(x.amount)}</b></div>)}</div>}
  {!rows.length&&<p className="hc-empty" role="status">{t('Brak wydatków w tym miesiącu.')}</p>}
  <div ref={listRef} className="hc-expense-list" tabIndex={-1} aria-label={t('Lista wydatków')}>{rows.map(x=><article className="hc-card hc-expense" key={x.id}><div><p className="hc-tag">{x.date} · {t(x.category)}</p><h3 className="hc-h3">{x.store||t('Zakup')}</h3>{x.note&&<p className="subtle">{x.note}</p>}</div><b>{money(x.amount)}</b><button className="hc-x" onClick={()=>{setState(v=>({...v,entries:v.entries.filter(e=>e.id!==x.id)}));setActionNote(t('Wydatek usunięty.'));requestAnimationFrame(()=>listRef.current?.focus());}} aria-label={`${t('Usuń')} ${money(x.amount)}`}>×</button></article>)}</div>
 </section>;
}
