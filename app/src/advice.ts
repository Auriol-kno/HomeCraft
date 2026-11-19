// Pure brewing advice: no DOM, no storage. Shared by the engine and unit tests.
import { M, type MethodId } from './recipes.ts';
export type TasteId='kwasne'|'wodniste'|'ok'|'gorzkie'|'cierpkie';
export type BodyId='slaba'|'ok'|'mocna';
export interface Params{dose:number;ratio:number;temp:number|null;grind:number}
export interface LelitSettings{dial:number;time:number;rate:number;fineLower?:boolean}
export interface GrinderInfo{type:'kpro'|'lelit';lelit?:LelitSettings}
export interface Delta{grind?:number;temp?:number;ratio?:number;lelitDial?:number;lelitTime?:number}
export interface Advice{rows:[string,string][];delta:Delta;z:'under'|'ok'|'over';verdict:string}
export const TASTES:{k:TasteId;l:string;z:'under'|'ok'|'over'}[]=[{k:'kwasne',l:'Kwaśne',z:'under'},{k:'wodniste',l:'Wodniste',z:'under'},{k:'ok',l:'Zbalansowane',z:'ok'},{k:'gorzkie',l:'Gorzkie',z:'over'},{k:'cierpkie',l:'Cierpkie',z:'over'}];
export const BODIES:{k:BodyId;l:string}[]=[{k:'slaba',l:'Za słaba'},{k:'ok',l:'W sam raz'},{k:'mocna',l:'Za mocna'}];
export const tasteOf=(k:string)=>TASTES.find(t=>t.k===k)||TASTES[2];
export const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
export const r1=(v:number)=>Math.round(v*10)/10;
export const gr=(g:number)=>Math.round(g*10)/10;
export const fmtNum=(n:number,decimal:','|'.'=',')=>{const r=Math.round(n*10)/10;return (r%1===0?String(r):r.toFixed(1)).replace('.',decimal);};
export const fmtGrind=(g:number,decimal:','|'.'=',')=>gr(g).toFixed(1).replace('.',decimal);

export function advise(method:MethodId,p:Params,preIdx:number,taste:TasteId,body:BodyId,time:number|null,stars:number,gr0?:GrinderInfo,decimal:','|'.'=','):Advice{
  const num=(n:number)=>fmtNum(n,decimal), gtxt=(g:number)=>fmtGrind(g,decimal);
  const fineLower=gr0?.lelit?.fineLower!==false;
  const lFiner=(d:number,st:number)=>clamp(fineLower?d-st:d+st,1,10), lCoarser=(d:number,st:number)=>clamp(fineLower?d+st:d-st,1,10);
  const m=M[method], pr=m.presets[preIdx]||m.presets[0], z=tasteOf(taste).z, st=m.gstep, rows:[string,string][]=[], delta:Delta={};
  const LL=gr0&&gr0.type==='lelit'?gr0.lelit:null;
  const T=m.temp;
  const w=method==='espresso'?pr.w:null;
  if(z==='under'){
    if(LL){const nd=lFiner(LL.dial,.5); if(nd!==LL.dial){delta.lelitDial=nd; rows.push(['Mielenie','Drobniej: pokrętło ½ działki w stronę FINE ('+num(LL.dial)+' → '+num(nd)+'). Kręć tylko podczas mielenia.']);} else rows.push(['Mielenie','Pokrętło jest przy 1, nie schodź niżej. Zwiększ dawkę o 0,5 g albo popraw ubijanie.']);}
    else{const ng=gr(clamp(p.grind-st,0,10)); delta.grind=ng;
    rows.push(['Mielenie','Drobniej: '+gtxt(p.grind)+' → '+gtxt(ng)+' ('+Math.round(st*10)+' klik.).']);}
    if(T&&p.temp!=null&&p.temp<T[1]){const nt=Math.min(T[1],p.temp+(method==='espresso'?1:2)); delta.temp=nt; rows.push(['Woda','Cieplejsza: '+p.temp+' → '+nt+' °C.']);}
    if(method==='espresso'&&time&&w&&time<w[0]) rows.push(['Czas','Shot za szybki ('+num(time)+' s przy celu '+w[0]+'–'+w[1]+' s). Drobniejsze mielenie go wydłuży.']);
    if(method==='aeropress'||method==='french') rows.push(['Czas','Parz o 30 s dłużej przed '+(method==='french'?'wciśnięciem tłoka':'prasowaniem')+'.']);
    if(method==='v60') rows.push(['Nalewanie','Lej wolniej, małą spiralą, i zakręć dripperem po bloomie.']);
    if(method==='moka') rows.push(['Płyta','Startuj z gorętszą wodą w zbiorniku i nie zdejmuj za wcześnie, poczekaj, aż kawa wypłynie cała.']);
    if(method==='turkish') rows.push(['Ogień','Grzej wolniej, na najmniejszym ogniu. Dłuższy kontakt z wodą wydobędzie więcej smaku.']);
    if(taste==='wodniste'&&body!=='mocna'){const nr=gr(clamp(p.ratio-(method==='espresso'?.2:1),m.ratio[0],m.ratio[1])); delta.ratio=nr; rows.push(['Proporcja','Mocniej: 1:'+num(p.ratio)+' → 1:'+num(nr)+'.']);}
  }else if(z==='over'){
    if(LL){const nd=lCoarser(LL.dial,.5); delta.lelitDial=nd; rows.push(['Mielenie','Grubiej: pokrętło ½ działki w stronę COARSE ('+num(LL.dial)+' → '+num(nd)+'). Kręć tylko podczas mielenia.']);}
    else{const ng=gr(clamp(p.grind+st,0,10)); delta.grind=ng;
    rows.push(['Mielenie','Grubiej: '+gtxt(p.grind)+' → '+gtxt(ng)+' ('+Math.round(st*10)+' klik.).']);}
    if(T&&p.temp!=null&&p.temp>T[0]){const nt=Math.max(T[0],p.temp-(method==='espresso'?1:2)); delta.temp=nt; rows.push(['Woda','Chłodniejsza: '+p.temp+' → '+nt+' °C.']);}
    if(method==='espresso'&&time&&w&&time>w[1]) rows.push(['Czas','Shot za długi ('+num(time)+' s przy celu '+w[0]+'–'+w[1]+' s). Grubsze mielenie go skróci.']);
    if(method==='aeropress'||method==='french') rows.push(['Czas','Skróć parzenie o 30 s i wciskaj tłok bez siły.']);
    if(method==='v60') rows.push(['Nalewanie','Mniej mieszania i krótszy bloom (30 s).']);
    if(method==='moka') rows.push(['Płyta','Niższa moc (4 zamiast 6) i zdejmij, gdy strumień zaczyna jaśnieć. Od razu schłodź dół pod zimną wodą.']);
    if(method==='turkish') rows.push(['Ogień','Zdejmij z ognia wcześniej, gdy pianka zacznie rosnąć. Nie dopuść do wrzenia.']);
    if(taste==='cierpkie') rows.push(['Kontrola','Cierpkość to często nierówny przepływ. Rozbij grudki przed ubijaniem lub nalewaniem.']);
  }
  if(body==='slaba'&&!(taste==='wodniste'&&delta.ratio)){const nr=gr(clamp(p.ratio-(method==='espresso'?.2:1),m.ratio[0],m.ratio[1])); if(nr!==p.ratio){delta.ratio=nr; rows.push(['Proporcja','Mocniej: 1:'+num(p.ratio)+' → 1:'+num(nr)+' (ta sama dawka, mniej wody).']);}}
  if(body==='mocna'){const nr=gr(clamp(p.ratio+(method==='espresso'?.2:1),m.ratio[0],m.ratio[1])); if(nr!==p.ratio){delta.ratio=nr; rows.push(['Proporcja','Łagodniej: 1:'+num(p.ratio)+' → 1:'+num(nr)+'.']);}}
  if(z==='ok'&&body!=='slaba'&&body!=='mocna'){
    if(stars&&stars<=3) rows.push(['Ziarno','Smak w balansie, a ocena niska: spróbuj świeższej kawy (7–28 dni od palenia) albo innego ziarna.']);
    else rows.push(['Przepis','Nic nie zmieniaj. Zapisz i powtórz te ustawienia.']);
  }
  if(LL){const est=LL.time*LL.rate; if(Math.abs(est-p.dose)>0.4){const nt=r1(clamp(p.dose/LL.rate,2,20)); delta.lelitTime=nt; rows.push(['Czas mielenia','Lelit daje ≈ '+num(r1(est))+' g przy dawce '+num(p.dose)+' g. Ustaw '+num(nt)+' s na 2 dawki.']);}}
  const verdict=z==='under'?'Niedoekstrahowana':z==='over'?'Przeekstrahowana':'Zbalansowana';
  return {rows,delta,z,verdict};
}
