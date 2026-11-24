// Original, untested HomeCraft adaptations. Each family has five distinct ingredient variants.
// Quantities are for the entire recipe. kcal/100 g are approximate reference values.
import { recipe } from './cookbook-recipes.ts';
import type { CookbookRecipe, Cuisine, Category, Diet } from './cookbook-recipes.ts';
type I=[string,number,number];
type V=[string,I[],string];
type Family={cuisine:Cuisine,category:Category,base:I[],variants:V[],method:string,minutes:number,servings?:number,oven?:boolean,rest?:number,proof?:number,secondProof?:number,diets?:Diet[]};
const i=(n:string,g:number,k:number):I=>[n,g,k];
const oil=i('Oliwa lub olej',20,884), salt=i('Sól',3,0), onion=i('Cebula',100,40), garlic=i('Czosnek',10,149), water=(g:number)=>i('Woda',g,0);
const flour=(g:number)=>i('Mąka pszenna',g,364), eggs=(g:number)=>i('Jajka',g,143), butter=(g:number)=>i('Masło',g,717), milk=(g:number)=>i('Mleko',g,50), sugar=(g:number)=>i('Cukier',g,400), yeast=i('Drożdże instant',7,325);
const rice=i('Ryż suchy',240,360), tomato=i('Pomidory krojone',400,24), beans=i('Fasola ugotowana',400,127), chick=i('Ciecierzyca ugotowana',400,164), tofu=i('Tofu naturalne',400,130), chicken=i('Pierś z kurczaka',400,120), beef=i('Wołowina mielona',400,200), fish=i('Filet z łososia',400,208);
const veg=(n:string,g=300,k=30)=>i(n,g,k), spice=(n:string,g=8)=>i(n,g,250);
const f=(cuisine:Cuisine,base:I[],method:string,minutes:number,variants:V[],category:Category='Obiady',extra:Partial<Family>={}):Family=>({cuisine,category,base,method,minutes,variants,...extra});
const families:Family[]=[
 f('Włoska',[i('Ryż arborio',280,360),onion,oil,i('Bulion warzywny',850,5),i('Parmezan',60,431)],'Zeszklij cebulę na oliwie, wsyp ryż. Dodawaj gorący bulion po chochli i mieszaj do konsystencji al dente. Na końcu wmieszaj parmezan.',25,[
 ['Risotto z borowikami',[veg('Borowiki',350,34)],'Grzyby podsmaż przed dodaniem ryżu.'],
 ['Risotto ze szparagami',[veg('Szparagi',400,20)],'Pokrojone szparagi dodaj na ostatnie 8 min.'],
 ['Risotto z dynią i szałwią',[veg('Dynia',450,26),spice('Szałwia',3)],'Dynię pokrój drobno, podsmaż z cebulą i szałwią.'],
 ['Risotto z cukinią i miętą',[veg('Cukinia',400,17),spice('Mięta',4)],'Cukinię dodaj na ostatnie 7 min, miętę na końcu.'],
 ['Risotto z burakiem i kozim serem',[veg('Buraki gotowane',300,44),i('Ser kozi',100,290)],'Buraki zetrzyj i dodaj pod koniec, posyp kozim serem.']]),
 f('Włoska',[i('Makaron suchy',320,350),oil,garlic,tomato], 'Ugotuj makaron al dente według opakowania. Na patelni rozgrzej oliwę, czosnek i pomidory; zredukuj sos, połącz z odcedzonym makaronem.',22,[
 ['Penne alla norma',[veg('Bakłażan',450,25),i('Ricotta',100,174)],'Bakłażan pokrój w kostkę i zrumień przed dodaniem pomidorów. Ricottę dodaj na końcu.'],
 ['Spaghetti arrabbiata',[spice('Płatki chili',3),spice('Pietruszka',10)],'Chili podsmaż krótko z czosnkiem, pietruszkę dodaj na końcu.'],
 ['Pasta puttanesca',[i('Oliwki',100,116),i('Kapary',30,23),i('Anchois',40,210)],'Rozpuść anchois w oliwie, następnie dodaj kapary i oliwki.'],
 ['Penne z kiełbasą i koprem włoskim',[i('Kiełbasa świeża',300,290),veg('Fenkuł',300,31)],'Kiełbasę rozdrobnij, usmaż na wskroś, dodaj cienko pokrojony fenkuł.'],
 ['Spaghetti z soczewicą i rozmarynem',[i('Soczewica ugotowana',350,116),spice('Rozmaryn',3)],'Soczewicę i rozmaryn gotuj w sosie 10 min.']]),
 f('Włoska',[i('Gnocchi ziemniaczane',700,160),tomato,garlic,oil,i('Mozzarella',180,250)],'Gnocchi ugotuj według opakowania, odcedź. Wymieszaj z pomidorami, czosnkiem, oliwą i dodatkami, przełóż do formy i posyp mozzarellą. Zapiekaj w 200 °C do zrumienienia.',22,[
 ['Gnocchi alla sorrentina',[spice('Bazylia',10)],'Bazylię dodaj do sosu i na gotowe danie.'],
 ['Gnocchi zapiekane z pieczarkami',[veg('Pieczarki',350,22)],'Pieczarki podsmaż osobno, aż odparują.'],
 ['Gnocchi zapiekane ze szpinakiem',[veg('Szpinak',300,23)],'Szpinak podduś i odciśnij przed dodaniem.'],
 ['Gnocchi zapiekane z brokułem',[veg('Brokuł',350,34)],'Brokuł podgotuj 4 min przed zapiekaniem.'],
 ['Gnocchi zapiekane z oliwkami',[i('Oliwki',120,116)],'Oliwki przekrój na pół i wymieszaj z sosem.']], 'Obiady',{oven:true}),
 f('Francuska',[i('Ciasto kruche gotowe',250,400),eggs(165),i('Śmietanka 18%',200,190),i('Gruyère',100,413)],'Wyłóż formę 24 cm ciastem, nakłuj i podpiecz 12 min w 190 °C pod obciążeniem. Roztrzep jajka ze śmietanką i serem. Dodaj przygotowany farsz, wlej do spodu i piecz w 180 °C aż masa będzie całkowicie ścięta.',40,[
 ['Quiche lorraine',[i('Boczek',150,400)],'Boczek podsmaż, odsącz tłuszcz.'],
 ['Quiche ze szparagami',[veg('Szparagi',350,20)],'Szparagi podgotuj 3 min, odsącz.'],
 ['Quiche z porem i tymiankiem',[veg('Por',350,61),spice('Tymianek',3)],'Por podduś na małym ogniu z tymiankiem.'],
 ['Quiche z brokułem i serem pleśniowym',[veg('Brokuł',350,34),i('Ser pleśniowy',80,350)],'Brokuł podgotuj i osusz, ser pokrusz.'],
 ['Quiche z pieczarkami i cebulą',[veg('Pieczarki',350,22),onion], 'Pieczarki i cebulę podsmaż do odparowania.']], 'Obiady',{oven:true,servings:6}),
 f('Francuska',[veg('Ziemniaki',700,77),i('Śmietanka 18%',250,190),garlic,i('Ser gruyère',100,413)],'Ziemniaki pokrój w cienkie plastry, przełóż do formy z czosnkiem i dodatkami. Zalej śmietanką, przykryj i piecz 35 min w 180 °C; odkryj, posyp serem i dopiekaj do miękkości.',55,[
 ['Gratin dauphinois',[spice('Gałka muszkatołowa',2)],'Dopraw śmietankę gałką.'],
 ['Gratin z ziemniaków i selera',[veg('Seler korzeniowy',300,42)],'Seler pokrój w cienkie plastry.'],
 ['Gratin ziemniaczany z porem',[veg('Por',300,61)],'Por pokrój, podduś i rozłóż między warstwami.'],
 ['Gratin ziemniaczany z kalafiorem',[veg('Kalafior',400,25)],'Kalafior podgotuj 5 min, odsącz.'],
 ['Gratin ziemniaczany z pieczarkami',[veg('Pieczarki',350,22)],'Pieczarki podsmaż do odparowania przed pieczeniem.']], 'Obiady',{oven:true}),
 f('Meksykańska',[i('Tortille kukurydziane',240,220),tomato,oil,onion,i('Limonka',60,30),spice('Kumin i chili')],'Podsmaż cebulę i przyprawy, dodaj farsz zgodnie z wariantem. Pomidory posiekaj, skrop limonką. Tortille podgrzej na suchej patelni, napełnij farszem i świeżą salsą.',20,[
 ['Tacos al pastor — domowe',[i('Schab wieprzowy',400,143),veg('Ananas',200,50)],'Schab pokrój cienko, usmaż do 63 °C i odstaw 3 min; dodaj ananas.'],
 ['Tacos z czarną fasolą',[i('Czarna fasola ugotowana',450,132)],'Fasolę rozgnieć częściowo i podgrzej.'],
 ['Tacos z kurczakiem i papryką',[chicken,veg('Papryka',250,31)],'Kurczaka pokrój, usmaż do 75 °C, dodaj paprykę.'],
 ['Tacos rybne z kapustą',[i('Dorsz',400,82),veg('Kapusta',250,25)],'Dorsza usmaż do 63 °C, kapustę poszatkuj na surówkę.'],
 ['Tacos z batatem i awokado',[veg('Batat',450,86),i('Awokado',160,160)],'Batat pokrój w małą kostkę, podsmaż i duś pod przykryciem do miękkości. Awokado dodaj na zimno.']]),
 f('Meksykańska',[i('Tortille pszenne',320,310),tomato,i('Ser cheddar',150,400),onion,oil,spice('Papryka i kumin')],'Podsmaż cebulę i przygotuj farsz. Podgrzej pomidory z przyprawami. Napełnij tortille farszem, zwiń, ułóż w formie, zalej sosem i posyp serem. Piecz w 190 °C do zrumienienia.',25,[
 ['Enchiladas z kurczakiem',[chicken],'Kurczaka usmaż do 75 °C, rozdrobnij.'],
 ['Enchiladas z czarną fasolą',[i('Czarna fasola ugotowana',400,132)],'Fasolę podgrzej i częściowo rozgnieć.'],
 ['Enchiladas z wołowiną',[beef],'Wołowinę usmaż na wskroś do 71 °C.'],
 ['Enchiladas z dynią',[veg('Dynia',450,26)],'Dynię pokrój i podduś do miękkości.'],
 ['Enchiladas z pieczarkami',[veg('Pieczarki',450,22)],'Pieczarki podsmaż do odparowania.']], 'Obiady',{oven:true}),
 f('Japońska',[rice,i('Sos sojowy',50,60),i('Mirin',35,180),i('Imbir',15,80),oil,veg('Szczypiorek',20,30)],'Ugotuj ryż według opakowania. Na patelni przygotuj dodatek, wlej sos sojowy z mirinem i imbirem, zredukuj. Rozłóż na ryżu i posyp szczypiorkiem.',25,[
 ['Donburi z łososiem',[fish],'Łososia smaż do 63 °C, polej sosem.'],
 ['Donburi z tofu i shiitake',[tofu,veg('Shiitake',150,34)],'Tofu osusz, zrumień z grzybami.'],
 ['Donburi z wołowiną i cebulą',[i('Wołowina w cienkich plastrach',400,180),onion],'Cebulę podduś, wołowinę usmaż do pełnej gotowości.'],
 ['Donburi z kurczakiem i jajkiem',[chicken,eggs(165)],'Kurczaka doprowadź do 75 °C; jajka dodaj pod koniec, zetnij do 71 °C.'],
 ['Donburi z bakłażanem miso',[veg('Bakłażan',500,25),i('Pasta miso',45,199)],'Bakłażan duś do miękkości, rozprowadź miso w sosie.']]),
 f('Japońska',[i('Makaron soba suchy',300,350),veg('Kapusta',250,25),veg('Marchew',150,41),i('Sos sojowy',50,60),oil,i('Imbir',15,80)],'Ugotuj makaron według opakowania, odcedź. Pokrój warzywa w paski, smaż na dużym ogniu z przygotowanym dodatkiem. Dodaj makaron, sos i imbir, wymieszaj.',20,[
 ['Yakisoba z kurczakiem',[chicken],'Kurczaka usmaż osobno do 75 °C.'],
 ['Yakisoba z tofu',[tofu],'Tofu osusz i zrumień.'],
 ['Yakisoba z wieprzowiną',[i('Schab',400,143)],'Schab pokrój w cienkie paski, usmaż do pełnej gotowości.'],
 ['Yakisoba z krewetkami',[i('Krewetki obrane',350,99)],'Krewetki smaż, aż będą nieprzezroczyste w całym przekroju.'],
 ['Yakisoba z grzybami',[veg('Shiitake',350,34)],'Grzyby zrumień przed dodaniem warzyw.']]),
 f('Tajska',[i('Mleko kokosowe',400,180),i('Pasta curry tajska',40,140),rice,oil,i('Limonka',60,30),veg('Fasolka szparagowa',250,31)],'Ugotuj ryż. Rozgrzej olej, krótko podsmaż pastę curry, dodaj mleko kokosowe, fasolkę i dodatek. Duś do gotowości, dopraw limonką i podaj z ryżem.',25,[
 ['Tajskie czerwone curry z kaczką',[i('Pierś z kaczki',400,200)],'Kaczkę pokrój, doprowadź do 75 °C. Użyj czerwonej pasty.'],
 ['Tajskie zielone curry z kurczakiem',[chicken],'Kurczaka gotuj do 75 °C. Użyj zielonej pasty.'],
 ['Tajskie żółte curry z tofu',[tofu],'Tofu pokrój w kostkę, użyj żółtej pasty.'],
 ['Tajskie curry panang z wołowiną',[i('Wołowina w paskach',400,180)],'Użyj pasty panang, wołowinę dokładnie ugotuj.'],
 ['Tajskie curry z dynią i ciecierzycą',[veg('Dynia',350,26),chick],'Dynię gotuj do miękkości, potem dodaj ciecierzycę.']]),
 f('Tajska',[i('Makaron ryżowy suchy',280,360),veg('Kiełki fasoli mung',200,30),i('Tamaryndowiec pasta',35,240),i('Sos rybny',35,35),sugar(15),i('Orzeszki ziemne',50,567),oil], 'Namocz lub ugotuj makaron zgodnie z opakowaniem. Podsmaż przygotowany dodatek, dodaj makaron i sos z tamaryndowca, sosu rybnego i cukru. Kiełki dobrze podgrzej, posyp orzeszkami.',18,[
 ['Pad thai z kurczakiem',[chicken],'Kurczaka usmaż do 75 °C przed dodaniem makaronu.'],
 ['Pad thai z tofu i jajkiem',[tofu,eggs(110)],'Tofu zrumień, jajka zetnij do 71 °C.'],
 ['Pad thai z krewetkami i limonką',[i('Krewetki obrane',350,99),i('Limonka',60,30)],'Krewetki usmaż do nieprzezroczystości, limonkę wyciśnij na końcu.'],
 ['Pad thai z wieprzowiną',[i('Schab',350,143)],'Cienkie paski schabu usmaż do pełnej gotowości.'],
 ['Pad thai z brokułem i jajkiem',[veg('Brokuł',350,34),eggs(165)],'Brokuł podgotuj, jajka zetnij do 71 °C.']]),
 f('Indyjska',[rice,tomato,onion,garlic,oil,spice('Garam masala'),spice('Kurkuma',4),i('Jogurt naturalny',180,60)],'Ugotuj ryż. Zeszklij cebulę, dodaj czosnek i przyprawy, pomidory oraz dodatek. Duś do gotowości, zdejmij z ognia i wmieszaj jogurt.',30,[
 ['Kurczak tikka masala',[chicken],'Kurczaka pokrój, wcześniej zamarynuj w części jogurtu i przypraw. Smaż do 75 °C.'],
 ['Paneer masala',[i('Paneer',400,265)],'Paneer pokrój, zrumień i dodaj na ostatnie 5 min.'],
 ['Chana masala z jogurtem',[chick],'Ciecierzycę duś w sosie przez 15 min.'],
 ['Aloo gobi masala',[veg('Ziemniaki',300,77),veg('Kalafior',350,25)],'Ziemniaki pokrój drobno, kalafior dodaj po 10 min.'],
 ['Kofta masala z indykiem',[i('Mięso mielone z indyka',400,150)],'Uformuj małe kulki, duś do 75 °C w środku.']]),
 f('Indyjska',[rice,onion,oil,garlic,spice('Kumin, kardamon i cynamon'),i('Bulion warzywny',500,5)],'Ryż przepłucz. Podsmaż cebulę i przyprawy, przygotuj dodatek. Wsyp ryż, zalej bulionem, przykryj i gotuj na małym ogniu, aż ryż wchłonie płyn. Odstaw na 5 min.',32,[
 ['Biryani z kurczakiem',[chicken],'Kurczaka zrumień przed ryżem, sprawdź 75 °C.'],
 ['Biryani z jagnięciną',[i('Jagnięcina bez kości',400,200)],'Mięso drobno pokrój i podduś wcześniej do miękkości.'],
 ['Biryani z warzywami',[veg('Marchew',200,41),veg('Groszek',200,81),veg('Kalafior',200,25)],'Warzywa dodaj po podsmażeniu cebuli.'],
 ['Biryani z grzybami',[veg('Pieczarki',400,22)],'Grzyby podsmaż do odparowania.'],
 ['Biryani z ciecierzycą i rodzynkami',[chick,i('Rodzynki',50,299)],'Ciecierzycę i rodzynki dodaj razem z ryżem.']]),
 f('Grecka',[i('Chleb pita',300,260),i('Jogurt grecki',200,97),veg('Ogórek',200,15),veg('Pomidory',250,18),i('Cytryna',60,29),oil,spice('Oregano',4)],'Z jogurtu i startego odciśniętego ogórka przygotuj tzatziki. Dodatek zamarynuj w oliwie, cytrynie i oregano, usmaż na patelni grillowej. Podaj w podgrzanej picie z pomidorami.',20,[
 ['Souvlaki z wieprzowiną',[i('Polędwiczka wieprzowa',400,143)],'Mięso pokrój w kostkę, grilluj do 63 °C i odstaw 3 min.'],
 ['Souvlaki z indykiem',[i('Pierś z indyka',400,110)],'Indyka grilluj do 75 °C.'],
 ['Pita grecka z halloumi',[i('Halloumi',300,321)],'Halloumi pokrój w plastry i zrumień.'],
 ['Pita grecka z pieczonym bakłażanem',[veg('Bakłażan',500,25)],'Bakłażan pokrój w cienkie plastry, grilluj do miękkości.'],
 ['Pita grecka z krewetkami',[i('Krewetki obrane',350,99)],'Krewetki grilluj do pełnej nieprzezroczystości.']]),
 f('Grecka',[veg('Bakłażan',500,25),veg('Ziemniaki',400,77),tomato,onion,oil,i('Sos beszamelowy',300,120),i('Ser feta',100,265)],'Bakłażan i ziemniaki pokrój w plastry, podpiecz do miękkości w 200 °C. Podsmaż cebulę i dodatek, dodaj pomidory, zredukuj. Układaj warstwami w formie, polej beszamelem, posyp fetą. Piecz 35 min w 180 °C.',60,[
 ['Musaka z jagnięciną',[i('Mięso mielone jagnięce',400,250)],'Mięso dokładnie usmaż do 71 °C przed ułożeniem warstw.'],
 ['Musaka z wołowiną',[beef],'Wołowinę usmaż do 71 °C.'],
 ['Musaka z soczewicą',[i('Soczewica ugotowana',400,116)],'Soczewicę duś z pomidorami.'],
 ['Musaka z pieczarkami',[veg('Pieczarki',450,22)],'Pieczarki podsmaż do odparowania.'],
 ['Musaka z ciecierzycą',[chick],'Ciecierzycę częściowo rozgnieć w sosie.']], 'Obiady',{oven:true}),
 f('Koreańska',[rice,veg('Marchew',150,41),veg('Szpinak',200,23),veg('Cukinia',200,17),i('Gochujang',45,220),i('Olej sezamowy',20,884)],'Ugotuj ryż. Warzywa pokrój w paski i podsmaż kolejno na patelni. Przygotuj dodatek, rozłóż wszystkie składniki osobno na ryżu, dopraw gochujang i olejem sezamowym.',25,[
 ['Bibimbap z wołowiną',[beef],'Wołowinę usmaż do 71 °C.'],
 ['Bibimbap z tofu',[tofu],'Tofu osusz i zrumień.'],
 ['Bibimbap z kurczakiem',[chicken],'Kurczaka usmaż do 75 °C.'],
 ['Bibimbap z jajkiem i grzybami',[eggs(220),veg('Shiitake',200,34)],'Grzyby zrumień, jajka usmaż do pełnego ścięcia.'],
 ['Bibimbap z łososiem',[fish],'Łososia usmaż do 63 °C.']]),
 f('Koreańska',[i('Makaron ze skrobi batatowej',280,350),veg('Marchew',200,41),veg('Szpinak',150,23),onion,i('Sos sojowy',50,60),i('Olej sezamowy',20,884),sugar(10)],'Ugotuj makaron według opakowania. Podsmaż cebulę i warzywa w paskach, przygotuj dodatek. Połącz na patelni z makaronem, sosem sojowym, cukrem i olejem sezamowym.',20,[
 ['Japchae z wołowiną',[i('Wołowina w paskach',350,180)],'Wołowinę usmaż do pełnej gotowości.'],
 ['Japchae z tofu',[tofu],'Tofu osusz i zrumień.'],
 ['Japchae z kurczakiem',[chicken],'Kurczaka usmaż do 75 °C.'],
 ['Japchae z boczniakami',[veg('Boczniaki',350,33)],'Boczniaki podsmaż do miękkości.'],
 ['Japchae z krewetkami',[i('Krewetki obrane',350,99)],'Krewetki doprowadź do pełnej nieprzezroczystości.']]),
 f('Turecka',[onion,garlic,oil,spice('Kumin i papryka'),i('Bulgur suchy',240,342),veg('Pomidory',300,18)],'Ugotuj bulgur według opakowania. Dodatek połącz z cebulą i przyprawami zgodnie z wariantem, uformuj małe kotleciki i usmaż na oleju. Podaj z bulgurem i pomidorami.',25,[
 ['Köfte jagnięce',[i('Mięso mielone jagnięce',500,250)],'Kotleciki doprowadź do 71 °C w środku.'],
 ['Köfte wołowe',[beef],'Kotleciki doprowadź do 71 °C.'],
 ['Köfte z indyka',[i('Mięso mielone z indyka',450,150)],'Kotleciki doprowadź do 75 °C.'],
 ['Köfte z soczewicy',[i('Soczewica ugotowana',450,116),i('Bułka tarta',60,350)],'Rozgnieć soczewicę, dodaj bułkę tartą i formuj zwarte kotleciki.'],
 ['Köfte z ciecierzycy',[chick,i('Mąka z ciecierzycy',60,387)],'Rozgnieć ciecierzycę i wymieszaj z mąką przed formowaniem.']]),
 f('Hiszpańska',[i('Ryż do paelli',300,360),tomato,veg('Papryka',250,31),onion,oil,i('Bulion',800,10),spice('Szafran i papryka',3)],'Na szerokiej patelni podsmaż cebulę, paprykę i pomidory. Dodaj ryż, przyprawy, gorący bulion i dodatek. Gotuj bez mieszania do wchłonięcia płynu, odstaw 5 min.',35,[
 ['Paella z kurczakiem',[chicken],'Kurczaka zrumień na początku, sprawdź 75 °C przed podaniem.'],
 ['Paella z owocami morza',[i('Krewetki obrane',300,99),i('Kalmar',200,92)],'Owoce morza dodaj pod koniec, gotuj do pełnej gotowości.'],
 ['Paella warzywna',[veg('Groszek',200,81),veg('Karczochy',200,47)],'Warzywa dodaj w połowie gotowania.'],
 ['Paella z dorszem',[i('Dorsz',400,82)],'Dorsza dodaj na ostatnie 10 min, doprowadź do 63 °C.'],
 ['Paella z pieczarkami',[veg('Pieczarki',400,22)],'Grzyby zrumień przed dodaniem ryżu.']]),
 f('Amerykańska',[i('Bułki burgerowe',280,270),veg('Sałata',80,15),veg('Pomidory',200,18),veg('Ogórek kiszony',100,12),i('Musztarda',30,66),oil],'Uformuj lub przygotuj kotlet zgodnie z wariantem. Usmaż na patelni, podgrzej bułki, posmaruj musztardą i ułóż sałatę, pomidory, ogórki oraz gorący kotlet.',20,[
 ['Klasyczny cheeseburger',[beef,i('Cheddar',80,400)],'Wołowinę usmaż do 71 °C, na końcu stop ser na kotlecie.'],
 ['Burger z indyka',[i('Mięso mielone z indyka',400,150)],'Kotlet doprowadź do 75 °C w środku.'],
 ['Burger z czarnej fasoli',[i('Czarna fasola ugotowana',450,132),i('Płatki owsiane',70,370)],'Rozgnieć fasolę, wymieszaj z płatkami i uformuj kotlety.'],
 ['Burger z portobello',[veg('Pieczarki portobello',500,22)],'Kapelusze grilluj do miękkości, użyj w całości.'],
 ['Burger z kurczakiem i awokado',[chicken,i('Awokado',160,160)],'Kurczaka rozbij na cienkie filety, usmaż do 75 °C. Dodaj plastry awokado.']]),
];
function allergens(items:I[]):string[]{
 const s=items.map(x=>x[0].toLowerCase()).join(' '), out:string[]=[];
 for(const [label,pattern] of [['gluten',/pszenn|makaron (suchy|soba)|gnocchi|pita|bułk|bulgur|ciasto kruche|beszamel|żytn|owsian|orkisz/],['mleko',/mleko(?! kokosowe)|jogurt|ser |feta|parmezan|mozzarella|ricotta|masło|śmietank|gruyère|cheddar|paneer|halloumi|beszamel/],['jaja',/jaj/],['soja',/tofu|sojow|miso|gochujang/],['sezam',/sezam/],['ryby',/łosoś|dorsz|anchois|sos rybny/],['skorupiaki',/krewet/],['mięczaki',/kalmar/],['orzechy',/migdał|orzechy|pistacj/],['orzeszki ziemne',/orzeszki ziemne/],['gorczyca',/musztard/],['seler',/seler|bulion/]] as [string,RegExp][])if(pattern.test(s))out.push(label);
 return out;
}
function build(family:Family,variant:V,index:number):CookbookRecipe{
 const [name,add,detail]=variant, ingredients=[...family.base,...add];
 const names=ingredients.map(x=>x[0]).join(' ').toLowerCase();
 const steps:Parameters<typeof recipe>[6]=[[12,'Przygotuj składniki','Odmierz wszystkie składniki. '+detail]];
 if(family.proof){steps.push([family.proof,'Pierwsze wyrastanie','Przykryj i odstaw w temperaturze pokojowej do wyraźnego zwiększenia objętości.','wait']);steps.push([8,'Uformuj','Uformuj bochenek lub podziel ciasto na równe porcje zgodnie z opisem.']);}
 if(family.secondProof)steps.push([family.secondProof,'Drugie wyrastanie','Przykryj i odstaw do napuszenia.','wait']);
 steps.push([family.minutes,'Przygotuj danie',family.method,family.oven?'oven':'stove']);
 if(family.rest)steps.push([family.rest,'Ostudź lub odstaw','Odstaw na kratce lub schłodź zgodnie z opisem.','wait']);
 steps.push([3,'Sprawdź i podaj','Sprawdź gotowość, podziel na porcje. Nie próbuj surowej mąki ani surowych jaj.']);
 const safe=/kurcz|indyk|kaczk/.test(names)?'poultry':/mielon/.test(names)?'ground':/łosoś|dorsz|krewet/.test(names)?'fish':/jaj/.test(names)?'egg':undefined;
 const r=recipe('book-'+String(index+200).padStart(3,'0'),name,family.cuisine,family.category,family.servings||4,ingredients,steps,allergens(ingredients),safe,'Domowa interpretacja. Alergeny produktów gotowych sprawdź na opakowaniu.');
 // Original adaptations: no claim that external source validates the recipe.
 r.book.sources=[];
 if(family.diets)r.book.diets=family.diets;
 return r;
}
export const WORLD_COOKBOOK_RECIPES=families.flatMap(family=>family.variants.map(variant=>({family,variant}))).map(({family,variant},index)=>build(family,variant,index));
