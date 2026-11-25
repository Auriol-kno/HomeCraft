// 100 original HomeCraft adaptations. Nutrition is an editorial estimate based on the
// listed raw edible mass. Recipes are deliberately marked as not kitchen-tested.
import type { CookbookRecipe, Cuisine, Category, Diet, RecipeDevice, NutritionIngredient } from './cookbook-recipes.ts';
import type { Lane } from './kitchen-types.ts';

type Seed=readonly [name:string,cuisine:Cuisine,category:Category,diets:Diet[],device:RecipeDevice,main:string,mainG:number,mainKcal:number,side:string,sideG:number,sideKcal:number,minutes:number];
const I='Międzynarodowa' as const, A='Azjatycka' as const, P='Polska' as const;
const O='Obiady' as const, S='Śniadania' as const, K='Przekąski' as const, Z='Zupy' as const, D='Desery' as const, N='Napoje' as const;
const H='Wysokobiałkowa' as const,L='Niskowęglowodanowa' as const,M='Śródziemnomorska' as const,V='Wegetariańska' as const,G='Wegańska' as const,F='Bezglutenowa' as const;
const seeds:Seed[]=[
 ['Bowl z kurczakiem, komosą i brokułem',I,O,[H,F],'Air Fryer','Pierś z kurczaka',500,120,'Komosa ryżowa sucha',180,368,22],
 ['Łosoś cytrynowy z fasolką',I,O,[H,L,M,F],'Air Fryer','Filet z łososia',500,208,'Fasolka szparagowa',500,31,14],
 ['Indyk tikka z ryżem kalafiorowym',A,O,[H,L,F],'Air Fryer','Pierś z indyka',500,110,'Kalafior',600,25,18],
 ['Dorsz z pomidorami i oliwkami',M,O,[H,L,M,F],'Air Fryer','Filet z dorsza',600,82,'Pomidory',400,18,15],
 ['Kurczak satay z surówką',A,O,[H,L,F],'Air Fryer','Pierś z kurczaka',500,120,'Kapusta biała',500,25,18],
 ['Pulpeciki z indyka i cukinii',I,O,[H,L,F],'Air Fryer','Mięso mielone z indyka',500,150,'Cukinia',400,17,16],
 ['Polędwiczka z papryką',P,O,[H,L,F],'Air Fryer','Polędwiczka wieprzowa',550,143,'Papryka',500,31,20],
 ['Krewetki czosnkowe z warzywami',A,O,[H,L,M,F],'Air Fryer','Krewetki obrane',500,99,'Warzywa stir-fry',600,35,10],
 ['Omlet białkowy ze szpinakiem',I,S,[H,L,V,F],'Bez urządzenia','Jajka',330,143,'Szpinak',200,23,12],
 ['Skyr z malinami i migdałami',I,S,[H,L,V,F],'Bez urządzenia','Skyr naturalny',500,64,'Maliny',250,52,5],
 ['Twarożek proteinowy z ogórkiem',P,S,[H,L,V,F],'Bez urządzenia','Twaróg chudy',500,99,'Ogórek',300,15,6],
 ['Tofu teriyaki bez glutenu',A,O,[H,V,G,F],'Air Fryer','Tofu naturalne',500,130,'Brokuł',500,34,18],
 ['Tempeh z pak choi',A,O,[H,L,V,G,F],'Bez urządzenia','Tempeh',400,193,'Pak choi',500,13,15],
 ['Sałatka z tuńczykiem i sałatą rzymską',M,O,[H,L,M,F],'Bez urządzenia','Tuńczyk w sosie własnym',400,116,'Sałata rzymska',300,17,10],
 ['Kurczak caprese',M,O,[H,L,M,F],'Air Fryer','Pierś z kurczaka',500,120,'Pomidor',400,18,17],
 ['Frittata z łososiem i koperkiem',I,S,[H,L,F],'Air Fryer','Jajka',440,143,'Łosoś wędzony',180,117,16],
 ['Chili z indykiem i fasolą',I,O,[H,F],'Thermomix','Mięso mielone z indyka',500,150,'Fasola czerwona ugotowana',500,127,28],
 ['Krem z soczewicy i skyru',I,Z,[H,V,F],'Thermomix','Soczewica czerwona sucha',260,350,'Skyr naturalny',250,64,30],
 ['Wołowina po koreańsku z brokułem',A,O,[H,L,F],'Bez urządzenia','Polędwica wołowa',500,180,'Brokuł',500,34,16],
 ['Pstrąg z koperkiem i szparagami',P,O,[H,L,M,F],'Air Fryer','Filet z pstrąga',600,148,'Szparagi',500,20,14],
 ['Makaron z cukinii i pesto',M,O,[L,M,V,F],'Bez urządzenia','Cukinia',800,17,'Mozzarella',200,250,12],
 ['Bakłażan z fetą i pomidorem',M,O,[L,M,V,F],'Air Fryer','Bakłażan',700,25,'Ser feta',180,265,20],
 ['Kalafior buffalo z dipem jogurtowym',I,K,[L,V,F],'Air Fryer','Kalafior',700,25,'Jogurt grecki',250,97,18],
 ['Cukinia faszerowana ricottą',I,O,[L,V,F],'Air Fryer','Cukinia',800,17,'Ricotta',300,174,22],
 ['Shakshuka z papryką',M,S,[L,M,V,F],'Bez urządzenia','Jajka',330,143,'Pomidory',600,18,18],
 ['Sałatka grecka z awokado',M,O,[L,M,V,F],'Bez urządzenia','Ser feta',200,265,'Warzywa sałatkowe',700,25,10],
 ['Kotlety jajeczne z kalafiorem',P,O,[L,V,F],'Air Fryer','Jajka',440,143,'Kalafior',500,25,18],
 ['Pieczarki faszerowane szpinakiem',I,K,[L,V,F],'Air Fryer','Pieczarki portobello',600,22,'Szpinak',300,23,15],
 ['Zupa tajska kokosowa z tofu',A,Z,[L,V,G,F],'Thermomix','Tofu naturalne',350,130,'Mleko kokosowe',300,180,25],
 ['Brokuł z halloumi i sezamem',M,O,[L,M,V,F],'Air Fryer','Brokuł',650,34,'Ser halloumi',250,321,16],
 ['Kapusta pak choi z jajkiem',A,O,[L,V,F],'Bez urządzenia','Pak choi',700,13,'Jajka',330,143,12],
 ['Tacos w liściach sałaty',I,O,[H,L,F],'Bez urządzenia','Mięso mielone wołowe',450,200,'Sałata rzymska',300,17,18],
 ['Kurczak z pesto i fasolką',M,O,[H,L,M,F],'Air Fryer','Pierś z kurczaka',500,120,'Fasolka szparagowa',500,31,16],
 ['Gazpacho pomidorowo-paprykowe',M,Z,[L,M,V,G,F],'Thermomix','Pomidory',900,18,'Papryka',400,31,8],
 ['Caprese z pieczoną cukinią',M,K,[L,M,V,F],'Air Fryer','Cukinia',600,17,'Mozzarella',250,250,14],
 ['Śródziemnomorski łosoś z kuskusem',M,O,[H,M],'Air Fryer','Filet z łososia',500,208,'Kuskus suchy',220,376,18],
 ['Kurczak souvlaki z tzatziki',M,O,[H,L,M,F],'Air Fryer','Pierś z kurczaka',550,120,'Jogurt grecki',250,97,18],
 ['Orzo z krewetkami i pomidorami',M,O,[H,M],'Bez urządzenia','Krewetki obrane',450,99,'Makaron orzo suchy',260,350,22],
 ['Sałatka nicejska',M,O,[H,L,M,F],'Bez urządzenia','Tuńczyk w sosie własnym',350,116,'Fasolka szparagowa',350,31,14],
 ['Ciecierzyca po grecku',M,O,[M,V,G,F],'Thermomix','Ciecierzyca ugotowana',700,164,'Pomidory',500,18,24],
 ['Fasola po toskańsku',M,O,[M,V,G,F],'Thermomix','Biała fasola ugotowana',700,110,'Pomidory',500,18,25],
 ['Dorsz po prowansalsku',M,O,[H,L,M,F],'Air Fryer','Filet z dorsza',600,82,'Pomidory',500,18,16],
 ['Warzywa ratatouille',M,O,[L,M,V,G,F],'Thermomix','Bakłażan',500,25,'Cukinia',500,17,30],
 ['Hummus z pieczoną papryką',M,K,[M,V,G,F],'Thermomix','Ciecierzyca ugotowana',500,164,'Papryka',300,31,12],
 ['Tabbouleh z komosy ryżowej',M,K,[M,V,G,F],'Bez urządzenia','Komosa ryżowa sucha',220,368,'Pomidor',500,18,20],
 ['Zupa rybna z pomidorami',M,Z,[H,L,M,F],'Thermomix','Filet z dorsza',500,82,'Pomidory',600,18,25],
 ['Focaccia z pomidorkami',M,K,[M,V],'Thermomix','Mąka pszenna',500,364,'Pomidorki koktajlowe',300,18,35],
 ['Sałatka z soczewicą i fetą',M,O,[H,M,V,F],'Bez urządzenia','Soczewica ugotowana',600,116,'Ser feta',200,265,12],
 ['Pieczona dorada z cytryną',M,O,[H,L,M,F],'Air Fryer','Filet z dorady',600,120,'Cytryna',100,29,16],
 ['Pasta z białej fasoli i suszonych pomidorów',M,K,[M,V,G,F],'Thermomix','Biała fasola ugotowana',500,110,'Suszone pomidory',120,213,8],
 ['Buddha bowl z tofu i komosą',I,O,[H,V,G,F],'Air Fryer','Tofu naturalne',450,130,'Komosa ryżowa sucha',200,368,20],
 ['Curry z ciecierzycy i szpinaku',A,O,[V,G,F],'Thermomix','Ciecierzyca ugotowana',700,164,'Szpinak',300,23,25],
 ['Dal kokosowy z czerwonej soczewicy',A,O,[H,V,G,F],'Thermomix','Soczewica czerwona sucha',300,350,'Pomidory',400,18,28],
 ['Chili sin carne',I,O,[H,V,G,F],'Thermomix','Fasola czerwona ugotowana',700,127,'Kukurydza',300,86,30],
 ['Tofu katsu w Air Fryerze',A,O,[H,V,G],'Air Fryer','Tofu naturalne',500,130,'Panko',120,350,18],
 ['Makaron ryżowy z tofu i pak choi',A,O,[H,V,G,F],'Bez urządzenia','Tofu naturalne',400,130,'Makaron ryżowy suchy',260,364,20],
 ['Gulasz z batata i fasoli',I,O,[V,G,F],'Thermomix','Batat',600,86,'Czarna fasola ugotowana',500,132,30],
 ['Falafel pieczony',M,K,[H,M,V,G,F],'Air Fryer','Ciecierzyca ugotowana',700,164,'Natka pietruszki',60,36,18],
 ['Wegańskie gołąbki z kaszą',P,O,[V,G,F],'Thermomix','Kapusta biała',900,25,'Kasza gryczana sucha',250,343,55],
 ['Kotlety z czerwonej fasoli',I,O,[H,V,G,F],'Air Fryer','Fasola czerwona ugotowana',650,127,'Płatki owsiane bezglutenowe',120,370,18],
 ['Zupa miso z tofu i shiitake',A,Z,[H,L,V,G,F],'Thermomix','Tofu naturalne',350,130,'Grzyby shiitake',250,34,15],
 ['Wegański ramen grzybowy',A,Z,[V,G],'Thermomix','Makaron ramen suchy',280,350,'Grzyby',500,22,28],
 ['Sałatka z mango i edamame',A,O,[H,V,G,F],'Bez urządzenia','Edamame',450,121,'Mango',300,60,10],
 ['Krem z pieczonego kalafiora',I,Z,[L,V,G,F],'Thermomix','Kalafior',900,25,'Napój sojowy',400,33,28],
 ['Pasta z groszku i mięty',I,K,[H,V,G,F],'Thermomix','Groszek zielony',600,81,'Cytryna',80,29,8],
 ['Owsianka marchewkowa na napoju sojowym',I,S,[V,G],'Thermomix','Płatki owsiane',220,370,'Marchew',300,41,12],
 ['Pudding chia z malinami',I,D,[V,G,F],'Thermomix','Nasiona chia',140,486,'Maliny',350,52,8],
 ['Sorbet mango-limonka',A,D,[V,G,F],'Thermomix','Mango mrożone',700,60,'Limonka',100,30,6],
 ['Wegańskie kulki mocy',I,K,[V,G,F],'Thermomix','Daktyle',400,282,'Migdały',250,579,8],
 ['Zielony koktajl proteinowy',I,N,[H,V,G,F],'Thermomix','Napój sojowy',500,33,'Tofu jedwabiste',300,55,4],
 ['Steki z kalafiora z tahini',M,O,[L,M,V,G,F],'Air Fryer','Kalafior',900,25,'Tahini',120,595,20],
 ['Boczniaki po azjatycku',A,O,[L,V,G,F],'Air Fryer','Boczniaki',700,33,'Pak choi',400,13,15],
 ['Kasza gryczana z burakiem i fetą',P,O,[V,F],'Thermomix','Kasza gryczana sucha',260,343,'Burak',500,43,28],
 ['Pierogi leniwe ze szpinakiem',P,O,[H,V],'Thermomix','Twaróg półtłusty',500,133,'Szpinak',250,23,22],
 ['Zapiekanka z brokułem i fetą',I,O,[L,V,F],'Air Fryer','Brokuł',700,34,'Ser feta',250,265,22],
 ['Jajka po turecku',A,S,[H,L,V,F],'Bez urządzenia','Jajka',330,143,'Jogurt grecki',350,97,12],
 ['Risotto z groszkiem i cytryną',I,O,[V,F],'Thermomix','Ryż arborio suchy',300,360,'Groszek zielony',350,81,28],
 ['Kopytka z dyni',P,O,[V],'Thermomix','Dynia',600,26,'Mąka pszenna',350,364,35],
 ['Naleśniki gryczane z twarożkiem',P,S,[H,V,F],'Thermomix','Mąka gryczana',250,335,'Twaróg półtłusty',400,133,20],
 ['Placuszki z cukinii i fety',M,O,[H,L,M,V,F],'Air Fryer','Cukinia',700,17,'Ser feta',220,265,18],
 ['Quiche bez spodu z porem',I,O,[H,L,V,F],'Air Fryer','Jajka',440,143,'Por',350,61,24],
 ['Sałatka z halloumi i gruszką',M,O,[L,M,V,F],'Air Fryer','Ser halloumi',300,321,'Gruszka',300,57,12],
 ['Krem pomidorowy z mascarpone',I,Z,[L,V,F],'Thermomix','Pomidory',900,18,'Mascarpone',200,429,22],
 ['Papryka faszerowana komosą',M,O,[M,V,F],'Air Fryer','Papryka',800,31,'Komosa ryżowa sucha',240,368,25],
 ['Gofry twarogowe bez glutenu',I,S,[H,V,F],'Thermomix','Twaróg półtłusty',400,133,'Mąka ryżowa',180,366,18],
 ['Serniczki z Air Fryera',P,D,[H,V,F],'Air Fryer','Twaróg półtłusty',600,133,'Jajka',220,143,20],
 ['Kotleciki z łososia bez bułki',I,O,[H,L,F],'Air Fryer','Filet z łososia',550,208,'Jajka',110,143,16],
 ['Kurczak kokosowy bez panierki',A,O,[H,L,F],'Air Fryer','Pierś z kurczaka',550,120,'Mleko kokosowe',220,180,18],
 ['Bezglutenowy pad thai z krewetkami',A,O,[H,F],'Bez urządzenia','Krewetki obrane',450,99,'Makaron ryżowy suchy',260,364,20],
 ['Burgery wołowe bez bułki',I,O,[H,L,F],'Air Fryer','Mięso mielone wołowe',600,200,'Warzywa sałatkowe',500,25,14],
 ['Placki ziemniaczane bez mąki',P,O,[V,F],'Air Fryer','Ziemniaki',900,77,'Jajka',110,143,20],
 ['Kluski jaglane z twarogiem',P,O,[H,V,F],'Thermomix','Kasza jaglana sucha',300,378,'Twaróg półtłusty',400,133,28],
 ['Brownie z fasoli bez mąki',I,D,[V,F],'Thermomix','Fasola czerwona ugotowana',500,127,'Kakao',80,228,25],
 ['Ciasto migdałowo-pomarańczowe',M,D,[V,F],'Thermomix','Mąka migdałowa',300,600,'Pomarańcza',350,47,32],
 ['Pudding jaglany z kokosem',I,D,[V,G,F],'Thermomix','Kasza jaglana sucha',220,378,'Mleko kokosowe',350,180,24],
 ['Koktajl truskawkowy ze skyrem',I,N,[H,V,F],'Thermomix','Skyr naturalny',400,64,'Truskawki',500,32,4],
 ['Zupa krem z groszku',I,Z,[H,V,F],'Thermomix','Groszek zielony',700,81,'Skyr naturalny',200,64,20],
 ['Frytki z batata z dipem awokado',I,K,[V,G,F],'Air Fryer','Batat',700,86,'Awokado',250,160,20],
 ['Chipsy z jarmużu',I,K,[L,V,G,F],'Air Fryer','Jarmuż',300,49,'Oliwa',25,884,8],
 ['Prażona ciecierzyca paprykowa',M,K,[H,M,V,G,F],'Air Fryer','Ciecierzyca ugotowana',650,164,'Oliwa',25,884,16],
 ['Koreczki caprese',M,K,[L,M,V,F],'Bez urządzenia','Mozzarella mini',300,250,'Pomidorki koktajlowe',500,18,8],
];

const source='https://www.bbcgoodfood.com/recipes/collection/healthy-recipes';
type Extra=readonly [string,number,number];
function additions(name:string,category:Category,diets:Diet[]):Extra[]{
 const x:Extra[]=[];
 if(category===Z||/chili|gulasz|curry|dal|ratatouille|risotto|ramen/i.test(name))x.push(['Domowy bulion warzywny bez selera i glutenu',900,5]);
 if(/focaccia/i.test(name))x.push(['Ciepła woda',320,0],['Drożdże instant',7,325]);
 if(/hummus/i.test(name))x.push(['Tahini',80,595],['Sok z cytryny',40,22]);
 if(/teriyaki/i.test(name))x.push(['Tamari bezglutenowe',60,60]);
 if(/tabbouleh/i.test(name))x.push(['Natka i mięta',100,40],['Sok z cytryny',50,22]);
 if(/tikka|curry|dal|kokosow/i.test(name))x.push(['Mleko kokosowe',250,180]);
 if(/satay/i.test(name))x.push(['Masło orzechowe',80,600]);
 if(/caprese/i.test(name)&&!x.some(i=>/mozzarella/i.test(i[0])))x.push(['Mozzarella',250,250]);
 if(/pesto/i.test(name))x.push(['Pesto bazyliowe',80,400]);
 if(/tzatziki/i.test(name))x.push(['Ogórek',250,15],['Jogurt grecki',250,97]);
 if(/tahini/i.test(name))x.push(['Tahini',90,595],['Sok z cytryny',40,22]);
 if(/miso/i.test(name))x.push(['Pasta miso',70,199]);
 if(/pad thai/i.test(name))x.push(['Tamari bezglutenowe',50,60],['Masło orzechowe',60,600]);
 if(/brownie/i.test(name))x.push(diets.includes(G)?['Banan',250,89]:['Jajka',165,143],['Kakao',60,228]);
 if(/ciasto migdałowo/i.test(name))x.push(['Jajka',220,143]);
 if(/gofry/i.test(name))x.push(['Jajka',165,143],['Mleko',250,50]);
 if(/z jajkiem/i.test(name))x.push(['Jajka',220,143]);
 if(/cytryn/i.test(name))x.push(['Sok i skórka z cytryny',60,22]);
 if(/oliwk/i.test(name))x.push(['Oliwki bez pestek',120,116]);
 if(/czosnk/i.test(name))x.push(['Czosnek',15,149]);
 if(/sezam/i.test(name))x.push(['Sezam',35,573]);
 if(/buffalo/i.test(name))x.push(['Domowy sos z ostrej papryki i octu',100,30]);
 if(/nicejsk/i.test(name))x.push(['Jajka',220,143],['Oliwki bez pestek',120,116]);
 if(/koper/i.test(name))x.push(['Koperek',30,43]);
 if(/pierogi|kopytka|kluski/i.test(name))x.push(['Mąka bezglutenowa',220,350]);
 return x;
}
function allergenList(items:NutritionIngredient[]):string[]{const names=items.map(i=>i.n.toLowerCase()),s=names.join(' '),out:string[]=[];
 if(names.some(n=>!n.includes('kokos')&&/mlek|jogurt|skyr|twar|ser|feta|halloumi|mozzarella|ricotta|mascarpone|pesto/.test(n)))out.push('mleko');
 if(/jaj/.test(s))out.push('jaja'); if(/tofu|tempeh|soj|edamame|tamari|miso/.test(s))out.push('soja');
 if(/tahini|sezam/.test(s))out.push('sezam'); if(/migdał|orzech|pesto/.test(s))out.push('orzechy');
 if(/panko|mąka pszenna|focaccia|ramen|kuskus|orzo/.test(s))out.push('gluten');
 if(/masło orzechowe/.test(s))out.push('orzeszki ziemne'); if(/dorsz|łoso|pstrąg|dorad|tuńczyk/.test(s))out.push('ryby'); if(/krewet/.test(s))out.push('skorupiaki'); return out;}
function make(seed:Seed,index:number):CookbookRecipe{
 const [name,cuisine,category,diets,device,mainName,mainG,mainKcal,sideName,sideG,sideKcal,minutes]=seed;
 const [main,side]=[[mainName,mainG,mainKcal],[sideName,sideG,sideKcal]] as const;
 const oil:readonly [string,number,number]=['Oliwa lub olej',20,884];
 const nutrition:NutritionIngredient[]=[{n:main[0],grams:main[1],kcal100:main[2]},{n:side[0],grams:side[1],kcal100:side[2]},...additions(name,category,diets).map(([n,grams,kcal100])=>({n,grams,kcal100})),{n:oil[0],grams:oil[1],kcal100:oil[2]},{n:'Zioła i przyprawy',grams:8,kcal100:50}];
 const lane:Lane=device==='Air Fryer'?'fryer':device==='Thermomix'?'blender':'stove';
 const temp=device==='Air Fryer'?' Ustaw ręcznie 185 °C i ułóż jedną warstwą.':'';
 const egg=/jaj|omlet|frittata|shakshuka|quiche|serniczki/i.test(nutrition.map(i=>i.n).join(' ')+name);
 const baseSafety=/kurcz|indyk/i.test(mainName)?'Drób jest gotowy po osiągnięciu minimum 75 °C w najgrubszym miejscu.':/woł|wieprz/i.test(mainName)?'Mięso mielone doprowadź do minimum 71 °C; cały kawałek do 63 °C i odstaw na 3 min.':/dorsz|łoso|pstrąg|dorad|krewet/i.test(mainName)?'Ryba: minimum 63 °C w najgrubszym miejscu; krewetki mają być nieprzezroczyste.':'';
 const eggSafety=egg?' Danie z jaj jest gotowe przy minimum 71 °C w środku; masa musi być całkowicie ścięta.':'';
 const safety=(baseSafety+eggSafety).trim()||undefined;
 const dry=/such|mąka|płatki|chia|kakao|drożdże/i.test(mainName+' '+sideName);
 const grain=/komosa|kuskus|ryż|makaron|kasza|orzo/i.test(sideName);
 const liquid=nutrition.some(i=>/mleko kokosowe|bulion|woda/i.test(i.n));
 const cold=/sałatka|twarożek|skyr|koreczki|gazpacho|hummus|pasta z/i.test(name);
 const focaccia=/focaccia/i.test(name);
 const baked=/gofry|brownie|ciasto migdałowo/i.test(name), chia=/pudding chia/i.test(name), balls=/kulki mocy/i.test(name), sorbet=/sorbet/i.test(name);
 const method=category===N||sorbet?'Zmiksuj wszystkie składniki do jednolitej konsystencji i podaj od razu.':category===Z?`Dodaj płyn z listy. Gotuj do pełnej miękkości${device==='Thermomix'?', następnie miksuj stopniowo zgodnie z instrukcją urządzenia':''}.`:cold?'Połącz przygotowane składniki na zimno. Składniki wymagające obróbki ugotuj lub upiecz osobno i ostudź.':device==='Air Fryer'?`${temp} ${liquid?'Użyj żaroodpornego naczynia pasującego do kosza; nie wlewaj płynu bezpośrednio do kosza.':'Piecz jedną warstwą, obracając w połowie.'} Większą ilość przygotuj partiami.`:`Gotuj lub smaż na średnim ogniu do miękkości, regularnie mieszając.${device==='Thermomix'?' Ustawienia czasu, temperatury i obrotów dobierz ręcznie według instrukcji TM6.':''}`;
 const tasks= focaccia ? [
  {id:'s1',title:'Zagnieć ciasto',detail:'W Thermomixie lub ręcznie połącz mąkę, ciepłą wodę, drożdże, połowę oliwy i sól. Zagnieć elastyczne ciasto.',lane:'hands' as Lane,min:15,after:[]},
  {id:'s2',title:'Pozostaw do wyrośnięcia',detail:'Przykryj i odstaw w ciepłym miejscu, aż wyraźnie zwiększy objętość.',lane:'wait' as Lane,min:60,after:['s1'],timer:{name:'Wyrastanie focaccii'}},
  {id:'s3',title:'Uformuj i upiecz',detail:'Przełóż do natłuszczonej formy, dodaj pomidorki. Piecz w piekarniku 210 °C przez 20–25 min do rumianego spodu.',lane:'oven' as Lane,min:25,after:['s2'],timer:{name:'Focaccia w piekarniku'}},
 ] : baked ? [
  {id:'s1',title:'Przygotuj masę',detail:'W Thermomixie wymieszaj składniki tylko do połączenia.',lane:'blender' as Lane,min:8,after:[],timer:{name:'Przygotowanie masy'}},
  {id:'s2',title:/gofry/i.test(name)?'Upiecz gofry':'Upiecz w formie',detail:/gofry/i.test(name)?'Rozgrzej gofrownicę i piecz porcjami zgodnie z instrukcją urządzenia, aż środek będzie upieczony.':'Przelej do wyłożonej formy. Piecz w piekarniku 180 °C około 25–32 min; patyczek nie może być oblepiony surową masą.',lane:/gofry/i.test(name)?'hands' as Lane:'oven' as Lane,min:30,after:['s1'],timer:{name},...(safety?{safety}:{})},
  {id:'s3',title:'Przestudź i podziel',detail:'Odstaw na 10 min, następnie podziel na 4 porcje.',lane:'wait' as Lane,min:10,after:['s2'],timer:{name:'Studzenie'}},
 ] : chia ? [
  {id:'s1',title:'Wymieszaj pudding',detail:'W Thermomixie krótko wymieszaj chia z płynnymi składnikami. Przelej do czterech naczyń.',lane:'blender' as Lane,min:5,after:[],timer:{name:'Mieszanie puddingu'}},
  {id:'s2',title:'Schłodź do zgęstnienia',detail:'Wstaw pod przykryciem do lodówki na minimum 4 godziny; po 15 min ponownie zamieszaj.',lane:'wait' as Lane,min:240,after:['s1'],timer:{name:'Chłodzenie puddingu chia'}},
  {id:'s3',title:'Dodaj owoce',detail:'Dodaj umyte owoce i podaj schłodzone.',lane:'hands' as Lane,min:3,after:['s2']},
 ] : balls ? [
  {id:'s1',title:'Rozdrobnij masę',detail:'W Thermomixie rozdrobnij składniki pulsacyjnie na lepką, plastyczną masę; nie podgrzewaj.',lane:'blender' as Lane,min:5,after:[],timer:{name:'Rozdrabnianie masy'}},
  {id:'s2',title:'Uformuj kulki',detail:'Wilgotnymi dłońmi uformuj 16 równych kulek.',lane:'hands' as Lane,min:10,after:['s1']},
  {id:'s3',title:'Schłodź',detail:'Wstaw do lodówki na 30 min. Porcja to 4 kulki.',lane:'wait' as Lane,min:30,after:['s2'],timer:{name:'Chłodzenie kulek mocy'}},
 ] : [
  {id:'s1',title:'Przygotuj składniki',detail:grain?`Ugotuj ${sideName.toLowerCase()} w wodzie zgodnie z opakowaniem i odcedź. Pozostałe produkty przygotuj osobno.`:dry?`Odmierz ${mainName.toLowerCase()} i ${sideName.toLowerCase()}. Przygotuj pozostałe składniki zgodnie z listą.`:`Pokrój ${mainName.toLowerCase()} i ${sideName.toLowerCase()} na równe kawałki. Po kontakcie z surowym mięsem umyj ręce, deskę i nóż.`,lane:'hands' as Lane,min:grain?20:8,after:[],...(grain?{resources:['stove' as Lane]}:{})},
  {id:'s2',title:category===N||sorbet?'Zmiksuj bez podgrzewania':device==='Air Fryer'?'Upiecz':cold?'Połącz składniki':'Ugotuj danie',detail:method,lane,min:minutes,after:['s1'],...(device==='Air Fryer'?{fryer:{mode:'AIR FRY',temp:185}}:{}),timer:{name,marks:[0.5],act:'Wymieszaj, obróć lub sprawdź konsystencję'},...(safety?{safety}:{})},
  {id:'s3',title:'Sprawdź, dopraw i podaj',detail:`${safety||'Sprawdź miękkość i konsystencję.'} Podziel równo na 4 porcje.`,lane:'hands' as Lane,min:3,after:['s2']}
 ];
 return {id:`book-${String(index+100).padStart(3,'0')}`,name,short:name,servings:4,
  note:'Ilości dotyczą całego przepisu. Czasy i kcal są orientacyjne i obejmują wszystkie składniki z listy. Wersja redakcyjna HomeCraft, nieprzetestowana w kuchni.',
  ingredients:nutrition.map((x,i)=>({id:`i${i}`,n:x.n,q:`${x.grams} g`})),
  equipment:[{id:'e0',n:focaccia?'Thermomix TM6 lub miska, piekarnik i forma':baked?`Thermomix TM6, ${/gofry/i.test(name)?'gofrownica':'piekarnik i forma'}`:device==='Air Fryer'?`Air Fryer${grain?', garnek i kuchenka':''}${liquid?' oraz żaroodporne naczynie':''}${safety?' i termometr kuchenny':''}`:device==='Thermomix'?`Thermomix TM6, naczynie i kopystka${safety?' oraz termometr kuchenny':''}`:`Osobne deski do mięsa i warzyw, nóż, miska i patelnia${safety?' oraz termometr kuchenny':''}`}],
  prep:[{id:'p0',n:'Umyj ręce, warzywa i owoce; nie myj surowego mięsa ani ryb. Odmierz składniki i sprawdź alergeny na etykietach.'}],
  tasks,
  book:{cuisine,category,diets,devices:[device],nutrition,allergens:allergenList(nutrition),sources:[source],tested:false}};
}
export const EXTRA_COOKBOOK_RECIPES:CookbookRecipe[]=seeds.slice(0,100).map(make);
