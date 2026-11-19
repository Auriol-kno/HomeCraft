export type MethodId = 'espresso' | 'aeropress' | 'v60' | 'french' | 'turkish' | 'moka';
type Range = [number, number, number];
export interface Preset { n:string; r:number; w?:[number,number]; steep?:number; d?:number; sl?:string; sugar?:number }
export interface MethodDefinition { name:string; short?:string; tmax:number; dose:Range; ratio:Range; temp:Range|null; zone:[number,number]; gstep:number; presets:Preset[] }
export const M: Record<MethodId, MethodDefinition> ={
  espresso:{name:'Espresso',tmax:45,dose:[7,22,.5],ratio:[1,3.5,.1],temp:[88,98,1],zone:[3,4.5],gstep:.2,
    presets:[{n:'Ristretto',r:1.5,w:[20,26]},{n:'Espresso',r:2,w:[25,30]},{n:'Lungo',r:3,w:[30,38]}]},
  aeropress:{name:'AeroPress',tmax:180,dose:[10,25,.5],ratio:[5,18,.5],temp:[75,96,1],zone:[5,7],gstep:.4,
    presets:[{n:'Klasyczna',r:14,steep:90},{n:'Odwrócona',r:13,steep:120},{n:'Koncentrat',r:6,steep:60}]},
  v60:{name:'V60',tmax:240,dose:[10,30,.5],ratio:[14,18,.5],temp:[85,98,1],zone:[8,9],gstep:.4,
    presets:[{n:'Klasyczny',r:16},{n:'Mocny',r:15},{n:'Lekki',r:17}]},
  french:{name:'French press',short:'French',tmax:420,dose:[10,40,1],ratio:[10,18,.5],temp:[88,98,1],zone:[9,10],gstep:.4,
    presets:[{n:'Klasyczna',r:15,steep:240},{n:'Mocna',r:12,steep:240},{n:'Długa',r:16,steep:360}]},
  turkish:{name:'Po turecku',short:'Turecka',tmax:300,dose:[5,20,.5],ratio:[8,12,.5],temp:null,zone:[2,3.5],gstep:.2,
    presets:[{n:'Sade',r:10,sugar:0,sl:'bez cukru'},{n:'Orta',r:10,sugar:1,sl:'1 łyż.'},{n:'Şekerli',r:10,sugar:2,sl:'2 łyż.'}]},
  moka:{name:'Bialetti Venus',short:'Moka',tmax:240,dose:[10,50,.5],ratio:[8,12,.5],temp:[60,100,1],zone:[5,7],gstep:.3,
    presets:[{n:'Venus 4',r:9.5,d:18,sl:'18 g · 170 ml'},{n:'Venus 6',r:10,d:23.5,sl:'23,5 g · 235 ml'},{n:'Venus 10',r:11,d:42,sl:'42 g · 460 ml'}]}
};
export const ORDER: MethodId[] =['espresso','aeropress','v60','french','turkish','moka'];
export const DEF={method:'espresso',pre:true,pidx:{espresso:1,aeropress:0,v60:0,french:0,turkish:0,moka:1},
  params:{espresso:{dose:18,ratio:2,temp:93,grind:3.6},aeropress:{dose:15,ratio:14,temp:85,grind:6},v60:{dose:15,ratio:16,temp:94,grind:8.5},
          french:{dose:30,ratio:15,temp:94,grind:9.5},turkish:{dose:7,ratio:10,temp:null,grind:2.6},moka:{dose:23.5,ratio:10,temp:90,grind:5.5}},
  grinder:'kpro', lelit:{dial:5.5,time:7.2,rate:2.5,fineLower:true},
  milk:'none', roast:'medium', warm:null, anna:false,
  maint:{shots:0,grams:0,items:{}},
  alerts:{sound:true,voice:false,flash:true},
  hist:[]};
