// 50 original, untested baking adaptations. Each family has five distinct variants.
// All quantities refer to the full batch; one serving is one slice or bun.
import { recipe } from './cookbook-recipes.ts';
import type { CookbookRecipe, Cuisine, Category } from './cookbook-recipes.ts';
type I=[string,number,number];
type V=[string,I[],string];
type B={c:Cuisine,cat:Category,base:I[],variants:V[],prep:string,bake:string,min:number,servings:number,proof?:number,proof2?:number,cool?:number};
const i=(n:string,g:number,k:number):I=>[n,g,k];
const flour=(g:number)=>i('Mąka pszenna',g,364), butter=(g:number)=>i('Masło',g,717), sugar=(g:number)=>i('Cukier',g,400), eggs=(g:number)=>i('Jajka',g,143), milk=(g:number)=>i('Mleko',g,50), water=(g:number)=>i('Woda',g,0), salt=i('Sól',5,0), yeast=i('Drożdże instant',7,325), powder=i('Proszek do pieczenia',8,100), oil=(g:number)=>i('Olej',g,884);
const families:B[]=[
 {c:'Polska',cat:'Ciasta',base:[flour(250),butter(160),sugar(140),eggs(165),powder,milk(80)],prep:'Utrzyj miękkie masło z cukrem, kolejno dodaj jajka. Wsyp przesianą mąkę i proszek, dodaj mleko. Wymieszaj tylko do połączenia.',bake:'Przełóż do wyłożonej papierem keksówki ok. 25 cm. Piecz w 175 °C góra–dół, do suchego patyczka.',min:48,servings:10,cool:30,variants:[
 ['Babka cytrynowa',[i('Cytryna',100,29)],'Dodaj startą skórkę i 30 g soku z cytryny do masy.'],
 ['Babka marmurkowa',[i('Kakao',20,228)],'Podziel masę na dwie części, do jednej dodaj kakao. Nakładaj naprzemiennie.'],
 ['Babka pomarańczowa',[i('Pomarańcza',150,47)],'Dodaj skórkę i 40 g soku z pomarańczy.'],
 ['Babka z malinami',[i('Maliny',180,52)],'Delikatnie wmieszaj osuszone maliny na końcu.'],
 ['Babka z makiem',[i('Mak',65,525)],'Dodaj suchy mak do mąki.']]},
 {c:'Francuska',cat:'Ciasta',base:[flour(250),butter(125),sugar(60),eggs(55),i('Skrobia ziemniaczana',15,350)],prep:'Zagnieć mąkę, zimne masło, cukier i jajko na kruche ciasto. Schłodź przez 30 min. Wyłóż formę do tarty 24 cm, nakłuj; podpiecz 12 min w 190 °C pod obciążeniem. Skrobię połącz z owocami i ułóż na spodzie.',bake:'Piecz tartę w 180 °C, aż brzegi będą złote i nadzienie zacznie bulgotać. Czas obejmuje podpiekanie spodu.',min:42,servings:8,cool:40,variants:[
 ['Tarta jabłkowa z cynamonem',[i('Jabłka',600,52),i('Cynamon',3,247)],'Jabłka obierz i pokrój w cienkie plasterki, wymieszaj z cynamonem.'],
 ['Tarta gruszkowa',[i('Gruszki',600,57)],'Gruszki pokrój w ósemki i osusz.'],
 ['Tarta śliwkowa',[i('Śliwki',600,46)],'Usuń pestki, ułóż śliwki przecięciem do góry.'],
 ['Tarta z borówkami',[i('Borówki',500,57)],'Borówki osusz, wymieszaj ze skrobią.'],
 ['Tarta wiśniowa',[i('Wiśnie bez pestek',500,50)],'Wiśnie odsącz z nadmiaru soku.']]},
 {c:'Polska',cat:'Ciasta',base:[i('Twaróg sernikowy',1000,135),eggs(220),sugar(130),i('Skrobia ziemniaczana',40,350),i('Śmietanka 30%',150,290)],prep:'Wymieszaj twaróg z cukrem, skrobią i śmietanką na wolnych obrotach. Dodaj po jednym jajku, nie napowietrzaj. Wmieszaj dodatki.',bake:'Przelej do tortownicy 22–24 cm wyłożonej papierem. Piecz 60 min w 155 °C. Środek powinien być ścięty (min. 71 °C). Studź stopniowo, następnie schłodź w lodówce.',min:60,servings:12,cool:240,variants:[
 ['Sernik waniliowy bez spodu',[i('Pasta waniliowa',8,280)],'Dodaj wanilię do twarogu.'],
 ['Sernik cytrynowy',[i('Cytryna',100,29)],'Dodaj skórkę i 30 g soku.'],
 ['Sernik z malinami',[i('Maliny',200,52)],'Rozłóż maliny na wierzchu przed pieczeniem.'],
 ['Sernik z gorzką czekoladą',[i('Gorzka czekolada',100,550)],'Czekoladę roztop, przestudź, wmieszaj do masy.'],
 ['Sernik kokosowy',[i('Wiórki kokosowe',75,660)],'Wiórki wmieszaj do masy.']]},
 {c:'Amerykańska',cat:'Ciasta',base:[flour(180),butter(160),i('Gorzka czekolada',180,550),sugar(140),eggs(165),i('Kakao',20,228)],prep:'Roztop masło i czekoladę, przestudź. Jajka wymieszaj z cukrem, dodaj czekoladę, mąkę i kakao. Wmieszaj dodatki.',bake:'Przełóż do formy 20 × 20 cm. Piecz w 175 °C, aż brzegi będą ścięte, a patyczek będzie miał wilgotne okruchy, nie surową masę (min. 71 °C w środku).',min:28,servings:12,cool:45,variants:[
 ['Brownie z orzechami włoskimi',[i('Orzechy włoskie',80,654)],'Orzechy posiekaj i wmieszaj.'],
 ['Brownie z malinami',[i('Maliny',150,52)],'Maliny rozłóż na masie.'],
 ['Brownie z wiśniami',[i('Wiśnie bez pestek',150,50)],'Wiśnie odsącz i dodaj do masy.'],
 ['Brownie z migdałami',[i('Migdały',75,579)],'Migdały posiekaj i wmieszaj.'],
 ['Brownie z pomarańczą',[i('Pomarańcza',120,47)],'Dodaj startą skórkę i 20 g soku.']]},
 {c:'Polska',cat:'Chleby',base:[flour(500),water(340),yeast,salt],prep:'Wymieszaj mąkę, wodę, drożdże i sól, wyrabiaj 8–10 min. Dodaj składniki wariantu. Ciasto ma być miękkie, nie suche.',bake:'Uformowany bochenek natnij. Piecz 15 min w 230 °C, potem 30 min w 200 °C. Gotowy chleb powinien osiągnąć ok. 96 °C w środku. Studź na kratce.',min:45,servings:14,proof:75,proof2:40,cool:60,variants:[
 ['Chleb pszenny codzienny',[i('Oliwa',15,884)],'Wyrób oliwę z ciastem.'],
 ['Chleb pszenny ze słonecznikiem',[i('Pestki słonecznika',70,584)],'Pestki wmieszaj pod koniec wyrabiania.'],
 ['Chleb pszenny z pestkami dyni',[i('Pestki dyni',70,559)],'Pestki wmieszaj pod koniec wyrabiania.'],
 ['Chleb pszenny z sezamem',[i('Sezam',45,573)],'Część sezamu zachowaj na wierzch.'],
 ['Chleb pszenny z siemieniem',[i('Siemię lniane',40,534),water(30)],'Siemię namocz w dodatkowej wodzie 15 min, wmieszaj.']]},
 {c:'Polska',cat:'Chleby',base:[i('Mąka pszenna pełnoziarnista',350,340),i('Mąka żytnia',150,335),water(380),yeast,salt],prep:'Wymieszaj mąki, wodę, drożdże i sól. Wyrabiaj ok. 8 min, dodaj składniki wariantu. Ciasto będzie lekko lepkie; przełóż do natłuszczonej lub wyłożonej formy.',bake:'Piecz w keksówce 30 cm: 15 min w 220 °C, następnie 35 min w 195 °C. Sprawdź ok. 96–98 °C w środku, wyjmij z formy i studź.',min:50,servings:14,proof:75,proof2:35,cool:90,variants:[
 ['Chleb razowy pszenno-żytni',[],'Wyrób podstawowe ciasto.'],
 ['Chleb razowy z płatkami owsianymi',[i('Płatki owsiane',60,370),water(40)],'Płatki namocz w dodatkowej wodzie przed dodaniem.'],
 ['Chleb razowy z orzechami',[i('Orzechy włoskie',70,654)],'Posiekane orzechy dodaj na końcu wyrabiania.'],
 ['Chleb razowy z żurawiną',[i('Żurawina suszona',60,325)],'Żurawinę namocz, odsącz, wmieszaj.'],
 ['Chleb razowy z kminkiem',[i('Kminek',8,333)],'Kminek wmieszaj do mąki.']]},
 {c:'Polska',cat:'Bułki',base:[flour(500),water(300),yeast,salt,oil(25)],prep:'Połącz mąkę, wodę, drożdże, sól i olej, wyrabiaj 8–10 min. Dodaj składniki wariantu. Po pierwszym wyrastaniu podziel na 8 bułek.',bake:'Bułki ułóż na papierze, natnij lub posmaruj wodą. Piecz w 210 °C przez około 18–22 min do rumianej skórki.',min:22,servings:8,proof:60,proof2:35,cool:15,variants:[
 ['Bułki pszenne śniadaniowe',[],'Uformuj okrągłe bułki.'],
 ['Bułki z makiem',[i('Mak',30,525)],'Posmaruj wierzch wodą i posyp makiem.'],
 ['Bułki z sezamem',[i('Sezam',35,573)],'Posmaruj wierzch wodą i posyp sezamem.'],
 ['Bułki z suszonymi pomidorami',[i('Suszone pomidory odsączone',70,220)],'Posiekane pomidory wmieszaj przed wyrastaniem.'],
 ['Bułki z rozmarynem',[i('Rozmaryn',5,131)],'Rozmaryn posiekaj i dodaj do ciasta.']]},
 {c:'Francuska',cat:'Bułki',base:[flour(500),milk(240),butter(70),eggs(110),sugar(45),yeast,salt],prep:'Wymieszaj mąkę, mleko, jajka, cukier, drożdże i sól. Wyrabiaj, stopniowo dodając miękkie masło, aż ciasto będzie gładkie. Po pierwszym wyrastaniu podziel na 10 bułek.',bake:'Ułóż na papierze. Piecz w 180 °C przez ok. 20–24 min do zrumienienia i upieczonego środka.',min:24,servings:10,proof:90,proof2:45,cool:20,variants:[
 ['Bułki maślane brioche',[],'Uformuj gładkie kulki.'],
 ['Bułki mleczne z rodzynkami',[i('Rodzynki',80,299)],'Rodzynki namocz, odcedź, dodaj przed wyrastaniem.'],
 ['Bułki mleczne z czekoladą',[i('Gorzka czekolada',80,550)],'W każdą bułkę włóż kawałki czekolady.'],
 ['Bułki mleczne z cynamonem',[i('Cynamon',8,247),sugar(30)],'Dodatkowy cukier i cynamon rozsmaruj z odrobiną masła z przepisu na rozwałkowanym cieście, zwiń i pokrój.'],
 ['Bułki maślane z wanilią',[i('Pasta waniliowa',8,280)],'Wanilię dodaj do mleka.']]},
 {c:'Włoska',cat:'Wypieki',base:[flour(500),water(320),yeast,salt,oil(25),i('Passata pomidorowa',240,30),i('Mozzarella',200,250)],prep:'Z mąki, wody, drożdży, soli i oliwy wyrób ciasto. Po wyrastaniu podziel na 2 placki, rozciągnij, posmaruj passatą i rozłóż mozzarellę oraz dodatki.',bake:'Rozgrzej piekarnik z blachą do 240 °C. Piecz placki kolejno ok. 12–15 min każdy do rumianych brzegów i upieczonego spodu.',min:30,servings:6,proof:90,cool:5,variants:[
 ['Pizza margherita',[i('Bazylia',12,23)],'Bazylię dodaj po pieczeniu.'],
 ['Pizza z pieczarkami',[i('Pieczarki',250,22)],'Pieczarki podsmaż i odsącz przed ułożeniem.'],
 ['Pizza z szynką i papryką',[i('Szynka gotowana',140,120),i('Papryka',150,31)],'Szynkę i paprykę pokrój cienko.'],
 ['Pizza z oliwkami i kaparami',[i('Oliwki',80,116),i('Kapary',25,23)],'Odsącz oliwki i kapary, rozłóż na pizzy.'],
 ['Pizza ze szpinakiem i ricottą',[i('Szpinak',200,23),i('Ricotta',120,174)],'Szpinak podduś i odciśnij, ricottę rozłóż łyżeczką.']]},
 {c:'Amerykańska',cat:'Wypieki',base:[flour(240),butter(150),sugar(100),eggs(55),i('Soda oczyszczona',4,0)],prep:'Utrzyj masło z cukrem, dodaj jajko, mąkę i sodę. Wmieszaj dodatek, schłodź 20 min. Uformuj 16 kulek, spłaszcz i rozłóż na dwóch blachach z odstępami.',bake:'Piecz partiami w 180 °C góra–dół po 12–14 min, aż brzegi się zrumienią. Środek powinien być upieczony, nie surowy.',min:28,servings:16,cool:20,variants:[
 ['Ciasteczka chocolate chip',[i('Gorzka czekolada',120,550)],'Posiekaj czekoladę na kawałki.'],
 ['Ciasteczka owsiano-maślane',[i('Płatki owsiane',70,370),milk(30)],'Dodaj płatki i mleko.'],
 ['Ciasteczka migdałowe',[i('Migdały mielone',60,579)],'Migdały wmieszaj do mąki.'],
 ['Ciasteczka żurawinowe',[i('Żurawina suszona',80,325)],'Żurawinę posiekaj i wmieszaj.'],
 ['Ciasteczka kokosowe',[i('Wiórki kokosowe',65,660),milk(30)],'Wiórki i mleko dodaj do masy.']]},
];
function make(b:B,v:V,index:number):CookbookRecipe{
 const [name,add,detail]=v,ingredients=[...b.base,...add];
 const names=ingredients.map(x=>x[0].toLowerCase()).join(' ');
 const allergens=['gluten',...(/masło|mleko|twaróg|śmietank|mozzarella|ricotta/.test(names)?['mleko']:[]),...(/jaj/.test(names)?['jaja']:[]),...(/migdał|orzech/.test(names)?['orzechy']:[]),...(/sezam/.test(names)?['sezam']:[])];
 const steps:Parameters<typeof recipe>[6]=[[15,'Przygotuj ciasto i dodatki',b.prep+' '+detail]];
 if(b.cat==='Ciasta'&&b.c==='Francuska')steps.push([30,'Schłodź kruche ciasto','Schłodź zawinięte ciasto w lodówce przed wałkowaniem.','wait']);
 if(name.startsWith('Ciasteczka'))steps.push([20,'Schłodź masę','Schłodź masę w lodówce przed formowaniem ciastek.','wait']);
 if(b.proof){steps.push([b.proof,'Pierwsze wyrastanie','Przykryj i odstaw do wyraźnego zwiększenia objętości.','wait']);steps.push([10,'Uformuj wypiek',b.cat==='Chleby'?'Uformuj bochenek lub przełóż do formy.':b.cat==='Bułki'?'Podziel ciasto na '+b.servings+' porcji i uformuj bułki. '+detail:'Podziel na 2 placki, rozciągnij i rozłóż dodatki. '+detail]);}
 if(b.proof2)steps.push([b.proof2,'Drugie wyrastanie','Przykryj i odstaw do napuszenia.','wait']);
 steps.push([b.min,'Piecz w piekarniku',b.bake,'oven']);
 if(b.cool)steps.push([b.cool,'Studzenie','Ostudź na kratce. Sernik po ostudzeniu przechowuj w lodówce.','wait']);
 const r=recipe('book-'+String(index+300).padStart(3,'0'),name,b.c,b.cat,b.servings,ingredients,steps,allergens,/jaj/.test(names)?'egg':undefined,'Wypiek domowy; ilości i czasy orientacyjne. Nie próbuj surowego ciasta.');
 r.book.sources=[];return r;
}
export const BAKERY_COOKBOOK_RECIPES=families.flatMap(b=>b.variants.map(v=>({b,v}))).map(({b,v},index)=>make(b,v,index));
