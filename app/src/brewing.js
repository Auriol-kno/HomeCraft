import { translate, currentLanguage, setText, setHTML, setAttr } from './i18n';
import { M, ORDER, DEF } from './recipes';
const HIST_MAX=100;
import { loadStore, saveStore, addCoffee, findById, recent, touch, summarize, bestEntry, loadPhotos, savePhoto, makeThumb } from './coffees';
import { advise as adviseCore, TASTES, BODIES, tasteOf } from './advice';
const advise=(...a)=>adviseCore(...a.slice(0,8),currentLanguage()==='en'?'.':',');

// Existing brewing engine retained during the React migration. DOM is scoped to stable screen components.
export function initBrewing(navigate, notify) {

'use strict';
const $=id=>document.getElementById(id);
const L=584.34;
const KEY='cremalab.iphone.v3';
let S=JSON.parse(JSON.stringify(DEF));
function load(){
  try{
    let raw=localStorage.getItem(KEY), old=false;
    if(!raw){raw=localStorage.getItem('cremalab.iphone.v2'); old=true;}
    if(!raw) return;
    const v=JSON.parse(raw); if(!v||typeof v!=='object') return;
    if(v.params) ORDER.forEach(k=>{ if(v.params[k]) S.params[k]=Object.assign({},S.params[k],v.params[k]); });
    if(v.pidx) ORDER.forEach(k=>{ if(typeof v.pidx[k]==='number'&&M[k].presets[v.pidx[k]]) S.pidx[k]=v.pidx[k]; });
    if(M[v.method]) S.method=v.method;
    if(typeof v.pre==='boolean') S.pre=v.pre;
    if(v.grinder==='lelit'||v.grinder==='kpro') S.grinder=v.grinder;
    if(v.lelit&&typeof v.lelit==='object') S.lelit=Object.assign({},S.lelit,v.lelit);
    if(MILK[v.milk]) S.milk=v.milk;
    if(ROAST[v.roast]) S.roast=v.roast;
    if(typeof v.warm==='number') S.warm=v.warm;
    if(v.anna===true) S.anna=true;
    if(v.alerts&&typeof v.alerts==='object') S.alerts=Object.assign({},S.alerts,v.alerts);
    if(v.maint&&typeof v.maint==='object') S.maint={shots:+v.maint.shots||0,grams:+v.maint.grams||0,items:Object.assign({},v.maint.items||{})};
    if(!old&&Array.isArray(v.hist)) S.hist=v.hist.filter(h=>h&&M[h.method]).slice(0,HIST_MAX);
  }catch(e){}
}
const MILK={none:{n:'Bez mleka'},cortado:{n:'Cortado',ml:60,t:'55–60'},flat:{n:'Flat white',ml:110,t:'55–60'},capp:{n:'Cappuccino',ml:150,t:'60–65'},latte:{n:'Latte',ml:220,t:'60–65'}};
const ROAST={light:{n:'Jasne',pid:96},medium:{n:'Średnie',pid:94},dark:{n:'Ciemne',pid:91}};
load();
if(!S.anna){S.anna=true; S.pre=false; if(S.params.espresso.temp===93) S.params.espresso.temp=94; try{localStorage.setItem(KEY,JSON.stringify(Object.assign(JSON.parse(localStorage.getItem(KEY)||'{}'),{anna:true,pre:false})));}catch(e){}}
function persist(){window.dispatchEvent(new CustomEvent('crema:data'));try{localStorage.setItem(KEY,JSON.stringify({method:S.method,pre:S.pre,pidx:S.pidx,params:S.params,grinder:S.grinder,lelit:S.lelit,milk:S.milk,roast:S.roast,warm:S.warm,anna:S.anna,maint:S.maint,alerts:S.alerts,hist:S.hist}));}catch(e){}}

let run=false, el=0, t0=0, wl=null, shotCounted=false;
const R={stars:0,taste:null,body:null};

const num=n=>{const r=Math.round(n*10)/10; return (r%1===0?String(r):r.toFixed(1)).replace('.',currentLanguage()==='en'?'.':',');};
const mss=t=>{const s=Math.floor(t); return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
const pct=x=>(Math.max(0,Math.min(1,x))*100).toFixed(1)+'%';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const ease=x=>x<0?0:x>1?1:x;
function interp(pts,t){
  if(t<=pts[0][0]) return pts[0][1];
  for(let i=1;i<pts.length;i++){ if(t<=pts[i][0]){const a=pts[i-1],b=pts[i]; return a[1]+(b[1]-a[1])*((t-a[0])/((b[0]-a[0])||1));} }
  return pts[pts.length-1][1];
}
const ZONES=[
  {n:'TURECKA',a:2,b:3.5,c:'#E9A04A',lane:0,m:'turkish'},
  {n:'ESPRESSO',a:3,b:4.5,c:'#9FD3A0',lane:1,m:'espresso'},
  {n:'AERO/MOKA',a:5,b:7,c:'#F2C94C',lane:0,m:'aeropress',m2:'moka'},
  {n:'V60',a:8,b:9,c:'#A9D8F0',lane:0,m:'v60'},
  {n:'FRENCH P.',a:9,b:10,c:'#E05A6A',lane:1,m:'french'}
];
const gr=g=>Math.round(g*10)/10;
const gtxt=g=>gr(g).toFixed(1).replace('.',currentLanguage()==='en'?'.':',');
const grindName=g=>{const z=ZONES.filter(z=>g>=z.a&&g<=z.b).map(z=>z.n.toLowerCase()); return z.length?z.join(' / '):(g<2?'bardzo drobno':'pomiędzy strefami');};
const kParts=g=>{const t=Math.round(g*10); return Math.floor(t/10)+' + '+(t%10)+' klik.';};
const mname=k=>M[k].short||M[k].name;
function toast(t){const e=$('toast'); setText(e,t); e.classList.add('on'); clearTimeout(toast.h); toast.h=setTimeout(()=>e.classList.remove('on'),1600);}

/* static gauge ticks */
(function(){
  let h='';
  for(let i=0;i<=12;i++){
    const a=(135+22.5*i)*Math.PI/180;
    h+='<line x1="'+(150+100*Math.cos(a)).toFixed(1)+'" y1="'+(150+100*Math.sin(a)).toFixed(1)+'" x2="'+(150+112*Math.cos(a)).toFixed(1)+'" y2="'+(150+112*Math.sin(a)).toFixed(1)+'"/>';
  }
  setHTML($('gTicks'),h);
  setHTML($('znums'),Array.from({length:11},(_,i)=>'<span style="left:'+(i*10)+'%">'+i+'</span>').join(''));
})();
const LABEL_POS=[[66,264],[76,121],[150,70],[224,121],[234,264]];

/* ---------- model ---------- */
function model(){
  const k=S.method, m=M[k], p=S.params[k], pr=m.presets[S.pidx[k]];
  const isE=k==='espresso';
  const water=isE?Math.round(p.dose*p.ratio*10)/10:Math.round(p.dose*p.ratio);
  const timeGauge=(w0,w1,sub)=>({val:el,max:m.tmax,band:[w0,Math.min(w1,m.tmax)],
      labels:[0,.25,.5,.75,1].map(f=>mss(m.tmax*f)),unit:'CZAS · MIN:S',short:'CZAS',sub});
  let d;
  if(isE){
    const w0=pr.w[0], w1=pr.w[1], mid=(w0+w1)/2;
    const pts=S.pre?[[0,0],[1.2,3],[6,3],[8.5,9],[mid-4,9],[mid,8.2],[45,7.5]]:[[0,0],[2,9],[mid-4,9],[mid,8.2],[45,7.5]];
    d={w0,w1,g:{val:el>0?interp(pts,el):0,max:16,band:[8,12],labels:['0','4','8','12','16'],unit:'MANOMETR ANNY · BAR',short:'BAR',sub:'CEL '+w0+'–'+w1+' S'},
      steps:(S.pre?[{a:0,b:6,l:'Preinfuzja, ok. 3 bar'}]:[]).concat([{a:S.pre?6:0,b:w0,l:'Ekstrakcja, 9 bar'},{a:w0,b:w1,l:'Zatrzymaj przy '+num(water)+' g'}]),
      tip:'Kwaśne lub wodniste: zmiel drobniej o 1–2 klik. ('+gtxt(p.grind)+' → '+gtxt(Math.max(0,p.grind-.2))+'). Gorzkie lub cierpkie: grubiej ('+gtxt(p.grind)+' → '+gtxt(Math.min(10,p.grind+.2))+').'};
  }else if(k==='aeropress'){
    const st=pr.steep;
    d={w0:st,w1:st+30,g:timeGauge(st,st+30,'PRASUJ OD '+mss(st)),
      steps:[{a:0,b:10,l:'Wlej '+water+' g wody'},{a:10,b:20,l:'Zamieszaj 3–4 razy'},
        {a:20,b:st,l:S.pidx.aeropress===1?'Parz w pozycji odwróconej':'Załóż tłok i czekaj'},{a:st,b:st+30,l:'Prasuj powoli, ok. 30 s'}],
      tip:S.pidx.aeropress===2?'Koncentrat rozcieńcz gorącą wodą lub mlekiem 1:1. Za mocny: grubiej albo krótsze parzenie.':'Za gorzka: zmiel grubiej o 3–5 klik. ('+gtxt(Math.min(10,p.grind+.4))+') lub skróć parzenie. Płaska i kwaśna: drobniej ('+gtxt(Math.max(0,p.grind-.4))+') albo cieplejsza woda.'};
  }else if(k==='v60'){
    const B=Math.round(p.dose*2), W=water;
    const pts=[[0,0],[10,B],[45,B],[75,Math.round(W*.6)],[90,Math.round(W*.6)],[115,W],[240,W]];
    const v=interp(pts,el);
    d={w0:180,w1:210,pour:v,g:{val:v,max:W,band:[W*.95,W],labels:['0',String(Math.round(W*.25)),String(Math.round(W*.5)),String(Math.round(W*.75)),String(W)],unit:'WAGA · CEL W GRAMACH',short:'G',sub:'CEL TERAZ '+Math.round(v)+' G'},
      steps:[{a:0,b:10,l:'Bloom: wlej '+B+' g',pour:1},{a:10,b:45,l:'Odczekaj, zawiruj dripperem'},{a:45,b:75,l:'Wlej do '+Math.round(W*.6)+' g',pour:1},
        {a:75,b:90,l:'Pauza'},{a:90,b:115,l:'Wlej do '+W+' g',pour:1},{a:115,b:210,l:'Spływanie do 3:00–3:30'}],
      tip:'Spływanie dłuższe niż 3:30: zmiel grubiej o 3–5 klik. ('+gtxt(Math.min(10,p.grind+.4))+'). Szybsze niż 2:30 i kwaśne: drobniej ('+gtxt(Math.max(0,p.grind-.4))+').'};
  }else if(k==='french'){
    const st=pr.steep;
    const steps=[{a:0,b:15,l:'Wlej '+water+' g wody, zalej całą kawę',pour:1},{a:15,b:240,l:'Parz pod pokrywką, bez mieszania'}];
    if(st>240) steps.push({a:240,b:255,l:'Rozbij skorupę, zbierz pianę łyżką'},{a:255,b:st,l:'Odczekaj, fusy opadną'});
    else steps.push({a:240,b:250,l:'Zamieszaj delikatnie skorupę'});
    steps.push({a:Math.max(st,steps[steps.length-1].b),b:st+30,l:'Wciśnij tłok powoli i od razu przelej'});
    d={w0:st,w1:st+30,g:timeGauge(st,st+30,'TŁOK OD '+mss(st)),steps,
      tip:'Mętna lub muląca: zmiel grubiej, wciskaj tłok wolniej i nie wylewaj ostatnich łyków z fusami. Płaska: drobniej o 3–5 klik. ('+gtxt(Math.max(0,p.grind-.4))+') albo dłuższe parzenie.'};
  }else if(k==='moka'){
    const big=S.pidx.moka===2, f0=big?90:70, w0=big?160:130, w1=w0+30;
    d={w0,w1,flow:f0,g:timeGauge(w0,w1,'ZDEJMIJ OK. '+mss(w0)),
      steps:[{a:0,b:f0,l:'Indukcja na średniej mocy (ok. 5–6 z 9), wieczko otwarte',pour:0},
        {a:f0,b:w0,l:'Kawa płynie jak miód: zmniejsz moc do 3–4'},
        {a:w0,b:w1,l:'Strumień jaśnieje: zdejmij z płyty'},
        {a:w1,b:w1+20,l:'Schłodź dół pod zimną wodą i nalej'}],
      tip:'Kawiarki nie ubijaj i nie usypuj górki. Gorzka: zdejmij wcześniej, niższa moc płyty, grubiej ('+gtxt(Math.min(10,p.grind+.3))+'). Kwaśna lub słaba: drobniej ('+gtxt(Math.max(0,p.grind-.3))+') i gorętsza woda na start.'};
  }else{
    const sug=pr.sugar;
    d={w0:150,w1:210,g:timeGauge(150,210,'PIANKA OK. '+mss(150)+'–'+mss(210)),
      steps:[{a:0,b:20,l:'Wsyp '+num(p.dose)+' g kawy'+(sug?' i '+pr.sl+' cukru':'')+' do '+water+' ml zimnej wody, zamieszaj'},
        {a:20,b:150,l:'Grzej na bardzo małym ogniu, nie mieszaj'},
        {a:150,b:210,l:'Pianka rośnie: zdejmij tuż przed wrzeniem'},
        {a:210,b:230,l:'Nalej powoli, najpierw piankę'}],
      tip:'Nie dopuść do wrzenia, bo pianka zniknie i kawa zgorzknieje. Mało pianki: mniej mieszania, wolniejsze grzanie i drobniej ('+gtxt(Math.max(0,p.grind-.2))+').'};
  }
  return Object.assign({k,m,p,pr,isE,water},d);
}

/* ---------- builders ---------- */
function buildPresets(){
  const m=M[S.method], pi=S.pidx[S.method];
  setHTML($('presets'),m.presets.map((x,i)=>'<button type="button" data-i="'+i+'" aria-pressed="'+(i===pi)+'"><span>'+x.n+'</span><small>'+(x.sl||('1:'+num(x.r)))+'</small></button>').join(''));
}
/* ---------- grinder ---------- */
const G=()=>(S.grinder==='lelit'&&S.method==='espresso')?'lelit':'kpro';
const lFiner=(d,st)=>clamp(S.lelit.fineLower?d-st:d+st,1,10);
const lCoarser=(d,st)=>clamp(S.lelit.fineLower?d+st:d-st,1,10);
const r1=v=>Math.round(v*10)/10;
const f1=v=>(Math.round(v*10)/10).toFixed(1).replace('.',currentLanguage()==='en'?'.':',');
function lelitUpdate(){
  const L=S.lelit, p=S.params.espresso, est=L.time*L.rate, need=r1(p.dose/L.rate);
  $('lDial').value=L.dial; $('lDial').style.setProperty('--p',((L.dial-1)/9*100)+'%');
  $('lTime').value=L.time; $('lTime').style.setProperty('--p',((L.time-2)/18*100)+'%');
  // dial strip: show numbers around current, 1 unit = 46px
  const u=46; let h='';
  for(let v=Math.floor(L.dial)-4; v<=Math.ceil(L.dial)+4; v+=.5){
    const x='calc(50% + '+((v-L.dial)*u*(S.lelit.fineLower?-1:1)).toFixed(1)+'px)';
    const vv=((v-1)%10+10)%10+1;
    h+= v%1===0?'<span style="left:'+x+'">'+Math.round(vv)+'</span>':'<span class="half" style="left:'+x+'"></span>';
  }
  h+='<em style="left:8px">◄ '+(S.lelit.fineLower?'FINE':'COARSE')+'</em><em style="right:8px">'+(S.lelit.fineLower?'COARSE':'FINE')+' ►</em><i></i>';
  setHTML($('ldial'),h);
  setHTML($('lread'),'Pokrętło na <b style="color:var(--accent)">'+f1(L.dial)+'</b> przy znaczniku ▲ · czas <b style="color:var(--accent)">'+f1(L.time)+' s</b>');
  setText($('lTimeOut'),f1(L.time)+' s');
  setText($('lTimeHint'),'≈ '+num(r1(est))+' g');
  setHTML($('lMatch'),Math.abs(est-p.dose)>0.4
    ? 'Młynek da ≈ '+num(r1(est))+' g, a dawka to '+num(p.dose)+' g.<button type="button" id="lFit">Ustaw '+num(need)+' s</button>'
    : '<span style="color:var(--good)">✓ Czas pasuje do dawki '+num(p.dose)+' g</span>');
  setText($('lRateTxt'),'Wydajność: '+L.rate.toFixed(2).replace('.',currentLanguage()==='en'?'.':',')+' g/s'+(L.rate===2.5?' (wartość producenta, skalibruj na swojej kawie)':' (Twoja kalibracja)'));
  $('lDirSw').setAttribute('aria-checked',S.lelit.fineLower?'true':'false');
  setText($('lDirTxt'),S.lelit.fineLower?'maleje (np. 5,5 → 5)':'rośnie (np. 5,5 → 6)');
}
function grinderUi(){
  const g=G();
  document.querySelectorAll('#gsel button').forEach(b=>b.setAttribute('aria-checked',b.dataset.g===S.grinder?'true':'false'));
  $('lelitBox').hidden=g!=='lelit'; $('kproBox').hidden=g!=='kpro';
  $('lelitOnly').hidden=!(S.grinder==='lelit'&&S.method!=='espresso');
  if(g==='lelit') lelitUpdate();
}
function sliderDefs(){
  const m=M[S.method], defs=[
    {k:'dose',label:'Dawka kawy',r:m.dose,lo:m.dose[0]+' g',hi:m.dose[1]+' g'},
    {k:'ratio',label:'Proporcja kawa : woda',r:m.ratio,lo:'1:'+num(m.ratio[0]),hi:'1:'+num(m.ratio[1])}];
  if(m.temp&&S.method!=='espresso') defs.push({k:'temp',label:'Temperatura wody',r:m.temp,lo:m.temp[0]+' °C',hi:m.temp[1]+' °C'});
  if(G()==='kpro') defs.push({k:'grind',label:'Mielenie (K-Pro)',r:[0,10,.1],lo:'0 · drobniej',hi:'grubiej · 10'});
  return defs;
}
function buildSliders(){
  const p=S.params[S.method];
  setHTML($('sliders'),sliderDefs().map(d=>
    '<div class="sl"><div class="sl-head"><span id="lab-'+d.k+'">'+d.label+'</span><output id="out-'+d.k+'"></output></div>'
    +'<input type="range" id="sl-'+d.k+'" data-k="'+d.k+'" min="'+d.r[0]+'" max="'+d.r[1]+'" step="'+d.r[2]+'" value="'+p[d.k]+'" aria-labelledby="lab-'+d.k+'">'
    +'<div class="sl-foot"><span>'+d.lo+'</span><span id="hint-'+d.k+'"></span><span>'+d.hi+'</span></div></div>').join('')
    +(S.method==='espresso'?'<p class="g-note pid-note">Temperaturę espresso (PID) ustawiasz w zakładce Lelit Anna.</p>':''));
}
const SCENES={espresso:'sEspresso',aeropress:'sAero',v60:'sV60',french:'sFrench',turkish:'sTurkish',moka:'sMoka'};
function buildAll(){
  document.querySelectorAll('#tabs button').forEach(b=>{const selected=b.dataset.m===S.method;b.setAttribute('aria-selected',selected?'true':'false');b.tabIndex=selected?0:-1;});
  buildPresets(); buildSliders(); grinderUi(); annaUi(); renderHomeCoffee();
  $('preRow').hidden=S.method!=='espresso';
  $('coldNote').hidden=!!M[S.method].temp;
  $('mokaNote').hidden=S.method!=='moka';
  Object.keys(SCENES).forEach(k=>{$(SCENES[k]).style.display=k===S.method?'':'none';});
  $('sCup').style.display=(S.method==='espresso'||S.method==='aeropress')?'':'none';
  update(); renderRating();
}

/* ---------- scene ---------- */
function show(id,on){ $(id).style.opacity=on?1:0; }
function sceneUpdate(d){
  const k=d.k, idle=el===0&&!run;
  let cupF=0, label='', right='';
  const steam=$('steam');
  if(k==='espresso'){
    const t0=S.pre?6:2, f=ease((el-t0)/(d.w1-t0))*.95;
    cupF=el>t0?f:0;
    const pouring=run&&el>t0;
    $('eStream').style.opacity=pouring?1:0;
    if(pouring) tongue(116.5, eyAt(d));
    label='FILIŻANKA'; right='≈ '+num(d.water*ease((el-t0)/((d.w0+d.w1)/2-t0)))+' g';
    steam.setAttribute('transform','translate(0,0)');
  }else if(k==='aeropress'){
    const fillA=ease(el/10), press=ease((el-d.w0)/30);
    const h=72*fillA*(1-press);
    $('aLiq').setAttribute('y',(90-h).toFixed(1)); $('aLiq').setAttribute('height',h.toFixed(1));
    $('aFoam').setAttribute('y',(90-h).toFixed(1)); $('aFoam').style.opacity=h>2?1:0;
    $('aPlunger').setAttribute('transform','translate(0,'+(el>=20?(82-h).toFixed(1):'-60')+')');
    cupF=press*.9;
    show('aS',run&&el>=d.w0&&press<1);
    label=el<d.w0?'KOMORA':'PRASOWANIE'; right=Math.round(d.water*(el<d.w0?fillA:press))+' g';
  }else if(k==='v60'){
    const W=d.water, poured=d.pour, out=clamp(interp([[0,0],[30,0],[210,W*.92]],el),0,poured);
    const bedOp=poured>0?1:0; $('vBed').style.opacity=bedOp;
    const cur=d.steps.find(x=>el>=x.a&&el<x.b);
    show('vKettle',run&&cur&&cur.pour);
    show('vDrip',run&&el>12&&el<215);
    const h=out/W*52; $('vLiq').setAttribute('y',(168-h).toFixed(1));
    label='SERWER'; right=Math.round(out)+' / '+W+' g';
  }else if(k==='french'){
    const fill=ease(el/15), press=ease((el-d.w0)/30), top=164-fill*104;
    $('fLiq').setAttribute('y',top.toFixed(1));
    $('fCrust').setAttribute('y',top.toFixed(1)); $('fCrust').style.opacity=(fill>0&&el<(d.steps.length>4?255:250))?1:0;
    const py=el>=d.w0?(46+press*108):(el>15?46:20);
    $('fPlunger').setAttribute('transform','translate(0,'+(py-14).toFixed(1)+')');
    show('fPour',run&&el<15);
    ['fb1','fb2','fb3'].forEach(b=>$(b).classList.toggle('on',run&&el>15&&el<d.w0));
    label=el<d.w0?'ZAPARZANIE':'TŁOK'; right=el<d.w0?mss(Math.max(0,d.w0-el))+' do tłoka':Math.round(press*100)+'%';
  }else if(k==='moka'){
    const f=ease((el-d.flow)/(d.w0-d.flow))*.92+ease((el-d.w0)/(d.w1-d.w0))*.06, h=f*40;
    $('mLiq').setAttribute('y',(106-h).toFixed(1)); $('mLiq').setAttribute('height',h.toFixed(1));
    show('mFount',run&&el>d.flow-2&&el<d.w1+10);
    const heatOn=run&&el<d.w0; $('mHob').style.opacity=heatOn?(el<d.flow?1:.6):.12; setText($('mHobLv'),heatOn?(el<d.flow?'5':'3'):'0'); $('mHob').classList.toggle('on',heatOn);
    label=el<d.flow?'NA PŁYCIE INDUKCYJNEJ':el<d.w0?'KAWA PŁYNIE':el<d.w1?'ZDEJMIJ Z PŁYTY':'SCHŁÓDŹ DÓŁ';
    right=Math.round(d.water*f)+' / '+d.water+' ml';
  }else{
    const heat=ease((el-20)/(d.w0+20-20)), foam=ease((el-d.w0+30)/60);
    $('tLiq').style.opacity=el>20?1:.55; $('tLiq').setAttribute('y',(128-heat*4).toFixed(1));
    $('tFoam').style.opacity=el>60?Math.min(1,foam+.25):0;
    $('tFoam').setAttribute('cy',(126-foam*24).toFixed(1)); $('tFoam').setAttribute('ry',(5+foam*5).toFixed(1));
    document.querySelectorAll('#flames .flame').forEach(f=>f.classList.toggle('on',run&&el<d.w1));
    $('flames').style.opacity=run&&el<d.w1?1:.25;
    label=el>d.w1?'ZDEJMIJ Z OGNIA':'CEZVE'; right=el<20?'zimna woda':el<d.w0?'grzanie':'pianka '+Math.round(foam*100)+'%';
  }
  if(k==='espresso'||k==='aeropress'){ const cr=$('cupCrema'); cr.setAttribute('rx',cupF>0.02?(12+22*Math.pow(clamp(cupF,0,1),.7)).toFixed(1):'0'); cr.setAttribute('ry',cupF>0.02?(1.4+1.5*clamp(cupF,0,1)).toFixed(2):'0'); }
  const sOn=!reduce&&((k==='espresso'||k==='aeropress')?cupF>.3:k==='v60'?el>30:k==='french'?el>2:k==='moka'?el>(d.flow||70)+5:el>90);
  steam.classList.toggle('on',sOn);
  const sy={espresso:0,aeropress:-2,v60:-6,french:-74,turkish:-26,moka:-62}[k];
  steam.setAttribute('transform','translate(0,'+sy+')');
  setText($('sceneL'),label); setText($('sceneR'),right);
  { const L=label.toLowerCase(); const nl=L.charAt(0).toUpperCase()+L.slice(1); if($('stL').textContent!==nl) setText($('stL'),nl); setText($('stV'),right); }
  /* extraction */
  const ey=eyAt(d), zc=ey<=0?'var(--muted)':ey<18?'var(--cool)':ey<=22?'var(--good)':'var(--bad)';
  const zt=ey<=0?'—':ey<18?'ZA MAŁO':ey<=22?'IDEALNIE':'ZA DUŻO';
  setText($('eyVal'),Math.round(ey)+'%'); setText($('eyZone'),zt); $('eyZone').style.color=zc;
  setText($('stE'),'≈ '+Math.round(ey)+'%'); setText($('stZ'),ey<=0?'':'· '+zt.toLowerCase()); $('stZ').style.color=zc;
  const eh=ey/28*144; $('eyFill').setAttribute('y',(162-eh+ (eh>0?0:0)).toFixed(1)); $('eyFill').setAttribute('height',Math.max(0,eh-2).toFixed(1));
  $('eyTick').setAttribute('y1',(164-eh).toFixed(1)); $('eyTick').setAttribute('y2',(164-eh).toFixed(1));
  const sc=cScale(STREAM,ey), bc=cScale(BREW,ey);
  $('gs1').setAttribute('stop-color',sc); $('gs0').setAttribute('stop-color',cScale(STREAM,Math.max(0,ey-10))); $('gs2').setAttribute('stop-color',cScale(STREAM,Math.max(0,ey-10)));
  $('aS').setAttribute('stroke',bc); $('vDrip').setAttribute('stroke',bc);
  $('gd0').setAttribute('stop-color',bc); $('gc1').setAttribute('stop-color',k==='espresso'?sc:'#5A2F18');
  $('tLiq').setAttribute('fill',bc);
  if(k==='moka') $('mFount').setAttribute('stroke',ey>22?cScale(STREAM,ey):'#6B3A1F');
  /* time + phase in scene */
  /* step timeline */
  const tm=d.m.tmax;
  const segs=d.steps.map(x=>{const a=Math.min(x.a,tm), b=Math.min(x.b,tm), st=(!idle&&el>=x.b)?'done':(!idle&&el>=x.a)?'act':'';
    return '<div class="seg '+st+'" style="left:calc('+(a/tm*100).toFixed(2)+'% + 1px);width:calc('+((b-a)/tm*100).toFixed(2)+'% - 2px)"></div>';}).join('')
    +'<div class="win" style="left:'+(d.w0/tm*100).toFixed(2)+'%;width:'+((Math.min(d.w1,tm)-d.w0)/tm*100).toFixed(2)+'%"></div>';
  const tlEl=$('tl');
  if(tlEl.dataset.v!==segs){setHTML(tlEl,segs+'<div class="mark" id="tlMark"></div>'); tlEl.dataset.v=segs;}
  $('tlMark').style.left=pct(el/tm);
}
function hex2(h){const n=parseInt(h.slice(1),16); return [n>>16&255,n>>8&255,n&255];}
function cScale(stops,v){
  if(v<=stops[0][0]) return stops[0][1];
  for(let i=1;i<stops.length;i++){ if(v<=stops[i][0]){const a=stops[i-1],b=stops[i],t=(v-a[0])/(b[0]-a[0]),A=hex2(a[1]),B=hex2(b[1]);
    return 'rgb('+A.map((x,j)=>Math.round(x+(B[j]-x)*t)).join(',')+')';} }
  return stops[stops.length-1][1];
}
const STREAM=[[0,'#3A1C0D'],[10,'#5A2C14'],[18,'#7A4220'],[22,'#9A5A2C'],[26,'#D0A870']];
const BREW=[[0,'#9A6A40'],[10,'#6B3A1F'],[18,'#4A2614'],[22,'#341A0C'],[27,'#1E0E06']];
function eyAt(d){
  const start=d.k==='espresso'?(S.pre?6:2):d.k==='turkish'?20:d.k==='moka'?(d.flow||70)-10:0;
  if(el<=start) return 0;
  const span=d.w1-d.w0;
  return interp([[start,0],[d.w0,18],[d.w1,22],[d.w1+span*1.5,26],[d.w1+span*6,27.5]],el);
}
/* single-spout espresso stream: tapered "mouse tail" */
function tongue(ySurf,ey){
  const t=performance.now()/1000, wob=reduce?0:Math.sin(t*7.3)*.6+Math.sin(t*3.1)*.35;
  const k=ey>22?clamp(1-(ey-22)/8,.45,1):ey<6?.7:1, f=v=>v.toFixed(1);
  const w=3.4*k, tw=1.9*k, y0=61, my=y0+(ySurf-y0)*.45, bx=120+wob;
  const d='M'+f(120-w)+' '+y0+' C'+f(120-w*.9)+' '+(y0+6)+' '+f(120-tw*1.1+wob*.3)+' '+f(my-8)+' '+f(120-tw+wob*.4)+' '+f(my)
    +' C'+f(120-tw*.9+wob*.6)+' '+f(my+12)+' '+f(bx-tw*.6)+' '+f(ySurf-10)+' '+f(bx-.7)+' '+f(ySurf)
    +' L'+f(bx+.7)+' '+f(ySurf)
    +' C'+f(bx+tw*.6)+' '+f(ySurf-10)+' '+f(120+tw*.9+wob*.6)+' '+f(my+12)+' '+f(120+tw+wob*.4)+' '+f(my)
    +' C'+f(120+tw*1.1+wob*.3)+' '+f(my-8)+' '+f(120+w*.9)+' '+(y0+6)+' '+f(120+w)+' '+y0+' Z';
  $('eTongue').setAttribute('d',d);
  $('eShine').setAttribute('d','M'+f(120-w*.3)+' '+(y0+2)+' C'+f(120-tw*.3+wob*.4)+' '+f(my)+' '+f(bx-.4)+' '+f(ySurf-14)+' '+f(bx-.2)+' '+f(ySurf-4));
  const rip=$('eRip'); rip.setAttribute('cx',f(bx)); rip.setAttribute('cy',f(ySurf+.4)); rip.setAttribute('rx',f(4+Math.abs(Math.sin(t*5))*3));
}
const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- frame update ---------- */
function update(){
  notify({ running:run, method:M[S.method].name, seconds:el });
  const d=model(), p=d.p, m=d.m, g=d.g;
  setText($('chip'),mname(d.k).toUpperCase()+' · 1:'+num(p.ratio));
  if(!$('guide').hidden&&GID()==='brew') guideLive(d);
  setText($('stepsTitle'),'KROKI · '+m.name.toUpperCase());
  setText($('unit'),g.unit); setText($('gShort'),g.short);
  const lab=g.labels.map((t,i)=>'<text x="'+LABEL_POS[i][0]+'" y="'+LABEL_POS[i][1]+'">'+t+'</text>').join('');
  if($('gLabels').dataset.v!==lab){setHTML($('gLabels'),lab); $('gLabels').dataset.v=lab;}
  const frac=clamp(g.val/g.max,0,1), ang=(135+270*frac)*Math.PI/180;
  $('gBand').setAttribute('stroke-dasharray','0 '+(g.band[0]/g.max*L).toFixed(1)+' '+((g.band[1]-g.band[0])/g.max*L).toFixed(1)+' 2000');
  $('gProg').setAttribute('stroke-dasharray',(frac*L).toFixed(1)+' 2000');
  $('gNeedle').setAttribute('x2',(150+95*Math.cos(ang)).toFixed(1));
  $('gNeedle').setAttribute('y2',(150+95*Math.sin(ang)).toFixed(1));
  setAttr($('gaugeSvg'),'aria-label','Wskaźnik: '+num(g.val)+' z '+g.max);
  setHTML($('tMain'),d.isE?num(Math.floor(el*10)/10)+'<span>s</span>':mss(el));
  setText($('tSub'),g.sub);

  const tm=m.tmax;
  const tl=x=>d.isE?String(Math.round(x))+(x===tm?' s':''):mss(x);
  setHTML($('bTicks'),[0,tm/3,tm*2/3,tm].map(x=>'<span>'+tl(x)+'</span>').join(''));

  const idle=el===0&&!run; let ph,col;
  if(idle){ph='GOTOWY'; col='var(--muted)';}
  else if(el>d.w1){ph=d.k==='turkish'?'ZDEJMIJ Z OGNIA!':'ZA DŁUGO'; col='var(--bad)';}
  else if(el>=d.w0){ph={espresso:'OKNO DOCELOWE',aeropress:'PRASOWANIE',v60:'KONIEC SPŁYWANIA',french:'WCIŚNIJ TŁOK',moka:'ZDEJMIJ Z PŁYTY',turkish:'PIANKA ROŚNIE'}[d.k]; col='var(--good)';}
  else{const c=d.steps.find(x=>el>=x.a&&el<x.b)||d.steps[0]; ph=c.l.toUpperCase(); col='var(--accent)';}
  if(!run&&el>0) ph+=' · PAUZA';
  { // new brew panel
    let nice;
    if(idle) nice='Gotowy';
    else if(el>d.w1) nice=d.k==='turkish'?'Zdejmij z ognia!':'Za długo';
    else if(el>=d.w0) nice={espresso:'Okno docelowe',aeropress:'Prasowanie',v60:'Koniec spływania',french:'Wciśnij tłok',moka:'Zdejmij z płyty',turkish:'Pianka rośnie'}[d.k];
    else if(d.isE) nice='Parzenie';
    else {const c=d.steps.find(x=>el>=x.a&&el<x.b)||d.steps[0]; nice=c.l;}
    if(!run&&el>0) nice+=' · pauza';
    if($('bPh').textContent!==nice) setText($('bPh'),nice);
    $('bDot').style.background=idle?'var(--muted)':col==='var(--accent)'?'var(--good)':col;
    setText($('bTime'),d.isE?(Math.floor(el*10)/10).toFixed(1).replace('.',currentLanguage()==='en'?'.':','):mss(el)); setText($('bTimeU'),d.isE?'s':'min');
    $('brewProgress').style.setProperty('--progress',pct(el/d.w1));
    $('brewProgress').setAttribute('aria-valuenow',String(Math.round(clamp(el/d.w1,0,1)*100)));
    setAttr($('brewProgress'),'aria-valuetext',Math.round(clamp(el/d.w1,0,1)*100)+'% czasu docelowego');
    setText($('bTarget'),{espresso:'Cel '+d.w0+'–'+d.w1+' s',aeropress:'Prasowanie od '+mss(d.w0),v60:'Spływanie do '+mss(d.w1),french:'Tłok o '+mss(d.w0),turkish:'Zdejmij do '+mss(d.w1),moka:'Zdejmij ok. '+mss(d.w0)}[d.k]);
    let gv,gmax,gb,lbl,val,unit;
    if(d.isE){gv=g.val; gmax=16; gb=[8,12]; lbl='Symulacja ciśnienia'; val=g.val.toFixed(1).replace('.',currentLanguage()==='en'?'.':','); unit='bar';}
    else if(d.k==='v60'){gv=g.val; gmax=g.max; gb=[g.max*.95,g.max]; lbl='Woda w dripperze'; val=String(Math.round(g.val)); unit='g';}
    else {gv=el; gmax=d.w1; gb=[d.w0,d.w1]; lbl=el<d.w0?'Do kolejnego kroku':'Okno'; val=mss(Math.max(0,(el<d.w0?d.w0:d.w1)-el)); unit='';}
    setText($('bLbl'),lbl); setText($('bVal'),val); setText($('bUnit'),unit);
    const P=v=>{const a=Math.PI*(1-clamp(v/gmax,0,1)); return [70+52*Math.cos(a),72-52*Math.sin(a)];};
    const pa=P(gb[0]), pb=P(gb[1]);
    $('bBand').setAttribute('d','M'+pa[0].toFixed(1)+' '+pa[1].toFixed(1)+' A52 52 0 0 1 '+pb[0].toFixed(1)+' '+pb[1].toFixed(1));
    const na=Math.PI*(1-clamp(gv/gmax,0,1)); $('bNeedle').setAttribute('x2',(70+44*Math.cos(na)).toFixed(1)); $('bNeedle').setAttribute('y2',(72-44*Math.sin(na)).toFixed(1));
  }
  const phEl=$('phase'); phEl.style.color=col;
  if(phEl.lastChild.textContent!==ph) setText(phEl.lastChild,ph);

  const mb=$('mainBtn'); const lbl=run?'STOP':el>0?'WZNÓW':'START';
  if(mb.dataset.l!==lbl){
    mb.dataset.l=lbl; mb.classList.toggle('run',run);
    setHTML(mb,(run?'<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2" width="12" height="12" rx="2"/></svg>':'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9.5-5.5z"/></svg>')+lbl);
  }

  setHTML($('tDose'),num(p.dose)+'<span> g</span>');
  setText($('tWaterK'),d.isE?'CEL NAPARU':(d.k==='turkish'||d.k==='moka')?'WODA (ML)':'WODA');
  setHTML($('tWater'),num(d.water)+'<span> '+((d.k==='turkish'||d.k==='moka')?'ml':'g')+'</span>');
  setHTML($('tTemp'),m.temp?p.temp+'<span> °C</span>':'ZIMNA'); setText($('tTempK'),d.isE?'PID':'TEMP.');

  sliderDefs().forEach(sd=>{
    const inp=$('sl-'+sd.k); if(!inp) return;
    inp.style.setProperty('--p',((p[sd.k]-sd.r[0])/(sd.r[1]-sd.r[0])*100)+'%');
  });
  setText($('out-dose'),num(p.dose)+' g');
  setText($('out-ratio'),'1:'+num(p.ratio));
  setText($('hint-ratio'),(d.isE?'napój ':'woda ')+num(d.water)+((d.k==='turkish'||d.k==='moka')?' ml':' g'));
  if($('out-temp')) setText($('out-temp'),p.temp+' °C');
  if($('out-grind')){setText($('out-grind'),gtxt(p.grind));
  setText($('hint-grind'),'zalecane '+gtxt(m.zone[0])+'–'+gtxt(m.zone[1]));}
  const inZ=p.grind>=m.zone[0]&&p.grind<=m.zone[1];
  const kr='Ustaw <b style="color:var(--accent)">'+gtxt(p.grind)+'</b> ('+kParts(p.grind)+') · '+grindName(p.grind)+(inZ?'':' · <span style="color:var(--bad)">poza strefą '+mname(d.k)+'</span>');
  if($('kread').dataset.v!==kr){setHTML($('kread'),kr); $('kread').dataset.v=kr;
    setHTML($('zones'),ZONES.map(z=>'<div class="zone'+(z.m===S.method||z.m2===S.method?' on':'')+'" style="left:'+(z.a*10)+'%;width:calc('+((z.b-z.a)*10)+'% - 2px);top:'+(z.lane?23:2)+'px;background:'+z.c+'">'+z.n+'</div>').join('')
      +'<div class="zmark" style="left:'+(p.grind*10)+'%"></div>');}
  $('preSw').setAttribute('aria-checked',S.pre?'true':'false');

  const sh=d.steps.map(x=>{
    const done=!idle&&el>=x.b, act=!idle&&el>=x.a&&el<x.b;
    return '<div class="step'+(act?' active':done?' done':'')+'"><i></i><em>'+(d.isE?x.a+' s':mss(x.a))+'</em><span>'+x.l+'</span></div>';
  }).join('');
  if($('steps').dataset.v!==sh){setHTML($('steps'),sh); $('steps').dataset.v=sh;}
  setText($('tip'),d.tip);
  sceneUpdate(d);
  checkAlerts(d);
}

/* ---------- rating & advice ---------- */
function currentAdvice(){
  if(!R.taste) return null;
  return advise(S.method,S.params[S.method],S.pidx[S.method],R.taste,R.body||'ok',el>0?el:null,R.stars,{type:G(),lelit:S.lelit});
}
function renderRating(){
  renderCoffeePick();
  setHTML($('stars'),[1,2,3,4,5].map(i=>'<button type="button" data-s="'+i+'" class="'+(i<=R.stars?'on':'')+'" aria-label="'+i+' z 5" aria-pressed="'+(i<=R.stars)+'"><svg><use href="#i-star"/></svg></button>').join(''));
  setHTML($('tasteChips'),TASTES.map(t=>'<button type="button" data-t="'+t.k+'" aria-pressed="'+(R.taste===t.k)+'">'+t.l+'</button>').join(''));
  setHTML($('bodyChips'),BODIES.map(b=>'<button type="button" data-b="'+b.k+'" aria-pressed="'+(R.body===b.k)+'">'+b.l+'</button>').join(''));
  const p=S.params[S.method], pr=M[S.method].presets[S.pidx[S.method]];
  setText($('brewInfo'),mname(S.method)+' · '+pr.n+(el>0?' · '+(S.method==='espresso'?num(el)+' s':mss(el)):''));
  const a=currentAdvice();
  $('advBox').hidden=!a; $('advHint').hidden=!!a;
  if(a){
    setText($('verdict'),a.verdict); $('verdict').dataset.z=a.z;
    setHTML($('advice'),a.rows.map(r=>'<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>').join(''));
  }
  $('applyBtn').disabled=!(a&&Object.keys(a.delta).length);
  $('saveBtn').disabled=!(R.stars&&R.taste);
}
$('stars').addEventListener('click',e=>{const b=e.target.closest('button[data-s]'); if(!b) return; R.stars=+b.dataset.s; renderRating();});
$('tasteChips').addEventListener('click',e=>{const b=e.target.closest('button[data-t]'); if(!b) return; R.taste=b.dataset.t; renderRating();});
$('bodyChips').addEventListener('click',e=>{const b=e.target.closest('button[data-b]'); if(!b) return; R.body=b.dataset.b; renderRating();});
function applyDelta(method,delta){
  const P=S.params[method]; Object.keys(delta).forEach(k=>{ if(k==='lelitDial') S.lelit.dial=delta[k]; else if(k==='lelitTime') S.lelit.time=delta[k]; else P[k]=delta[k]; });
  persist();
}
$('applyBtn').addEventListener('click',()=>{
  const a=currentAdvice(); if(!a) return;
  applyDelta(S.method,a.delta); buildSliders(); grinderUi(); update(); renderRating();
  toast('Ustawienia zmienione na następny napar');
});
$('saveBtn').addEventListener('click',()=>{
  const a=currentAdvice(); if(!a||!R.stars) return;
  const p=S.params[S.method];
  S.hist.unshift({ts:Date.now(),method:S.method,preset:S.pidx[S.method],dose:p.dose,ratio:p.ratio,temp:p.temp,grind:p.grind,grinder:G(),ldial:S.lelit.dial,ltime:S.lelit.time,
    time:el>0?Math.round(el*10)/10:null,stars:R.stars,taste:R.taste,body:R.body||'ok',z:a.z,adv:a.rows.map(r=>r[0]+': '+r[1]),delta:a.delta,
    coffee:CS.current,cn:(findById(CS,CS.current)||{}).name||null});
  if(CS.current){touch(CS,CS.current);saveCoffees();}
  S.hist=S.hist.slice(0,HIST_MAX); persist(); renderHist(); renderCoffees(); renderHomeCoffee();
  R.stars=0; R.taste=null; R.body=null; renderRating();
  toast('Zapisano w historii');
});

/* ---------- coffee database ---------- */
let CS=loadStore();
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function saveCoffees(){ if(!saveStore(CS)) toast('Brak miejsca w pamięci telefonu'); window.dispatchEvent(new CustomEvent('crema:data')); }
function photoTag(id,cls){const ph=id&&loadPhotos()[id]; return ph?'<img class="'+cls+'" src="'+ph+'" alt="">':'';}
function parOf(h){const m=M[h.method]; return num(h.dose)+' g · 1:'+num(h.ratio)+(m.temp&&h.temp?' · '+h.temp+' °C':'')+(h.grinder==='lelit'?' · Lelit '+f1(h.ldial)+' / '+f1(h.ltime)+' s':' · K-Pro '+gtxt(h.grind))+(h.time?' · '+(h.method==='espresso'?num(h.time)+' s':mss(h.time)):'');}
const stars1=v=>num(Math.round(v*10)/10);
const brews=n=>n+' '+(n===1?'napar':(n%10>=2&&n%10<=4&&(n%100<12||n%100>14))?'napary':'naparów');
function coffeeLine(h){const c=findById(CS,h.coffee), name=c?c.name:h.cn; if(!name) return ''; return '<div class="h-coffee">'+photoTag(c&&c.id,'h-thumb')+'<span>'+esc(name)+'</span></div>';}
function renderCoffeePick(){
  const list=recent(CS).slice(0,8);
  setHTML($('coffeeChips'),list.map(c=>'<button type="button" data-c="'+c.id+'" aria-pressed="'+(CS.current===c.id)+'">'+photoTag(c.id,'chip-thumb')+'<span>'+esc(c.name)+'</span></button>').join(''));
  $('coffeeChips').hidden=!list.length;
  const cur=findById(CS,CS.current);
  setHTML($('coffeeThumbBox'),cur?photoTag(cur.id,'pick-thumb'):'');
  setText($('coffeePhotoLbl'),cur&&loadPhotos()[cur.id]?'Zmień zdjęcie opakowania':'Zrób zdjęcie opakowania');
}
function selectCoffee(id){CS.current=id; if(id) touch(CS,id); saveCoffees(); renderCoffeePick(); renderHomeCoffee();}
function addFromInput(){const c=addCoffee(CS,$('coffeeName').value); if(!c){toast('Wpisz markę i nazwę kawy'); return null;} $('coffeeName').value=''; selectCoffee(c.id); return c;}
$('coffeeChips').addEventListener('click',e=>{const b=e.target.closest('button[data-c]'); if(!b) return; selectCoffee(CS.current===b.dataset.c?null:b.dataset.c);});
$('coffeeAdd').addEventListener('click',addFromInput);
$('coffeeName').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault(); addFromInput();}});
async function storePhoto(file,id){
  if(!file||!id) return;
  try{const url=await makeThumb(file); if(!savePhoto(id,url)){toast('Brak miejsca w pamięci telefonu'); return;} toast('Zapisano zdjęcie opakowania');}
  catch(e){toast('Nie udało się odczytać zdjęcia');}
  window.dispatchEvent(new CustomEvent('crema:data')); renderCoffeePick(); renderHomeCoffee(); renderCoffees(); renderHist();
}
$('coffeePhoto').addEventListener('change',async e=>{
  const file=e.target.files&&e.target.files[0]; e.target.value='';
  let id=CS.current; if(!id&&$('coffeeName').value.trim()){const c=addFromInput(); id=c&&c.id;}
  if(!id){toast('Najpierw wpisz lub wybierz kawę'); return;}
  await storePhoto(file,id);
});
function renderHomeCoffee(){
  const list=recent(CS);
  $('coffeeRow').hidden=!list.length;
  const sel=$('homeCoffee');
  setHTML(sel,'<option value="">Nie wybrano</option>'+list.map(c=>'<option value="'+c.id+'">'+esc(c.name)+'</option>').join(''));
  sel.value=CS.current&&findById(CS,CS.current)?CS.current:'';
  const hint=$('coffeeHint'), cur=findById(CS,CS.current);
  if(!cur){hint.hidden=true; return;}
  const i=bestEntry(S.hist,cur.id,S.method), n=S.hist.filter(h=>h.coffee===cur.id&&h.method===S.method).length;
  hint.hidden=false;
  if(i<0){setHTML(hint,'<span>Pierwszy napar tej kawy tą metodą. Po ocenie zapamiętam ustawienia.</span>'); return;}
  const h=S.hist[i];
  setHTML(hint,'<span><b>Najlepiej dla tej kawy</b> · '+'★'.repeat(h.stars)+' · '+parOf(h)+(n<3?' · mało danych ('+brews(n)+')':' · '+brews(n))+'</span><button type="button" data-load="'+i+'">Użyj</button>');
}
$('homeCoffee').addEventListener('change',e=>selectCoffee(e.target.value||null));
$('coffeeHint').addEventListener('click',e=>{const b=e.target.closest('button[data-load]'); if(b) loadEntry(+b.dataset.load,false);});
function renderCoffees(){
  const list=recent(CS);
  setText($('coffCount'),list.length?String(list.length):'');
  if(!list.length){setHTML($('coffees'),'<p class="empty" style="margin:0">Przy ocenie wpisz markę kawy i zrób zdjęcie opakowania. Tutaj zbiorę, jakie ustawienia najlepiej sprawdziły się z każdą kawą.</p>'); return;}
  setHTML($('coffees'),list.map(c=>{
    const sm=summarize(S.hist,c.id);
    const rows=sm.methods.map(x=>{const h=S.hist[x.best]; return '<div class="cf-m"><div><b>'+mname(x.method)+' <i class="cf-stars" aria-label="Najlepsza ocena '+h.stars+' z 5">'+'★'.repeat(h.stars)+'</i></b><small>śr. ★'+stars1(x.avg)+' · '+brews(x.count)+'</small><span>'+parOf(h)+'</span></div><button type="button" data-load="'+x.best+'">Użyj</button></div>';}).join('');
    return '<div class="cf"><div class="cf-top">'+(photoTag(c.id,'cf-thumb')||'<span class="cf-thumb cf-none" aria-hidden="true">'+esc(c.name.charAt(0).toUpperCase())+'</span>')
      +'<div class="cf-name"><b>'+esc(c.name)+'</b><small>'+(sm.count?brews(sm.count)+' · śr. ★'+stars1(sm.avg):'Jeszcze bez ocen')+'</small></div></div>'
      +rows+'<div class="h-act"><label class="cf-photo">'+(loadPhotos()[c.id]?'Zmień zdjęcie':'Dodaj zdjęcie')+'<input type="file" accept="image/*" capture="environment" data-photo="'+c.id+'" hidden></label>'
      +'<button type="button" class="h-del" data-cdel="'+c.id+'">Usuń kawę</button></div></div>';
  }).join(''));
}
$('coffees').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.load!=null){loadEntry(+b.dataset.load,false); return;}
  if(b.dataset.cdel){const c=findById(CS,b.dataset.cdel); if(!c||!window.confirm(translate('Usunąć tę kawę z bazy? Wpisy w historii zostaną.'))) return;
    CS.list=CS.list.filter(x=>x.id!==c.id); if(CS.current===c.id) CS.current=null; savePhoto(c.id,null); saveCoffees(); renderCoffees(); renderCoffeePick(); renderHomeCoffee(); renderHist(); toast('Usunięto kawę');}
});
$('coffees').addEventListener('change',e=>{const inp=e.target.closest('input[data-photo]'); if(!inp) return; const f=inp.files&&inp.files[0]; storePhoto(f,inp.dataset.photo);});

/* ---------- history ---------- */
function renderHist(){
  $('clearHist').hidden=!S.hist.length;
  setText($('histCount'),S.hist.length?S.hist.length+' / '+HIST_MAX:'');
  if(!S.hist.length){setHTML($('hist'),'<p class="empty" style="margin:0">Brak zapisanych kaw. Oceń napar i zapisz go, a pojawi się tutaj. Pamiętam 100 ostatnich.</p>'); return;}
  setHTML($('hist'),S.hist.map((h,i)=>{
    const m=M[h.method], pr=m.presets[h.preset]||m.presets[0];
    let when=''; try{when=new Date(h.ts).toLocaleString(currentLanguage()==='en'?'en-GB':'pl-PL',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}catch(e){}
    const t=tasteOf(h.taste)||TASTES[2], b=BODIES.find(x=>x.k===h.body)||BODIES[1];
    const par=parOf(h);
    const adv=(h.adv&&h.adv[0])||'';
    const ai=adv.indexOf(': ');
    return '<div class="h"><div class="h-top"><svg class="mi" aria-hidden="true"><use href="#i-'+h.method+'"/></svg>'
      +'<div class="t"><b>'+m.name+' · '+pr.n+'</b><small>'+when+'</small></div>'
      +'<span class="h-stars" aria-label="Ocena '+h.stars+' z 5">'+'★'.repeat(h.stars)+'<span style="color:var(--line)">'+'★'.repeat(5-h.stars)+'</span></span></div>'
      +coffeeLine(h)
      +'<div class="h-par">'+par+'</div>'
      +'<div><span class="pill" data-z="'+h.z+'">'+t.l.toUpperCase()+'</span><span class="pill" data-z="'+(h.body==='ok'?'ok':'under')+'" style="'+(h.body==='mocna'?'background:rgba(242,123,108,.18);color:var(--bad)':'')+'">'+b.l.toUpperCase()+'</span></div>'
      +(adv?'<div class="h-adv"><b>'+(ai>0?adv.slice(0,ai):'')+'</b>'+(ai>0?': '+adv.slice(ai+2):adv)+'</div>':'')
      +'<div class="h-act"><button type="button" data-load="'+i+'">Użyj tych ustawień</button>'
      +(h.delta&&Object.keys(h.delta).length?'<button type="button" data-next="'+i+'">Użyj z poprawkami</button>':'')+'<button type="button" class="h-del" data-del="'+i+'" aria-label="Usuń ten wpis">Usuń</button></div></div>';
  }).join(''));
}
$('hist').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.del!=null){const k=+b.dataset.del; if(!S.hist[k]||!window.confirm(translate('Usunąć ten wpis z historii?'))) return; S.hist.splice(k,1); persist(); renderHist(); renderCoffees(); renderHomeCoffee(); toast('Usunięto wpis'); return;}
  loadEntry(+(b.dataset.load??b.dataset.next),b.dataset.next!=null);
});
function loadEntry(i,next){
  const h=S.hist[i]; if(!h) return;
  stopRun(); el=0;
  if(h.coffee&&findById(CS,h.coffee)){CS.current=h.coffee;saveCoffees();}
  S.method=h.method; S.pidx[h.method]=h.preset||0;
  const P=S.params[h.method]; P.dose=h.dose; P.ratio=h.ratio; if(h.temp!=null) P.temp=h.temp; P.grind=h.grind;
  if(h.grinder==='lelit'){S.grinder='lelit'; if(h.ldial!=null) S.lelit.dial=h.ldial; if(h.ltime!=null) S.lelit.time=h.ltime;} else if(h.method==='espresso') S.grinder='kpro';
  if(next) applyDelta(h.method,h.delta||{});
  persist(); buildAll(); navigate('home');
  toast(next?'Wczytano z poprawkami':'Wczytano ustawienia');
}
$('clearHist').addEventListener('click',()=>{if(!window.confirm(translate('Usunąć zapisaną historię parzeń?'))) return; S.hist=[]; persist(); renderHist(); renderCoffees(); renderHomeCoffee();});

/* ---------- events ---------- */
$('tabs').addEventListener('keydown',e=>{
 const buttons=[...$('tabs').querySelectorAll('button')], i=buttons.indexOf(document.activeElement);
 const offset={ArrowRight:1,ArrowDown:1,ArrowLeft:-1,ArrowUp:-1}[e.key];
 if(offset==null&&e.key!=='Home'&&e.key!=='End') return;
 e.preventDefault();const n=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+offset+buttons.length)%buttons.length;
 buttons[n].focus();buttons[n].click();
});
$('tabs').addEventListener('click',e=>{
  const b=e.target.closest('button[data-m]'); if(!b||b.dataset.m===S.method) return;
  if(run&&!window.confirm(translate('Zmienić metodę i zakończyć bieżące parzenie?'))) return;
  stopRun(); el=0; resetAlerts(); S.method=b.dataset.m; R.stars=0; R.taste=null; R.body=null; persist(); buildAll();
});
$('presets').addEventListener('click',e=>{
  const b=e.target.closest('button[data-i]'); if(!b) return;
  const i=+b.dataset.i; S.pidx[S.method]=i; S.params[S.method].ratio=M[S.method].presets[i].r; if(M[S.method].presets[i].d) S.params[S.method].dose=M[S.method].presets[i].d;
  persist(); buildPresets(); buildSliders(); update(); renderRating();
});
$('sliders').addEventListener('input',e=>{
  const t=e.target; if(!t.dataset.k) return;
  if(t.dataset.k==='temp'&&S.method==='espresso') setTimeout(()=>{setText($('pidVal'),S.params.espresso.temp);},0);
  S.params[S.method][t.dataset.k]=t.dataset.k==='grind'?gr(parseFloat(t.value)):parseFloat(t.value); persist(); update(); if(R.taste) renderRating();
});
function klik(dl){const P=S.params[S.method]; P.grind=clamp(gr(P.grind+dl),0,10); const r=$('sl-grind'); if(r) r.value=P.grind; persist(); update(); if(R.taste) renderRating();}
$('kMinus').addEventListener('click',()=>klik(-.1));
$('kPlus').addEventListener('click',()=>klik(.1));
$('preSw').addEventListener('click',()=>{S.pre=!S.pre; persist(); update();});
$('gsel').addEventListener('click',e=>{const b=e.target.closest('button[data-g]'); if(!b) return; S.grinder=b.dataset.g; persist(); buildSliders(); grinderUi(); update(); if(R.taste) renderRating();
  if(S.grinder==='lelit'&&S.method!=='espresso') toast('Lelit działa w trybie espresso');});
function lset(k,v){S.lelit[k]=v; persist(); lelitUpdate(); if(R.taste) renderRating();}
$('lDial').addEventListener('input',e=>lset('dial',parseFloat(e.target.value)));
$('lTime').addEventListener('input',e=>lset('time',r1(parseFloat(e.target.value))));
$('lFine').addEventListener('click',()=>lset('dial',lFiner(S.lelit.dial,.5)));
$('lCoarse').addEventListener('click',()=>lset('dial',lCoarser(S.lelit.dial,.5)));
$('lTminus').addEventListener('click',()=>lset('time',r1(clamp(S.lelit.time-.1,2,20))));
$('lTplus').addEventListener('click',()=>lset('time',r1(clamp(S.lelit.time+.1,2,20))));
$('lMatch').addEventListener('click',e=>{if(e.target.id==='lFit'){lset('time',r1(clamp(S.params.espresso.dose/S.lelit.rate,2,20))); toast('Czas dopasowany do dawki');}});
$('lCalBtn').addEventListener('click',()=>{
  const w=parseFloat(String($('lWeigh').value).replace(',','.'));
  if(!(w>0)){toast('Wpisz wagę zmielonej kawy'); return;}
  const rate=Math.round(w/S.lelit.time*100)/100; S.lelit.rate=rate;
  const nt=r1(clamp(S.params.espresso.dose/rate,2,20)); S.lelit.time=nt; $('lWeigh').value='';
  persist(); lelitUpdate(); toast(rate.toFixed(2).replace('.',currentLanguage()==='en'?'.':',')+' g/s · nowy czas '+f1(nt)+' s');
});
$('lDirSw').addEventListener('click',()=>{S.lelit.fineLower=!S.lelit.fineLower; persist(); lelitUpdate();});

/* ---------- alerts ---------- */
let AC=null, fired={}, flashT=null, tintT=null;
function ensureAudio(){
  try{ if(!AC){const C=window.AudioContext||window.webkitAudioContext; if(C) AC=new C();} if(AC&&AC.state==='suspended') AC.resume(); }catch(e){}
  // unlock speech on iOS with a silent utterance inside the tap
  try{ if(S.alerts.voice&&window.speechSynthesis&&!ensureAudio.sp){const u=new SpeechSynthesisUtterance(' '); u.volume=0; speechSynthesis.speak(u); ensureAudio.sp=true;} }catch(e){}
}
function tone(f,start,dur,vol,type){
  if(!AC) return; const o=AC.createOscillator(), g=AC.createGain(), t=AC.currentTime+start;
  o.type=type||'sine'; o.frequency.value=f;
  g.gain.setValueAtTime(.0001,t); g.gain.exponentialRampToValueAtTime(vol||.25,t+.015); g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t+dur+.03);
}
const PATTERN={
  step:()=>{tone(880,0,.14,.18);},
  near:()=>{tone(988,0,.12); tone(988,.18,.12);},
  stop:()=>{tone(1320,0,.12,.3); tone(1320,.16,.12,.3); tone(1320,.32,.12,.3); tone(1760,.5,.45,.3);},
  done:()=>{tone(784,0,.15); tone(1047,.17,.3);},
  over:()=>{tone(440,0,.35,.3,'square'); tone(330,.4,.5,.3,'square');}
};
const KCOL={step:'#CC8B5E',near:'#E8BB7C',stop:'#8FD3A8',done:'#8FD3A8',over:'#F27B6C'};
function say(t){ try{ if(!S.alerts.voice||!window.speechSynthesis) return; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(translate(t)); u.lang=currentLanguage()==='en'?'en-GB':'pl-PL'; u.rate=1.05; speechSynthesis.speak(u);}catch(e){} }
function tint(k){
  document.body.dataset.tint=k; $('guide').dataset.tint=k; document.body.style.setProperty('--tintc',KCOL[k]);
  clearTimeout(tintT); if(k==='step'||k==='near') tintT=setTimeout(()=>{ if(document.body.dataset.tint===k) clearTint(); },k==='step'?1600:6000);
}
function clearTint(){ delete document.body.dataset.tint; delete $('guide').dataset.tint; }
function fire(ev){
  if(S.alerts.sound){ ensureAudio(); (PATTERN[ev.k]||PATTERN.step)(); }
  try{ if(navigator.vibrate) navigator.vibrate(ev.k==='stop'||ev.k==='over'?[300,120,300,120,500]:[120]); }catch(e){}
  say(ev.say||ev.main);
  if(S.alerts.flash){
    tint(ev.k);
    if(ev.k!=='step'){
      const f=$('flash'); f.dataset.k=ev.k; f.style.setProperty('--fc',KCOL[ev.k]);
      setText($('flSub'),ev.sub||''); setText($('flMain'),ev.main); setText($('flHint'),ev.hint||''); f.hidden=false;
      clearTimeout(flashT); flashT=setTimeout(()=>{f.hidden=true;},ev.k==='near'?2500:ev.k==='over'?6000:4500);
    }
  }
}
$('flash').addEventListener('click',()=>{$('flash').hidden=true;});
/* events per method, built from the current model */
function events(d){
  const E=[], mid=(d.w0+d.w1)/2, N=mname(d.k).toUpperCase();
  d.steps.forEach((x,i)=>{ if(i>0||x.a>0) E.push({t:x.a,k:'step',main:x.l,say:x.l}); });
  const add=(t,k,main,hint,sayT)=>E.push({t,k,main,hint,sub:N,say:sayT||main});
  if(d.k==='espresso'){
    add(d.w0,'near','Okno ekstrakcji','Patrz na wagę: cel '+num(d.water)+' g','Okno. Patrz na wagę');
    add(mid,'stop','Zatrzymaj pompę','Napój ≈ '+num(d.water)+' g · PUMP w dół','Zatrzymaj ekstrakcję');
    add(d.w1,'over','Za długo!','Zatrzymaj teraz. Następnym razem zmiel grubiej','Za długo, zatrzymaj');
  }else if(d.k==='aeropress'){
    add(d.w0-10,'near','Za 10 s prasowanie','Przygotuj dłonie na tłoku','Za dziesięć sekund prasowanie');
    add(d.w0,'stop','Prasuj teraz','Powoli, ok. 30 s','Prasuj teraz');
    add(d.w1,'done','Gotowe','Zatrzymaj timer, gdy usłyszysz syk','Gotowe');
  }else if(d.k==='v60'){
    add(d.w0,'stop','Kawa gotowa','Powinno już spłynąć. Zdejmij dripper','Kawa gotowa, zdejmij dripper');
    add(d.w1,'over','Spływa za długo','Następnym razem zmiel grubiej','Za długo');
  }else if(d.k==='french'){
    add(d.w0-15,'near','Za 15 s tłok','Przygotuj się do wciskania','Za piętnaście sekund tłok');
    add(d.w0,'stop','Wciśnij tłok','Powoli i od razu przelej','Wciśnij tłok');
    add(d.w1,'done','Przelej kawę','Nie zostawiaj jej na fusach','Przelej kawę');
  }else if(d.k==='moka'){
    add(d.w0-20,'near','Za chwilę zdejmij','Gdy strumień zacznie jaśnieć','Za chwilę zdejmij z płyty');
    add(d.w0,'stop','Zdejmij z płyty','Schłódź dół pod zimną wodą, stal długo trzyma ciepło','Zdejmij z płyty i schłódź');
    add(d.w1,'over','Za długo!','Kawa zaczyna gorzknieć','Za długo, zdejmij');
  }else{
    add(d.w0,'near','Pianka rośnie','Nie odchodź od kuchenki','Pianka rośnie, pilnuj');
    add(d.w1,'stop','Zdejmij z ognia','Zanim się zagotuje!','Zdejmij z ognia');
  }
  // drop step beeps that coincide with a main event
  return E.filter(e=>e.t>0).filter((e,i,a)=>!(e.k==='step'&&a.some(o=>o!==e&&o.k!=='step'&&Math.abs(o.t-e.t)<1.5)));
}
function checkAlerts(d){
  if(!run) return;
  let missed=null;
  events(d).forEach(ev=>{ const id=ev.k+'@'+ev.t.toFixed(1); if(fired[id]||el<ev.t) return; fired[id]=1; if(el<ev.t+3) fire(ev); else if(ev.k!=='step') missed=ev; });
  // Screen lock or app switch: rAF pauses, so show the latest important moment that passed.
  if(missed) fire(Object.assign({},missed,{sub:'POMINIĘTY ALERT',hint:'Spóźnienie: '+mss(el-missed.t)+'. '+(missed.hint||'')}));
}
function resetAlerts(){shotCounted=false; fired={}; clearTint(); $('flash').hidden=true;}
function alertsUi(){document.querySelectorAll('.alerts button[data-al]').forEach(b=>b.setAttribute('aria-pressed',S.alerts[b.dataset.al]?'true':'false'));}
document.querySelector('.alerts').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.al){S.alerts[b.dataset.al]=!S.alerts[b.dataset.al]; persist(); alertsUi(); ensureAudio();
    if(b.dataset.al==='voice'&&S.alerts.voice&&!window.speechSynthesis) toast('Ta przeglądarka nie obsługuje głosu');}
  if(b.id==='alTest'){settingsDialog.close(); ensureAudio(); const d=model(); const ev=events(d).find(x=>x.k==='stop')||{k:'stop',main:'Zatrzymaj'}; fire(Object.assign({},ev,{sub:'TEST · '+(ev.sub||'')}));}
});

async function lock(){try{if(navigator.wakeLock) wl=await navigator.wakeLock.request('screen');}catch(e){}}
function unlock(){try{if(wl) wl.release();}catch(e){} wl=null;}
function stopRun(){ if(run){run=false; unlock();} }
$('mainBtn').addEventListener('click',()=>{
  ensureAudio();
  if(run){stopRun(); countShot(); renderRating(); clearTint(); $('ratePrompt').hidden=el<10;} else {$('ratePrompt').hidden=true; if(el===0) resetAlerts(); else { const d=model(); events(d).forEach(ev=>{ if(el>=ev.t) fired[ev.k+'@'+ev.t.toFixed(1)]=1; }); } run=true; t0=performance.now()-el*1000; lock();}
  update();
});
$('resetBtn').addEventListener('click',()=>{stopRun(); el=0; resetAlerts(); $('ratePrompt').hidden=true; update(); renderRating();});
$('ratePromptBtn').addEventListener('click',()=>finishBrew());
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&run){ lock(); el=(performance.now()-t0)/1000; update(); } });

function frame(){
  if(run){
    el=(performance.now()-t0)/1000;
    const tm=M[S.method].tmax; if(el>=tm){el=tm; stopRun(); countShot(); renderRating();}
    update();
  }
  requestAnimationFrame(frame);
}
/* ---------- Lelit Anna ---------- */
const WARM_MIN=15;
function warmState(){
  if(!S.warm) return {on:false};
  const sec=(Date.now()-S.warm)/1000, left=WARM_MIN*60-sec;
  if(sec>6*3600){S.warm=null; persist(); return {on:false};}
  return {on:true,sec,left,ready:left<=0};
}
function warmUi(){
  const w=warmState(), box=$('warmBox');
  let h;
  if(!w.on) h='<div class="wi"><b>Rozgrzewanie</b><span>Grupa i kolba grzeją się ok. '+WARM_MIN+' min. Kolba wpięta.</span></div><button type="button" id="warmGo">Włączyłem ekspres</button>';
  else if(!w.ready) h='<div class="wi"><b>Rozgrzewa się…</b><span>Gotowy za</span><div class="wbar"><i style="width:'+(w.sec/(WARM_MIN*60)*100).toFixed(1)+'%"></i></div></div><span class="wt">'+mss(w.left)+'</span><button type="button" class="ghost" id="warmOff" aria-label="Wyłącz licznik rozgrzewania">✕</button>';
  else h='<div class="wi"><b style="color:var(--good)">Ekspres gotowy ✓</b><span>Nagrzany od '+mss(-w.left)+'. Przepłucz grupę 2–3 s przed shotem.</span></div><button type="button" class="ghost" id="warmOff">Wyłączyłem</button>';
  if(box.dataset.v!==h){setHTML(box,h); box.dataset.v=h;}
}
$('warmBox').addEventListener('click',e=>{
  if(e.target.id==='warmGo'){S.warm=Date.now(); persist(); warmUi(); toast('Licznik rozgrzewania: '+WARM_MIN+' min');}
  if(e.target.id==='warmOff'){S.warm=null; persist(); warmUi();}
});
function setPid(v){S.params.espresso.temp=clamp(v,88,98); persist(); if(S.method==='espresso') buildSliders(); annaUi(); update(); if(R.taste) renderRating();}
$('pidMinus').addEventListener('click',()=>setPid(S.params.espresso.temp-1));
$('pidPlus').addEventListener('click',()=>setPid(S.params.espresso.temp+1));
$('roastChips').addEventListener('click',e=>{const b=e.target.closest('button[data-r]'); if(!b) return; S.roast=b.dataset.r; setPid(ROAST[S.roast].pid); toast('PID '+ROAST[S.roast].pid+' °C dla ziaren '+ROAST[S.roast].n.toLowerCase()+'ch');});
$('milkChips').addEventListener('click',e=>{const b=e.target.closest('button[data-mk]'); if(!b) return; S.milk=b.dataset.mk; persist(); annaUi();});
function milkSteps(){
  const mk=MILK[S.milk]; if(!mk||S.milk==='none') return null;
  return {
    steam:['Najpierw zrób espresso. Potem przełącz na <b>parę</b> (ikona obłoczka) i odczekaj ok. 1 min, aż temperatura na wyświetlaczu przestanie rosnąć.',
      'Nalej ok. <b>'+mk.ml+' ml</b> zimnego mleka do dzbanka (do ⅓ wysokości).',
      'Przedmuchaj dyszę 1–2 s nad tacką.',
      'Dysza tuż pod powierzchnią: napowietrzaj 5–8 s (cichy syk), aż dzbanek będzie letni.',
      'Zanurz głębiej i kręć wir do <b>'+mk.t+' °C</b>, czyli aż dzbanek będzie za gorący do trzymania. Zakręć pokrętło.',
      'Wytrzyj i przedmuchaj dyszę. Stuknij dzbankiem, zakręć mlekiem i wlewaj do espresso.'],
    refill:['Przełącz na <b>gorącą wodę</b> (ikona kropli).','Odkręć pokrętło i włącz <b>PUMP</b>, aż z dyszy poleci równy strumień wody. Zakręć i wyłącz pompę.','Przełącz z powrotem na <b>kawę</b> i przed kolejnym shotem odczekaj, aż PID pokaże '+S.params.espresso.temp+' °C.']
  };
}
function annaUi(){
  $('annaCard').hidden=S.method!=='espresso';
  warmUi();
  setText($('pidVal'),S.params.espresso.temp);
  setHTML($('roastChips'),Object.keys(ROAST).map(k=>'<button type="button" data-r="'+k+'" aria-pressed="'+(S.roast===k&&ROAST[k].pid===S.params.espresso.temp)+'">'+ROAST[k].n+' · '+ROAST[k].pid+' °C</button>').join(''));
  setHTML($('milkChips'),Object.keys(MILK).map(k=>'<button type="button" data-mk="'+k+'" aria-pressed="'+(S.milk===k)+'">'+MILK[k].n+(MILK[k].ml?' · '+MILK[k].ml+' ml':'')+'</button>').join(''));
  const ms=milkSteps();
  setHTML($('milkSteps'),ms?'<h4>SPIENIANIE NA ANNIE</h4><ol class="milkst">'+ms.steam.map((x,i)=>'<li><b class="n">'+(i+1)+'</b><span>'+x+'</span></li>').join('')+'</ol>'
     +'<h4>POTEM UZUPEŁNIJ KOCIOŁ</h4><ol class="milkst">'+ms.refill.map((x,i)=>'<li><b class="n">'+(i+1)+'</b><span>'+x+'</span></li>').join('')+'</ol>'
     +'<p class="g-note" style="margin-top:8px">Po parze kocioł jest przegrzany i ma mało wody. Uzupełnienie chroni grzałkę i schładza kocioł do temperatury kawy.</p>':'');
  // static manometer: green 8-12 of 0-16 over 180°
  const arc=(a,b)=>{const p=v=>{const t=Math.PI*(1-v/16);return (60+48*Math.cos(t)).toFixed(1)+' '+(62-48*Math.sin(t)).toFixed(1);}; return 'M'+p(a)+' A48 48 0 0 1 '+p(b);};
  $('manoGreen').setAttribute('d',arc(8,12));
  const t=Math.PI*(1-9.5/16); $('manoNeedle').setAttribute('x2',(60+40*Math.cos(t)).toFixed(1)); $('manoNeedle').setAttribute('y2',(62-40*Math.sin(t)).toFixed(1));
}
/* ---------- service ---------- */
const MAINT=[
  {k:'rinse',n:'Płukanie grupy wodą',d:'Ślepe sitko, 5× 10 s',days:7},
  {k:'cafiza',n:'Backflush z detergentem',d:'Potem płukanie wodą',days:30},
  {k:'gasket',n:'Uszczelka i sitko prysznica',d:'Szczoteczka pod grupą',days:30},
  {k:'descale',n:'Odkamienianie',d:'Twarda woda: częściej',days:60},
  {k:'filter',n:'Filtr w zbiorniku',d:'Wymiana wkładu',days:60},
  {k:'burrs',n:'Żarna Lelit William',d:'Co ok. 4 kg kawy',grams:4000}
];
function servUi(){
  const now=Date.now(), I=S.maint.items;
  setText($('shotCount'),S.maint.shots+' shotów · '+(S.maint.grams/1000).toFixed(1).replace('.',currentLanguage()==='en'?'.':',')+' kg');
  setHTML($('serv'),MAINT.map(it=>{
    const rec=I[it.k]; let frac, info;
    if(it.grams){const g=S.maint.grams-((rec&&rec.g)||0); frac=g/it.grams; info=(g/1000).toFixed(1).replace('.',currentLanguage()==='en'?'.':',')+' z 4 kg';}
    else{ if(!rec){frac=0; info='';} else {const dd=(now-rec.t)/864e5; frac=dd/it.days; info=Math.floor(dd)+' z '+it.days+' dni';}}
    const st=frac>=1?'due':frac>=.8?'soon':'';
    const col=st==='due'?'var(--bad)':st==='soon'?'var(--accent)':'var(--good)';
    return '<div class="sv '+st+'"><b>'+it.n+'</b><button type="button" data-mt="'+it.k+'">Zrobione</button><small>'+it.d+(info?' · '+info:'')+'</small>'
      +'<div class="bar2"><i style="width:'+Math.min(100,frac*100).toFixed(0)+'%;background:'+col+'"></i></div></div>';
  }).join(''));
}
$('serv').addEventListener('click',e=>{const b=e.target.closest('button[data-mt]'); if(!b) return; S.maint.items[b.dataset.mt]={t:Date.now(),g:S.maint.grams}; persist(); servUi(); toast('Zapisano: '+MAINT.find(x=>x.k===b.dataset.mt).n);});
function countShot(){
  if(S.method==='espresso'&&el>=15&&!shotCounted){shotCounted=true; S.maint.shots++; if(G()==='lelit') S.maint.grams+=S.params.espresso.dose; persist(); servUi();}
}
setInterval(()=>{ if(S.warm&&!$('annaCard').hidden) warmUi(); if(!$('guide').hidden&&GID()==='prep') { const w=$('gWarm'); if(w) setHTML(w,warmLine()); } },1000);
function warmLine(){const w=warmState(); return !w.on?'Nie włączono licznika. Włącz ekspres i stuknij przycisk poniżej.':!w.ready?'Rozgrzewa się, gotowy za <b>'+mss(w.left)+'</b>':'<b style="color:var(--good)">Ekspres gotowy ✓</b>';}

/* ---------- guide: Prowadź mnie ---------- */
let GI=0;
const GID=()=>{const st=guideSteps(); return st[clamp(GI,0,st.length-1)].id;};
const ICON=k=>'<svg aria-hidden="true"><use href="#i-'+k+'"/></svg>';
function prepSteps(d){
  const p=d.p, t=p.temp;
  return {
    espresso:['Przełącznik trybu na <b>kawę</b>, zbiornik z wodą pełny.','Kolba wpięta w grupę, żeby się nagrzała razem z ekspresem.','Gdy gotowy: przepłucz grupę 2–3 s (PUMP), wytrzyj sitko do sucha.','Postaw filiżankę na wadze i wytaruj.'],
    aeropress:['Zagotuj wodę i odczekaj do ok. '+t+' °C.','Włóż filtr papierowy do sitka i przepłucz go gorącą wodą.',(S.pidx.aeropress===1?'Złóż AeroPress odwrócony, tłokiem na dół.':'Postaw AeroPress na kubku.'),'Postaw całość na wadze i wytaruj.'],
    v60:['Zagotuj wodę i odczekaj do ok. '+t+' °C.','Złóż filtr na szwie, włóż do V60 i przepłucz gorącą wodą.','Wylej wodę z serwera.','Postaw serwer z dripperem na wadze i wytaruj.'],
    french:['Zagotuj wodę i odczekaj do ok. '+t+' °C.','Przelej dzbanek gorącą wodą, żeby go nagrzać, potem ją wylej.','Postaw dzbanek na wadze i wytaruj.'],
    moka:['Zagotuj wodę w czajniku i odczekaj chwilę (ok. '+d.p.temp+' °C).','Nalej gorącą wodę do dolnego zbiornika Venus <b>tuż pod zaworem</b>, nie wyżej (ok. '+d.water+' ml).','Ustaw kawiarkę na środku pola indukcyjnego pasującego do jej dna.','Przygotuj ściereczkę, bo stalowy dół będzie bardzo gorący.'],
    turkish:['Nalej '+d.water+' ml zimnej wody do cezve.',(d.pr.sugar?'Dodaj '+d.pr.sl+' cukru.':'Bez cukru (Sade).'),'Przygotuj najmniejszy palnik albo płytę na niskiej mocy.']
  }[d.k];
}
function grindStep(d){
  const p=d.p;
  if(G()==='lelit'){
    const L=S.lelit, est=r1(L.time*L.rate);
    return '<div class="g-pair"><div class="g-big"><small>POKRĘTŁO PRZY ▲</small><b>'+f1(L.dial)+'</b><span>Lelit William</span></div>'
      +'<div class="g-big"><small>CZAS · 2 DAWKI</small><b>'+f1(L.time)+'</b><span>s ≈ '+num(est)+' g</span></div></div>'
      +'<ol class="g-list">'
      +'<li><b class="n">1</b><span>Włącz młynek. Jeśli zmieniasz pokrętło, rób to <b>tylko w trakcie mielenia</b>.</span></li>'
      +'<li><b class="n">2</b><span>Sprawdź czas na ekranie: „−” dwa razy pokazuje 2 dawki. Powinno być <b>'+f1(L.time)+' s</b>.</span></li>'
      +'<li><b class="n">3</b><span>Przyłóż kolbę i naciśnij przycisk <b>2× w ciągu 2 s</b>. Gdy pojawi się „OK”, zdejmij kolbę.</span></li>'
      +'<li><b class="n">4</b><span>Zważ: cel <b>'+num(p.dose)+' g ±0,3</b>. Brakuje? Dosyp przyciskiem na górze.</span></li></ol>'
      +(Math.abs(est-p.dose)>0.4?'<div class="g-warn">Czas daje ok. '+num(est)+' g, a dawka to '+num(p.dose)+' g. Ustaw '+num(r1(clamp(p.dose/L.rate,2,20)))+' s albo skalibruj w Parametrach.</div>':'');
  }
  return (S.grinder==='lelit'&&d.k!=='espresso'?'<div class="g-warn">Lelit William jest tylko do espresso. Tę kawę mielisz na K-Pro.</div>':'')
    +'<div class="g-big"><small>1ZPRESSO K-PRO</small><b>'+gtxt(p.grind)+'</b><span>'+kParts(p.grind)+' · '+grindName(p.grind)+'</span></div>'
    +'<ol class="g-list">'
    +'<li><b class="n">1</b><span>Ustaw tarczę na <b>'+Math.floor(Math.round(p.grind*10)/10)+'</b> i dokręć <b>'+(Math.round(p.grind*10)%10)+' klik.</b> w stronę grubszego mielenia.</span></li>'
    +'<li><b class="n">2</b><span>Odważ <b>'+num(p.dose)+' g</b> ziaren i wsyp do młynka.</span></li>'
    +'<li><b class="n">3</b><span>Mielenie równym tempem, do końca, aż młynek zacznie kręcić się lekko.</span></li></ol>';
}
function bedStep(d){
  const p=d.p;
  return {
    espresso:['Rozbij grudki igłą (WDT) i wyrównaj kawę w sitku 57 mm.','Ubij poziomo, mocno i równo. Wytrzyj brzeg kolby.','Wepnij kolbę i od razu przejdź dalej. Włącz <b>PUMP</b> i w tej samej chwili Start.'],
    aeropress:['Wsyp '+num(p.dose)+' g kawy do komory.','Wytaruj wagę. Przygotuj '+d.water+' g wody.'],
    v60:['Wsyp '+num(p.dose)+' g kawy do filtra i potrząśnij, żeby się wyrównała.','Zrób dołek palcem na środku. Wytaruj wagę.'],
    french:['Wsyp '+num(p.dose)+' g kawy do dzbanka.','Wytaruj wagę. Tłok połóż obok.'],
    moka:['Wsyp '+num(p.dose)+' g kawy do lejka, do pełna. Wyrównaj palcem, <b>nie ubijaj</b>.','Wytrzyj brzeg lejka i gwint z kawy.','Skręć kawiarkę przez ściereczkę, postaw na płycie, moc ok. 5–6 z 9 (bez boostera), wieczko otwarte. Start!'],
    turkish:['Wsyp '+num(p.dose)+' g kawy do zimnej wody w cezve.','Zamieszaj kilka razy, aż kawa opadnie. Potem już nie mieszaj.']
  }[d.k];
}
function guideSteps(){
  const d=model();
  const ms=d.isE?milkSteps():null;
  const L=[
    {id:'pick',t:'Co parzysz?',h:()=>'<div class="g-choice" id="gMethods">'+ORDER.map(k=>'<button type="button" data-gm="'+k+'" aria-pressed="'+(k===S.method)+'">'+ICON(k)+mname(k).toUpperCase()+'</button>').join('')+'</div>'
       +'<div class="g-choice" id="gPresets">'+d.m.presets.map((x,i)=>'<button type="button" data-gp="'+i+'" aria-pressed="'+(i===S.pidx[S.method])+'">'+x.n+'</button>').join('')+'</div>'
       +(S.method==='espresso'?'<div class="label" style="margin:4px 0 0">MŁYNEK</div><div class="g-choice" id="gGrinders"><button type="button" data-gg="kpro" aria-pressed="'+(G()==='kpro')+'">1ZPRESSO K-PRO</button><button type="button" data-gg="lelit" aria-pressed="'+(G()==='lelit')+'">LELIT WILLIAM</button></div>':'')
       +(S.method==='espresso'?'<div class="label" style="margin:4px 0 0">NAPÓJ</div><div class="g-choice" id="gMilk">'+Object.keys(MILK).map(k=>'<button type="button" data-gmk="'+k+'" aria-pressed="'+(S.milk===k)+'">'+MILK[k].n.toUpperCase()+'</button>').join('')+'</div>':'')
       +'<p class="g-note">'+num(d.p.dose)+' g kawy · 1:'+num(d.p.ratio)+' · '+(d.isE?'napój ':'woda ')+num(d.water)+((d.k==='turkish'||d.k==='moka')?' ml':' g')+(d.m.temp?' · '+d.p.temp+' °C':'')+'. Zmienisz to w Parametrach.</p>'},
    {id:'prep',t:'Przygotuj sprzęt',h:()=>(d.isE?'<div class="g-big"><small>LELIT ANNA · PID</small><b>'+d.p.temp+' °C</b><span id="gWarm">'+warmLine()+'</span></div>'+(warmState().on?'':'<button type="button" class="btn main" id="gWarmGo" style="width:100%">WŁĄCZYŁEM EKSPRES</button>'):'')+'<ol class="g-list">'+prepSteps(d).map((x,i)=>'<li><b class="n">'+(i+1)+'</b><span>'+x+'</span></li>').join('')+'</ol>'},
    {id:'grind',t:'Zmiel kawę',h:()=>grindStep(d)},
    {id:'bed',t:d.isE?'Rozprowadź i ubij':'Wsyp kawę',h:()=>'<ol class="g-list">'+bedStep(d).map((x,i)=>'<li><b class="n">'+(i+1)+'</b><span>'+x+'</span></li>').join('')+'</ol>'},
    {id:'brew',t:'Parzenie',h:()=>'<div class="g-live"><small id="gPh">GOTOWY</small><b id="gT">0</b><span id="gNow"></span></div>'
       +'<button type="button" class="btn main" id="gRun" style="width:100%"></button>'
       +'<p class="g-note">'+(S.alerts.sound||S.alerts.voice||S.alerts.flash?'Dam znać '+[S.alerts.sound?'dźwiękiem':'',S.alerts.voice?'głosem':'',S.alerts.flash?'kolorem ekranu':''].filter(Boolean).join(', ')+' przy każdym kroku i gdy trzeba przerwać parzenie.':'Alerty są wyłączone. Włączysz je w Ustawieniach.')+' Wycisz tryb cichy w iPhonie, żeby słyszeć dźwięk.</p>'
       +'<ol class="g-list" id="gSteps"></ol>'},
    {id:'rate',t:'Oceń kawę',h:()=>'<div class="g-big"><small>CZAS PARZENIA</small><b>'+(el>0?(d.isE?num(r1(el)):mss(el)):'—')+'</b><span>'+(el>0?(d.isE?'sekund':'min:s'):'timer nie był użyty')+'</span></div>'
       +'<p style="margin:0">Spróbuj i oceń smak. Na podstawie oceny dostaniesz konkretne zmiany na następną kawę, także dla młynka.</p>'}
  ];
  if(ms){
    const lst=a=>'<ol class="g-list">'+a.map((x,i)=>'<li><b class="n">'+(i+1)+'</b><span>'+x+'</span></li>').join('')+'</ol>';
    L.splice(5,0,{id:'milk',t:'Spień mleko · '+MILK[S.milk].n,h:()=>lst(ms.steam)},{id:'refill',t:'Uzupełnij kocioł',h:()=>lst(ms.refill)+'<p class="g-note">Tego kroku nie pomijaj na jednym kotle: po parze w kotle brakuje wody, a temperatura jest za wysoka na kawę.</p>'});
  }
  return L;
}
function guideLive(d){
  const tm=$('gT'); if(!tm) return;
  setText(tm,d.isE?num(Math.floor(el*10)/10):mss(el));
  const ph=$('phase').lastChild.textContent; setText($('gPh'),ph); $('gPh').style.color=$('phase').style.color;
  const cur=d.steps.find(x=>el>=x.a&&el<x.b); setText($('gNow'),cur?cur.l:(el>0?'Gotowe, zatrzymaj timer':'Naciśnij Start'));
  setHTML($('gRun'),run?'STOP':el>0?'WZNÓW':'START'); $('gRun').classList.toggle('run',run);
  const sh=d.steps.map((x,i)=>{const act=el>=x.a&&el<x.b&&(run||el>0), done=el>=x.b;
    return '<li style="'+(act?'border-color:var(--accent)':done?'opacity:.5':'')+'"><b class="n" style="'+(done?'background:var(--good)':'')+'">'+(i+1)+'</b><span><b style="font-family:var(--mono);font-weight:500">'+(d.isE?x.a+' s':mss(x.a))+'</b> · '+x.l+'</span></li>';}).join('');
  if($('gSteps').dataset.v!==sh){setHTML($('gSteps'),sh); $('gSteps').dataset.v=sh;}
}
function renderGuide(){
  const st=guideSteps(), n=st.length; GI=clamp(GI,0,n-1);
  setText($('gStepNo'),'KROK '+(GI+1)+' Z '+n);
  setHTML($('gDots'),st.map((_,i)=>'<i class="'+(i<=GI?'on':'')+'"></i>').join(''));
  setText($('gTitle'),st[GI].t);
  setHTML($('gBody'),st[GI].h());
  $('gBack').style.visibility=GI===0?'hidden':'visible';
  setText($('gNext'),GI===n-1?'OCEŃ KAWĘ':st[GI].id==='brew'?(el>0?'DALEJ':'POMIŃ'):'DALEJ');
  if(st[GI].id==='brew') guideLive(model());
  $('guide').scrollTop=0;
}
function openGuide(){GI=0; $('guide').hidden=false; document.body.style.overflow='hidden'; renderGuide(); $('gClose').focus();}
function closeGuide(){$('guide').hidden=true; document.body.style.overflow='';}
const settingsDialog=$('settingsDialog');
$('settingsBtn').addEventListener('click',()=>{
  alertsUi();
  settingsDialog.showModal();
});
settingsDialog.addEventListener('click',e=>{
  const target=e.target.closest('button[data-jump]');
  if(!target) return;
  settingsDialog.close();
  navigate(target.dataset.jump==='historyCard'?'history':'equipment');
});
$('timerLink').addEventListener('click',()=>{
  $('mainBtn').focus({preventScroll:true});
  navigate('timer');
});
$('guideCta').addEventListener('click',openGuide);
$('gClose').addEventListener('click',closeGuide);
$('gBack').addEventListener('click',()=>{GI--; renderGuide();});
$('gNext').addEventListener('click',()=>{
  if(GI===guideSteps().length-1){closeGuide(); renderRating(); navigate('rating'); return;}
  if(GID()==='brew'&&run){stopRun(); countShot(); update(); renderRating();}
  GI++; renderGuide();
});
$('gBody').addEventListener('click',e=>{
  const b=e.target.closest('button'); if(!b) return;
  if(b.dataset.gm){ if(b.dataset.gm!==S.method){stopRun(); el=0; S.method=b.dataset.gm; R.stars=0; R.taste=null; R.body=null; persist(); buildAll();} renderGuide(); }
  else if(b.dataset.gp!=null){ const i=+b.dataset.gp; S.pidx[S.method]=i; S.params[S.method].ratio=M[S.method].presets[i].r; if(M[S.method].presets[i].d) S.params[S.method].dose=M[S.method].presets[i].d; persist(); buildAll(); renderGuide(); }
  else if(b.dataset.gg){ S.grinder=b.dataset.gg; persist(); buildAll(); renderGuide(); }
  else if(b.dataset.gmk){ S.milk=b.dataset.gmk; persist(); annaUi(); renderGuide(); }
  else if(b.id==='gWarmGo'){ S.warm=Date.now(); persist(); warmUi(); renderGuide(); toast('Licznik rozgrzewania: '+WARM_MIN+' min'); }
  else if(b.id==='gRun'){ $('mainBtn').click(); guideLive(model()); }
});
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!$('guide').hidden) closeGuide(); });

(function(){let h='';for(let i=0;i<=8;i++){const a=Math.PI*(1-i/8),c=Math.cos(a),n=Math.sin(a);h+='<line x1="'+(70+40*c).toFixed(1)+'" y1="'+(72-40*n).toFixed(1)+'" x2="'+(70+(i%2?44:46)*c).toFixed(1)+'" y2="'+(72-(i%2?44:46)*n).toFixed(1)+'"/>';}setHTML($('bTicksG'),h);})();
window.addEventListener('crema:preferences',()=>{buildAll();renderHist();renderCoffees();renderCoffeePick();servUi();if(!$('guide').hidden)renderGuide();});
alertsUi();
buildAll(); renderHist(); renderCoffees(); renderCoffeePick(); servUi(); requestAnimationFrame(frame);
function finishBrew(){stopRun(); countShot(); renderRating(); clearTint(); $('ratePrompt').hidden=true; update(); navigate('rating');}
return { finish:finishBrew };

}
