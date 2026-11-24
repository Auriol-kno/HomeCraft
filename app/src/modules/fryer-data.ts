// Air Fryer cheat sheet for the COSORI TurboBlaze 6 l (30–230 °C, 9 modes).
// `s` are the moments (fraction of the total time) at which to shake or turn the food.
export const FRYER_PREHEAT_SECONDS = 180;
export type ModeId = 'PREHEAT' | 'AIRFRY' | 'ROAST' | 'BROIL' | 'FROZEN' | 'BAKE' | 'REHEAT' | 'DRY' | 'PROOF';
export interface Mode { tag: string; pl: string; range: string; d: string }
export const MODES: Record<ModeId, Mode> = {
  AIRFRY: { tag: 'AIR FRY', pl: 'Smażenie', range: '170–230 °C', d: 'Najszybszy nawiew. Frytki, skrzydełka, panierki, wszystko co ma być chrupiące.' },
  ROAST: { tag: 'ROAST', pl: 'Pieczenie mięs', range: '170–220 °C', d: 'Dla większych kawałków mięsa i warzyw. Równo przypieka bez wysuszania.' },
  BROIL: { tag: 'BROIL', pl: 'Grill', range: '200–230 °C', d: 'Mocne ciepło od góry. Steki, przypiekanie serów, karmelizowanie.' },
  FROZEN: { tag: 'FROZEN', pl: 'Mrożonki', range: '180–230 °C', d: 'Produkty prosto z zamrażarki, bez rozmrażania.' },
  BAKE: { tag: 'BAKE', pl: 'Wypieki', range: '130–200 °C', d: 'Wolniejszy nawiew, ciasto nie przypala się z wierzchu. Muffiny, zapiekanki, jajka.' },
  REHEAT: { tag: 'REHEAT', pl: 'Odgrzewanie', range: '130–200 °C', d: 'Pizza, frytki, panierki z wczoraj. Wracają chrupiące, nie gumowe.' },
  DRY: { tag: 'DRY', pl: 'Suszenie', range: '30–80 °C', d: 'Bardzo niski nawiew i temperatura. Chipsy z owoców, suszone pomidory, zioła.' },
  PROOF: { tag: 'PROOF', pl: 'Wyrastanie', range: '30–40 °C', d: 'Ciepło do wyrastania ciasta drożdżowego.' },
  PREHEAT: { tag: 'PREHEAT', pl: 'Rozgrzewanie', range: 'do 230 °C', d: 'Rozgrzewa kosz ok. 3 min. Warto przed mięsem i frytkami.' },
};
export const MODE_ORDER: ModeId[] = ['PREHEAT', 'AIRFRY', 'ROAST', 'BROIL', 'FROZEN', 'BAKE', 'REHEAT', 'DRY', 'PROOF'];

// Additional appliance stages already required by the written instructions.
export const DISH_FINISH_STAGES: Record<string,{title:string;min:number;mode:ModeId;temp:number}[]> = {
 zeberka: [{title:'Dopieczenie: BROIL 230 °C',min:4,mode:'BROIL',temp:230}],
};
export interface Dish {
  id: string; n: string; c: string; m: ModeId; t: number; min: number; pre: boolean; s: number[]; act: string;
  a: string; f: string; core: number | null; st: string[]; tip: string;
}
const dish = (id: string, n: string, c: string, m: ModeId, t: number, min: number, pre: boolean, s: number[], act: string, a: string, f: string, core: number | null, st: string[], tip = ''): Dish => ({ id, n, c, m, t, min, pre, s, act, a, f, core, st, tip });

export const DISHES: Dish[] = [
  dish('frytki', 'Frytki domowe', 'Ziemniaki', 'AIRFRY', 200, 20, true, [.4, .75], 'Potrząśnij kosz', '600–800 g', '1 łyżka oleju', null,
    ['Pokrój ziemniaki w słupki ok. 1 cm.', 'Namocz 30 min w zimnej wodzie, potem dokładnie osusz ręcznikiem.', 'Wymieszaj z olejem, wsyp do rozgrzanego kosza.', 'Potrząśnij 2 razy w trakcie. Sól dopiero po wyjęciu.'],
    'Osuszenie to połowa sukcesu. Mokre frytki parują zamiast się rumienić.'),
  dish('frytki-mroz', 'Frytki mrożone', 'Mrożonki', 'FROZEN', 200, 15, false, [.5], 'Potrząśnij kosz', 'do 700 g', 'bez oleju', null,
    ['Wsyp frytki prosto z zamrażarki, nie rozmrażaj.', 'Potrząśnij w połowie.', 'Jeśli chcesz bardziej chrupiące, dodaj 2–3 min.'], 'Cienkie frytki (shoestring) potrzebują ok. 11–12 min.'),
  dish('cwiartki', 'Ziemniaki pieczone w ćwiartkach', 'Ziemniaki', 'ROAST', 200, 22, true, [.5], 'Potrząśnij kosz', 'ok. 800 g', '1 łyżka oleju + przyprawy', null,
    ['Umyj ziemniaki, pokrój w ćwiartki ze skórką.', 'Wymieszaj z olejem, solą, papryką i czosnkiem granulowanym.', 'Piecz, potrząsając w połowie.'], 'Młode ziemniaki: skróć do 18 min.'),
  dish('bataty', 'Frytki z batatów', 'Ziemniaki', 'AIRFRY', 195, 16, true, [.5], 'Potrząśnij kosz', 'ok. 500 g', '1 łyżka oleju + 1 łyżeczka skrobi', null,
    ['Pokrój bataty w słupki 0,8–1 cm.', 'Obtocz w odrobinie skrobi ziemniaczanej, potem w oleju.', 'Rozłóż luźno, nie za dużo naraz.'], 'Bataty mają dużo cukru, więc pilnuj końcówki, żeby się nie przypaliły.'),
  dish('skrzydelka', 'Skrzydełka z kurczaka', 'Drób', 'AIRFRY', 200, 22, true, [.5], 'Obróć skrzydełka', 'ok. 1 kg', 'bez oleju (skóra ma tłuszcz)', 75,
    ['Osusz skrzydełka i natrzyj przyprawami.', 'Ułóż jedną warstwą.', 'Obróć w połowie.', 'Sos (np. BBQ) dodaj na ostatnie 2–3 min.'], 'Łyżeczka proszku do pieczenia w przyprawie daje bardzo chrupiącą skórkę.'),
  dish('podudzia', 'Podudzia z kurczaka', 'Drób', 'ROAST', 200, 25, true, [.5], 'Obróć podudzia', '6–8 szt.', '1 łyżeczka oleju', 75,
    ['Natrzyj podudzia przyprawami i odrobiną oleju.', 'Ułóż, nie stykając ich zbyt ciasno.', 'Obróć w połowie i sprawdź temperaturę w środku.'], 'Grubsze sztuki: dodaj 4–5 min.'),
  dish('piers', 'Pierś z kurczaka', 'Drób', 'AIRFRY', 190, 14, true, [.5], 'Obróć pierś', '2 filety', '1 łyżeczka oleju', 75,
    ['Rozbij filety na równą grubość (ok. 2 cm).', 'Natrzyj olejem i przyprawami.', 'Obróć w połowie, po wyjęciu odstaw na 5 min.'], 'Nierówna grubość to główny powód suchych piersi.'),
  dish('kurczak', 'Kurczak w całości', 'Drób', 'ROAST', 180, 50, false, [.5], 'Obróć kurczaka piersią do góry', 'do 1,6 kg', '1 łyżka oleju', 75,
    ['Osusz kurczaka, natrzyj olejem i przyprawami.', 'Zacznij piersią w dół.', 'W połowie obróć piersią do góry.', 'Sprawdź temperaturę w najgrubszym miejscu uda.'], 'Odstaw na 10 min przed krojeniem.'),
  dish('nuggetsy', 'Nuggetsy mrożone', 'Mrożonki', 'FROZEN', 200, 10, false, [.5], 'Potrząśnij kosz', 'do 500 g', 'bez oleju', 75, ['Rozłóż jedną warstwą.', 'Potrząśnij w połowie.']),
  dish('schabowy', 'Schabowy panierowany', 'Mięso', 'AIRFRY', 200, 12, true, [.5], 'Obróć kotlety', '2–3 kotlety', 'spray z oleju z obu stron', 63,
    ['Rozbij kotlety, panieruj klasycznie: mąka, jajko, bułka.', 'Spryskaj olejem z obu stron, to daje złoty kolor.', 'Obróć w połowie.'], 'Bez oleju panierka zostanie blada i sucha.'),
  dish('mielone', 'Kotlety mielone', 'Mięso', 'AIRFRY', 190, 14, true, [.5], 'Obróć kotlety', '6–8 szt.', 'spray z oleju', 71,
    ['Uformuj kotlety ok. 2 cm grubości.', 'Obtocz w bułce, spryskaj olejem.', 'Obróć w połowie.']),
  dish('karkowka', 'Karkówka w plastrach', 'Mięso', 'ROAST', 200, 16, true, [.5], 'Obróć plastry', '4 plastry ok. 1,5 cm', 'z marynaty', 63,
    ['Zamarynuj min. 1 h (najlepiej na noc).', 'Ułóż jedną warstwą.', 'Obróć w połowie.'], 'Wyjmij i odstaw na 5 min pod folią.'),
  dish('zeberka', 'Żeberka wieprzowe', 'Mięso', 'ROAST', 180, 30, false, [.5], 'Obróć żeberka', 'ok. 1 kg', 'z marynaty', 70,
    ['Pokrój na porcje po 2–3 kości.', 'Piecz 30 min, obracając w połowie.', 'Posmaruj sosem i dopiecz 4 min w trybie BROIL 230 °C.'], 'Wcześniej podgotowane żeberka: 15 min wystarczy.'),
  dish('kielbasa', 'Kiełbasa', 'Mięso', 'AIRFRY', 200, 10, false, [.5], 'Obróć kiełbasę', '4–6 kawałków', 'bez oleju', null, ['Natnij skórkę w kilku miejscach.', 'Obróć w połowie.']),
  dish('boczek', 'Boczek w plastrach', 'Mięso', 'AIRFRY', 180, 8, false, [.5], 'Obróć plastry', '8–10 plastrów', 'bez oleju', null,
    ['Ułóż plastry na płasko, mogą lekko na siebie nachodzić.', 'Obróć w połowie, wyjmij gdy będą chrupiące.'], 'Tłuszcz zbiera się pod kratką, wylej go po ostygnięciu.'),
  dish('burger', 'Burger wołowy', 'Mięso', 'AIRFRY', 200, 10, true, [.5], 'Obróć burgery', '2–3 kotlety po 150 g', 'bez oleju', 71,
    ['Uformuj kotlety, w środku zrób kciukiem dołek.', 'Sól i pieprz tuż przed pieczeniem.', 'Obróć w połowie, ser połóż na ostatnią minutę.']),
  dish('stek', 'Stek wołowy 2,5 cm', 'Mięso', 'BROIL', 230, 10, true, [.5], 'Obróć stek', '1–2 steki', 'cienko olejem', 57,
    ['Wyjmij stek z lodówki 30 min wcześniej.', 'Osusz, natrzyj olejem, sól i pieprz.', 'Obróć w połowie. 10 min to średnio wysmażony.', 'Odstaw na 5 min przed krojeniem.'], 'Krwisty: 8 min. Wysmażony: 13–14 min.'),
  dish('losos', 'Łosoś filet', 'Ryby', 'AIRFRY', 190, 9, true, [], '', '2 filety', '1 łyżeczka oleju', 63,
    ['Osusz filety, natrzyj olejem, solą i cytryną.', 'Ułóż skórą do dołu.', 'Nie obracaj.'], 'Grubszy filet (powyżej 3 cm): 11–12 min.'),
  dish('dorsz', 'Dorsz panierowany', 'Ryby', 'AIRFRY', 200, 10, true, [.5], 'Ostrożnie obróć rybę', '2–3 kawałki', 'spray z oleju', 63,
    ['Panieruj: mąka, jajko, bułka lub panko.', 'Spryskaj olejem.', 'Obróć ostrożnie w połowie.']),
  dish('paluszki', 'Paluszki rybne mrożone', 'Mrożonki', 'FROZEN', 200, 9, false, [.5], 'Obróć paluszki', 'do 15 szt.', 'bez oleju', null, ['Rozłóż jedną warstwą.', 'Obróć w połowie.']),
  dish('krewetki', 'Krewetki', 'Ryby', 'AIRFRY', 200, 6, true, [.5], 'Potrząśnij kosz', 'ok. 400 g', '1 łyżeczka oleju + czosnek', null,
    ['Rozmrożone krewetki osusz.', 'Wymieszaj z olejem, czosnkiem i papryką.', 'Potrząśnij w połowie. Gotowe, gdy są różowe i zwinięte w C.']),
  dish('warzywa', 'Warzywa pieczone', 'Warzywa', 'ROAST', 200, 12, false, [.5], 'Potrząśnij kosz', 'ok. 600 g', '1 łyżka oleju', null,
    ['Pokrój paprykę, cukinię, cebulę i pieczarki w podobne kawałki.', 'Wymieszaj z olejem i ziołami.', 'Potrząśnij w połowie.']),
  dish('brokul', 'Brokuł lub kalafior', 'Warzywa', 'AIRFRY', 190, 10, false, [.5], 'Potrząśnij kosz', '1 główka', '1 łyżka oleju', null,
    ['Podziel na różyczki.', 'Wymieszaj z olejem, solą i czosnkiem.', 'Potrząśnij w połowie. Brzegi mają być przypieczone.'], 'Posyp parmezanem na ostatnie 2 min.'),
  dish('brukselka', 'Brukselka', 'Warzywa', 'AIRFRY', 190, 14, false, [.5], 'Potrząśnij kosz', 'ok. 500 g', '1 łyżka oleju', null,
    ['Przekrój na pół.', 'Wymieszaj z olejem i solą.', 'Potrząśnij w połowie.'], 'Na koniec skrop octem balsamicznym.'),
  dish('pierogi', 'Pierogi chrupiące', 'Przekąski', 'AIRFRY', 200, 9, true, [.5], 'Obróć pierogi', '15–20 szt.', 'posmaruj olejem lub masłem', null,
    ['Ugotowane (lub kupne ugotowane) pierogi osusz.', 'Posmaruj cienko olejem lub roztopionym masłem.', 'Obróć w połowie.'], 'Mrożone surowe: najpierw ugotuj, prosto z zamrażarki wyjdą twarde.'),
  dish('zapiekanka', 'Zapiekanka z bagietki', 'Przekąski', 'BAKE', 190, 8, false, [], '', '2 połówki bagietki', 'bez oleju', null,
    ['Pieczarki podsmaż wcześniej, połóż na bagietce.', 'Posyp serem.', 'Piecz do roztopienia i zarumienienia sera.'], 'Ketchup i szczypiorek po wyjęciu.'),
  dish('tost', 'Tosty z serem', 'Przekąski', 'AIRFRY', 190, 6, false, [.5], 'Obróć tosty', '2–3 tosty', 'masło z zewnątrz', null,
    ['Posmaruj chleb masłem od zewnątrz.', 'Włóż ser i dodatki.', 'Obróć w połowie. Lekki chleb przytrzymaj wykałaczką.'], 'Nawiew jest mocny i może zdmuchnąć wierzchnią kromkę.'),
  dish('ciecierzyca', 'Chrupiąca ciecierzyca', 'Przekąski', 'AIRFRY', 200, 14, false, [.35, .7], 'Potrząśnij kosz', '1 puszka', '1 łyżeczka oleju', null,
    ['Odsącz i bardzo dokładnie osusz.', 'Wymieszaj z olejem i przyprawami.', 'Potrząśnij 2 razy.']),
  dish('camembert', 'Camembert zapiekany', 'Przekąski', 'BAKE', 180, 8, false, [], '', '1 krążek', 'bez oleju', null,
    ['Naciśnij skórkę na krzyż, włóż do małej foremki.', 'Dodaj miód, orzechy lub żurawinę.', 'Piecz, aż środek będzie płynny.']),
  dish('grzanki', 'Grzanki do zupy', 'Przekąski', 'AIRFRY', 180, 5, false, [.5], 'Potrząśnij kosz', '3–4 kromki w kostkę', '1 łyżka oliwy', null,
    ['Pokrój chleb w kostkę 1,5 cm.', 'Wymieszaj z oliwą, czosnkiem i ziołami.', 'Potrząśnij w połowie.']),
  dish('jajka', 'Jajka na twardo', 'Desery i wypieki', 'BAKE', 140, 13, false, [], '', 'do 8 jajek', 'bez oleju', null,
    ['Włóż jajka prosto z lodówki do kosza.', 'Po sygnale od razu przełóż do lodowatej wody na 5 min.'], 'Na miękko: 9 min. Na półmiękko: 11 min.'),
  dish('muffiny', 'Muffiny', 'Desery i wypieki', 'BAKE', 160, 14, true, [], '', '6–7 papilotek', '—', null,
    ['Użyj silikonowych foremek lub podwójnych papilotek.', 'Napełnij do 2/3.', 'Sprawdź patyczkiem po 12 min.'], 'Przy zbyt wysokiej temperaturze wierzch pęka, a środek zostaje surowy.'),
  dish('jablka', 'Pieczone jabłka', 'Desery i wypieki', 'BAKE', 180, 15, false, [], '', '3–4 jabłka', 'masło', null,
    ['Wydrąż gniazda nasienne.', 'Nadziej cynamonem, miodem, rodzynkami i kawałkiem masła.', 'Piecz, aż skórka zacznie pękać.']),
  dish('chipsy', 'Chipsy jabłkowe', 'Desery i wypieki', 'DRY', 60, 240, false, [.5], 'Przewróć plasterki', '2–3 jabłka', '—', null,
    ['Pokrój jabłka w plasterki 2–3 mm.', 'Skrop cytryną, opcjonalnie posyp cynamonem.', 'Rozłóż jedną warstwą, przewróć w połowie.'], 'Chipsy twardnieją dopiero po ostygnięciu.'),
  dish('drozdzowe', 'Wyrastanie ciasta drożdżowego', 'Desery i wypieki', 'PROOF', 35, 45, false, [], '', 'miska do ok. 18 cm', '—', null,
    ['Wyjmij kratkę, włóż miskę z ciastem przykrytą folią.', 'Ustaw tryb PROOF.', 'Ciasto ma podwoić objętość.']),
  dish('pizza', 'Pizza z wczoraj', 'Odgrzewanie', 'REHEAT', 180, 4, false, [], '', '2–3 kawałki', 'bez oleju', null,
    ['Ułóż kawałki obok siebie.', 'Gotowe, gdy ser bulgocze.'], 'Spód znowu jest chrupiący, nie miękki jak z mikrofali.'),
  dish('odgrz-frytki', 'Odgrzewane frytki', 'Odgrzewanie', 'REHEAT', 190, 4, false, [.5], 'Potrząśnij kosz', 'porcja', 'kropla oleju', null, ['Wsyp frytki, potrząśnij w połowie.']),
];
export const FRYER_CATEGORIES = ['Wszystkie', 'Ziemniaki', 'Drób', 'Mięso', 'Ryby', 'Warzywa', 'Mrożonki', 'Przekąski', 'Desery i wypieki', 'Odgrzewanie'];

export const SAFE_TEMPS: [string, string][] = [
  ['Drób (pierś, udka, skrzydełka)', '75 °C'], ['Mięso mielone', '71 °C'], ['Wieprzowina (schab, karkówka)', '63–70 °C'], ['Ryby', '63 °C'],
  ['Wołowina: krwisty / średni / wysmażony', '52 / 57 / 70 °C'],
];
export const FRYER_RULES: [string, string][] = [
  ['Kosz wypełniaj maks. do połowy przy frytkach i warzywach', '½'],
  ['Przepis z piekarnika? Obniż temperaturę i skróć czas', '−20 °C / −20%'],
  ['Olej w sprayu lub pędzlem, nie lej', '1 łyżka'],
  ['Nie wkładaj papieru do pustego kosza w czasie grzania', '!'],
];

/** Minutes → "1 h 5 min" / "20 min". */
export const fmtMin = (m: number) => m >= 60 ? Math.floor(m / 60) + ' h' + (m % 60 ? ' ' + (m % 60) + ' min' : '') : m + ' min';
/** Case/diacritics-insensitive text for search. */
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
