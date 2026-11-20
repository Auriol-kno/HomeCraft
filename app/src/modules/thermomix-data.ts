// Thermomix TM6 basics that work from the device's own manual controls (time, temperature, speed),
// with no Cookidoo and no internet. Values are orientation settings from general Thermomix practice
// (Vorwerk safety notes: soups, casseroles and jams at most 100 °C; steaming at Varoma temperature
// with speeds up to 6; from 95 °C use the simmering basket instead of the measuring cup).
// Check them against the manual that came with your device.

/** One thing to set on the device. `temp` is °C, 'Varoma' or '' (none); `speed` is a number, 'Interwał', 'Łyżka' (gentle stir), 'Turbo', or ''. */
export interface Setting { min?: number; sec?: number; temp?: number | 'Varoma' | ''; speed?: string; rev?: boolean }
export interface TmStep { text: string; set?: Setting; wait?: number }
export interface TmRecipe { id: string; n: string; c: string; yield: string; ing: string[]; steps: TmStep[]; note?: string }

export const TM_CATEGORIES = ['Wszystkie', 'Dodatki', 'Zupy i sosy', 'Ciasta', 'Słodkie i desery', 'Szybkie czynności'] as const;

export const TM_RULES: [string, string][] = [
  ['Pojemność misy', 'Maksymalnie 2,2 l. Przy gorących płynach nie przekraczaj znacznika w misie.'],
  ['Zakres obrotów', 'Od delikatnego mieszania (Łyżka, ok. 40 obr./min) przez poziomy 0,5 do 10 (do ok. 10 700 obr./min), do tego Turbo i Interwał do ciasta.'],
  ['Zupy, sosy, dżemy', 'Gotuj najwyżej w 100 °C. Wyższa temperatura (Varoma) jest do gotowania na parze i smażenia.'],
  ['Od 95 °C', 'Zamiast miarki wkładaj koszyczek (stożek) na pokrywę, żeby para mogła uciekać.'],
  ['Gotowanie na parze', 'Do misy 500 g wody, Varoma na pokrywie. Woda dochodzi do wrzenia w około 5 minut. Używaj obrotów do 6, zwykle 1–2.'],
  ['Mleko i śmietana', 'Nie ustawiaj więcej niż 90 °C, żeby nie przypaliło się na dnie.'],
  ['Miksowanie gorących rzeczy', 'Zaczynaj od niskich obrotów, trzymaj miarkę w pokrywie i zwiększaj obroty stopniowo do 6–8.'],
  ['Waga', 'Działa w trybie ważenia i podczas gotowania do niskich obrotów. Przy wysokich obrotach jest wyłączona.'],
];

const s = (min: number, temp: Setting['temp'], speed: string, extra: Partial<Setting> = {}): Setting => ({ min, temp, speed, ...extra });

export const TM_RECIPES: TmRecipe[] = [
  { id: 'ryz', n: 'Ryż w koszyczku', c: 'Dodatki', yield: '2 porcje', ing: ['1000 g wody', '1 łyżeczka soli', '200 g ryżu (długoziarnistego lub jaśminowego), przepłukanego'],
    steps: [{ text: 'Wlej wodę i sól do misy, włóż koszyczek i wsyp do niego ryż. Gotuj bez miarki, przykryj pokrywę koszyczkiem.', set: s(18, 100, '4') }, { text: 'Wyjmij koszyczek, odlej wodę i od razu podawaj.' }],
    note: 'Czas zawiera rozgrzanie wody do wrzenia. Sprawdź ziarno po 15 min i w razie potrzeby dołóż 2–3 min.' },
  { id: 'kasza', n: 'Kasza gryczana w koszyczku', c: 'Dodatki', yield: '2 porcje', ing: ['1000 g wody', '1 łyżeczka soli', '200 g kaszy gryczanej, przepłukanej'],
    steps: [{ text: 'Wlej wodę i sól do misy, kaszę wsyp do koszyczka. Gotuj z koszyczkiem na pokrywie zamiast miarki.', set: s(20, 100, '4') }, { text: 'Wyjmij koszyczek, odlej wodę, dodaj łyżkę masła i odstaw pod przykryciem na 5 min.', wait: 5 }] },
  { id: 'ziemniaki', n: 'Ziemniaki na parze (Varoma)', c: 'Dodatki', yield: '4 porcje', ing: ['500 g wody do misy', '600–800 g ziemniaków w kawałkach', 'sól po ugotowaniu'],
    steps: [{ text: 'Wlej wodę do misy. Ziemniaki ułóż luźno w Varoma, zostaw szczeliny na parę. Zamknij pokrywą i ustaw Varoma na pokrywie.', set: s(30, 'Varoma', '2') }, { text: 'Sprawdź widelcem. Jeśli twarde, dołóż 5 min. Dolej wody do misy, jeśli wydłużasz parowanie.' }],
    note: 'Czas zależy od wielkości kawałków: kostka 3 cm to około 25–30 min.' },
  { id: 'warzywa', n: 'Warzywa na parze', c: 'Dodatki', yield: '2–4 porcje', ing: ['500 g wody do misy', '400–600 g warzyw (brokuł, marchew, kalafior, fasolka)', 'sól, masło'],
    steps: [{ text: 'Wlej wodę. Warzywa ułóż w Varoma od najtwardszych (na dole) do delikatnych (na wierzchu).', set: s(20, 'Varoma', '2') }, { text: 'Brokuł i fasolka są gotowe po 15–18 min, marchew i kalafior po 20–25 min.' }] },
  { id: 'puree', n: 'Puree ziemniaczane', c: 'Dodatki', yield: '4 porcje', ing: ['600 g ugotowanych, ciepłych ziemniaków', '60 g masła', '100 g ciepłego mleka', 'sól, gałka muszkatołowa'],
    steps: [{ text: 'Wszystko włóż do misy. Zmiksuj do gładkości na obrotach wstecznych, żeby nie zrobić kleju.', set: s(0, '', '4', { sec: 25, rev: true }) }, { text: 'Jeśli za gęste, dolej łyżkę ciepłego mleka i zmiksuj 5 s na obrotach wstecznych, obr. 3.', set: { sec: 5, speed: '3', rev: true } }] },
  { id: 'zupa-krem', n: 'Zupa krem z warzyw', c: 'Zupy i sosy', yield: '4 porcje', ing: ['1 cebula, 1 ząbek czosnku', '20 g oleju lub masła', '600 g warzyw w kawałkach (marchew, pietruszka, cukinia, dynia)', '600 g wody lub bulionu, 1 łyżeczka soli, pieprz'],
    steps: [{ text: 'Cebulę i czosnek rozdrobnij.', set: { sec: 4, speed: '5' } }, { text: 'Zgarnij ze ścianek, dodaj olej i podsmaż.', set: s(3, 'Varoma', '1') }, { text: 'Dodaj warzywa, wodę i przyprawy. Gotuj z miarką.', set: s(20, 100, '1') }, { text: 'Zmiksuj, zaczynając od niskich obrotów i zwiększając do 8, miarka w pokrywie.', set: { min: 1, speed: '5→8' } }] },
  { id: 'sos-pomidorowy', n: 'Sos pomidorowy', c: 'Zupy i sosy', yield: '3–4 porcje', ing: ['1 cebula, 2 ząbki czosnku', '20 g oliwy', '1 puszka pomidorów (400 g)', '50 g wody, sól, pieprz, zioła, szczypta cukru'],
    steps: [{ text: 'Cebulę i czosnek rozdrobnij.', set: { sec: 4, speed: '5' } }, { text: 'Dodaj oliwę i podsmaż.', set: s(3, 'Varoma', '1') }, { text: 'Dodaj pomidory, wodę i przyprawy. Gotuj z koszyczkiem na pokrywie.', set: s(18, 100, '1') }, { text: 'Zmiksuj na gładko.', set: { sec: 20, speed: '7' } }] },
  { id: 'bulion', n: 'Domowy bulion warzywny', c: 'Zupy i sosy', yield: '1 l', ing: ['800 g wody', '300 g warzyw (marchew, seler, pietruszka, por)', '1 cebula', 'liść laurowy, ziele angielskie, sól'],
    steps: [{ text: 'Warzywa pokrój w grube kawałki i włóż do misy z wodą i przyprawami.', set: s(30, 100, '1') }, { text: 'Przecedź przez sito. Przechowuj w lodówce do 3 dni.' }] },
  { id: 'pizza', n: 'Ciasto na pizzę', c: 'Ciasta', yield: '2 duże placki', ing: ['300 g letniej wody', '20 g oliwy', '1 łyżeczka cukru', '20 g świeżych drożdży (lub 7 g suchych)', '500 g mąki pszennej', '1 łyżeczka soli'],
    steps: [{ text: 'Do misy wlej wodę, oliwę, cukier i drożdże. Podgrzej lekko, żeby drożdże zaczęły pracować.', set: s(1, 37, '2') }, { text: 'Dodaj mąkę i sól. Zmieszaj.', set: { sec: 10, speed: '5' } }, { text: 'Wyrabiaj ciasto (tryb interwałowy).', set: { min: 2, speed: 'Interwał' } }, { text: 'Wyjmij ciasto, przykryj i zostaw do wyrośnięcia.', wait: 40 }],
    note: 'Ciasto drożdżowe wyrabiaj najwyżej 2–3 min, żeby nie przegrzać silnika.' },
  { id: 'nalesniki', n: 'Naleśniki', c: 'Ciasta', yield: 'ok. 12 sztuk', ing: ['300 g mleka', '100 g wody gazowanej', '3 jajka', '200 g mąki pszennej', '20 g oleju', 'szczypta soli'],
    steps: [{ text: 'Wszystkie składniki wrzuć do misy i zmiksuj.', set: { sec: 30, speed: '5' } }, { text: 'Zgarnij ze ścianek i zmiksuj jeszcze raz. Odstaw ciasto na kilka minut.', set: { sec: 10, speed: '5' }, wait: 15 }] },
  { id: 'bita-smietana', n: 'Bita śmietana', c: 'Słodkie i desery', yield: '400 g', ing: ['400 g bardzo zimnej śmietany 30–36%', '1–2 łyżki cukru pudru'],
    steps: [{ text: 'Załóż motylek, wlej zimną śmietanę z cukrem pudrem. Ubijaj i pilnuj konsystencji, bo łatwo ją zważyć.', set: { min: 1, sec: 30, speed: '3.5' } }] },
  { id: 'bialka', n: 'Piana z białek', c: 'Słodkie i desery', yield: '4 białka', ing: ['4 białka, w temperaturze pokojowej', 'szczypta soli', 'miska i motylek całkiem czyste i suche'],
    steps: [{ text: 'Włóż motylek, wlej białka i sól. Ubijaj na sztywno.', set: { min: 3, speed: '3.5' } }] },
  { id: 'cukier-puder', n: 'Cukier puder', c: 'Szybkie czynności', yield: '150 g', ing: ['150 g cukru kryształu'],
    steps: [{ text: 'Mielenie przy pustej, suchej misie.', set: { sec: 10, speed: '10' } }, { text: 'Odczekaj chwilę, aż osiądzie pył, zanim otworzysz pokrywę.' }] },
  { id: 'ser', n: 'Starty ser i bułka tarta', c: 'Szybkie czynności', yield: '150 g', ing: ['150 g twardego sera w kawałkach (lub czerstwego pieczywa)'],
    steps: [{ text: 'Rozdrabniaj w suchej misie, w kawałkach do 3 cm.', set: { sec: 10, speed: '8' } }] },
  { id: 'siekanie', n: 'Siekanie warzyw (cebula, zioła)', c: 'Szybkie czynności', yield: 'do 250 g', ing: ['cebula, czosnek, marchew, zioła w dużych kawałkach'],
    steps: [{ text: 'Wrzuć kawałki przez otwór w pokrywie przy włączonych obrotach, aby się nie kleiły. Sprawdź konsystencję i powtórz, jeśli trzeba.', set: { sec: 4, speed: '5' } }] },
];

export function settingText(x: Setting): string {
  const t: string[] = [];
  const time = (x.min ? x.min + ' min' : '') + (x.sec ? (x.min ? ' ' : '') + x.sec + ' s' : '');
  if (time) t.push(time);
  if (x.temp) t.push(x.temp === 'Varoma' ? 'Varoma' : x.temp + ' °C');
  if (x.speed) t.push(/^[0-9.]/.test(x.speed) ? 'obr. ' + x.speed : x.speed);
  if (x.rev) t.push('↺ wstecz');
  return t.join(' · ');
}
