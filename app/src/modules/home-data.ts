// "Dom" (home help): egg times, cooking times by method, kitchen measures and temperatures.
// All values are rules of thumb for everyday cooking: sizes, stoves and pots vary, so times
// are starting points. Boiling times are counted from the moment the water boils.

// ---- Eggs --------------------------------------------------------------------------------
export interface EggStyle { id: string; n: string; sec: number; range: string; note: string }
/** Medium (M) egg, straight from the fridge, lowered into gently boiling water. */
export const EGG_BOIL: EggStyle[] = [
  { id: 'soft', n: 'Na miękko', sec: 270, range: '4–5 min', note: 'Białko ścięte, żółtko płynne.' },
  { id: 'mollet', n: 'Półtwarde (mollet)', sec: 390, range: '6–7 min', note: 'Białko twarde, żółtko kremowe, w środku miękkie.' },
  { id: 'hard', n: 'Na twardo', sec: 570, range: '9–10 min', note: 'Białko i żółtko całkowicie ścięte. Dłuższe gotowanie daje szary pierścień wokół żółtka.' },
];
export const EGG_STEAM: EggStyle[] = [
  { id: 'soft', n: 'Na miękko', sec: 360, range: '6 min', note: 'Nad wrzącą wodą, pod przykryciem.' },
  { id: 'mollet', n: 'Półtwarde (mollet)', sec: 450, range: '7–8 min', note: 'Nad wrzącą wodą, pod przykryciem.' },
  { id: 'hard', n: 'Na twardo', sec: 720, range: '12 min', note: 'Nad wrzącą wodą, pod przykryciem.' },
];
export const EGG_SIZES = [
  { id: 'S', n: 'S (małe)', adj: -30 }, { id: 'M', n: 'M (średnie)', adj: 0 }, { id: 'L', n: 'L (duże)', adj: 30 }, { id: 'XL', n: 'XL (bardzo duże)', adj: 60 },
] as const;
export const EGG_START = [{ id: 'fridge', n: 'Z lodówki', adj: 0 }, { id: 'room', n: 'Pokojowa', adj: -30 }] as const;
export type EggMethod = 'boil' | 'steam';
export function eggSeconds(method: EggMethod, style: string, size: string, start: string): number {
  const list = method === 'boil' ? EGG_BOIL : EGG_STEAM;
  const base = list.find(s => s.id === style) ?? list[0];
  const sz = EGG_SIZES.find(s => s.id === size)?.adj ?? 0, st = EGG_START.find(s => s.id === start)?.adj ?? 0;
  return Math.max(60, base.sec + sz + st);
}
export interface OtherEgg { n: string; time: string; sec: number; how: string }
export const EGG_OTHER: OtherEgg[] = [
  { n: 'Jajko w koszulce', time: '3 min', sec: 180, how: 'Woda lekko pyrka (nie bulgocze), łyżka octu. Wlej jajko z kubka w wir wody.' },
  { n: 'Jajko sadzone', time: '3–4 min', sec: 210, how: 'Patelnia na średnim ogniu, przykryj na końcu, żeby ściąć białko.' },
  { n: 'Jajecznica', time: '3–4 min', sec: 210, how: 'Mały ogień, mieszaj. Zdejmij, gdy jest jeszcze lśniąca: dojdzie na patelni.' },
  { n: 'Jajka w air fryerze (140 °C, tryb BAKE)', time: '9 / 11 / 13 min', sec: 780, how: 'Na miękko 9 min, półmiękko 11 min, na twardo 13 min. Potem lodowata woda. Szczegóły w dziale Air Fryer.' },
];
export const EGG_TIPS: [string, string][] = [
  ['Test świeżości', 'Zanurz jajko w szklance wody. Świeże opada i leży na boku. Starsze niż tydzień staje pionowo (nadaje się, najlepiej na twardo). Pływające wyrzuć.'],
  ['Łatwe obieranie', 'Po ugotowaniu zalej zimną wodą i odczekaj. Do gotowania na twardo wybieraj jajka kilka dni starsze, bo świeże obiera się trudniej.'],
  ['Pęknięta skorupka', 'Jajko wkładaj do wody łyżką. Łyżeczka soli w wodzie pomaga, gdy skorupka pęknie, i ułatwia obieranie.'],
];

// ---- Cooking times by method -------------------------------------------------------------
export type MethodId = 'pot' | 'steam' | 'oven' | 'fryer';
export const METHODS: { id: MethodId; n: string; hint: string }[] = [
  { id: 'pot', n: 'Garnek', hint: 'Czas od zagotowania wody' },
  { id: 'steam', n: 'Na parze', hint: 'Czas od pojawienia się pary' },
  { id: 'oven', n: 'Piekarnik', hint: 'Po rozgrzaniu piekarnika' },
  { id: 'fryer', n: 'Air Fryer', hint: 'COSORI TurboBlaze, tryb jak w dziale Air Fryer' },
];
export interface Way { t: string; min: number; extra?: string }
export interface Food { id: string; n: string; c: string; ways: Partial<Record<MethodId, Way>>; note?: string }
const w = (t: string, min: number, extra?: string): Way => ({ t, min, extra });
export const FOODS: Food[] = [
  { id: 'ziemniaki', n: 'Ziemniaki w ćwiartkach', c: 'Ziemniaki', ways: { pot: w('15–20 min', 18), steam: w('20–25 min', 22), oven: w('35–40 min', 38, '200 °C, z olejem'), fryer: w('22 min', 22, 'ROAST 200 °C') }, note: 'Wrzucaj do osolonej wody. Gotowe, gdy nóż wchodzi bez oporu.' },
  { id: 'mlode', n: 'Młode ziemniaki w całości', c: 'Ziemniaki', ways: { pot: w('15–20 min', 18), steam: w('20–25 min', 22), oven: w('35–40 min', 38, '200 °C'), fryer: w('18 min', 18, 'ROAST 200 °C') } },
  { id: 'bataty', n: 'Bataty w kostce', c: 'Ziemniaki', ways: { pot: w('10–15 min', 12), steam: w('12–15 min', 13), oven: w('25–30 min', 28, '200 °C'), fryer: w('16 min', 16, 'AIR FRY 195 °C (słupki)') } },
  { id: 'brokul', n: 'Brokuł (różyczki)', c: 'Warzywa', ways: { pot: w('3–5 min', 4), steam: w('5–7 min', 6), oven: w('15–20 min', 18, '200 °C'), fryer: w('10 min', 10, 'AIR FRY 190 °C') }, note: 'Po ugotowaniu przelej zimną wodą, żeby zachował kolor.' },
  { id: 'kalafior', n: 'Kalafior (różyczki)', c: 'Warzywa', ways: { pot: w('8–10 min', 9), steam: w('10–12 min', 11), oven: w('20–25 min', 22, '200 °C'), fryer: w('10 min', 10, 'AIR FRY 190 °C') } },
  { id: 'marchew', n: 'Marchew w plasterkach', c: 'Warzywa', ways: { pot: w('8–12 min', 10), steam: w('10–12 min', 11), oven: w('25–30 min', 28, '200 °C') } },
  { id: 'fasolka', n: 'Fasolka szparagowa', c: 'Warzywa', ways: { pot: w('5–8 min', 6), steam: w('8–10 min', 9), oven: w('15–20 min', 18, '200 °C') } },
  { id: 'cukinia', n: 'Cukinia w plasterkach', c: 'Warzywa', ways: { pot: w('3–5 min', 4), steam: w('5 min', 5), oven: w('15–20 min', 18, '200 °C'), fryer: w('12 min', 12, 'ROAST 200 °C (mieszane warzywa)') } },
  { id: 'brukselka', n: 'Brukselka', c: 'Warzywa', ways: { pot: w('8–10 min', 9), steam: w('10–12 min', 11), oven: w('20–25 min', 22, '200 °C'), fryer: w('14 min', 14, 'AIR FRY 190 °C') } },
  { id: 'kukurydza', n: 'Kolba kukurydzy', c: 'Warzywa', ways: { pot: w('10–15 min', 12), steam: w('10–12 min', 11) }, note: 'Sól dodaj po ugotowaniu, żeby ziarna nie stwardniały.' },
  { id: 'buraki', n: 'Buraki w całości', c: 'Warzywa', ways: { pot: w('40–60 min', 50), oven: w('60 min', 60, '180 °C, w folii') }, note: 'Nie obcinaj ogonków przed gotowaniem, żeby nie „krwawiły”.' },
  { id: 'ryz', n: 'Ryż biały długoziarnisty', c: 'Kasze i ryż', ways: { pot: w('12–15 min + 10 min parzenia', 13) }, note: 'Proporcja 1 : 2 (ryż : woda, objętościowo). Pod przykryciem, na małym ogniu, potem odstaw bez zdejmowania pokrywki.' },
  { id: 'basmati', n: 'Ryż basmati', c: 'Kasze i ryż', ways: { pot: w('10–12 min + 5 min parzenia', 11) }, note: 'Proporcja 1 : 1,5. Wcześniej przepłucz do przejrzystej wody.' },
  { id: 'brazowy', n: 'Ryż brązowy', c: 'Kasze i ryż', ways: { pot: w('30–35 min', 32) }, note: 'Proporcja 1 : 2,5.' },
  { id: 'gryczana', n: 'Kasza gryczana', c: 'Kasze i ryż', ways: { pot: w('15–20 min', 18) }, note: 'Proporcja 1 : 2. Bez mieszania, pod przykryciem.' },
  { id: 'jaglana', n: 'Kasza jaglana', c: 'Kasze i ryż', ways: { pot: w('15–20 min', 17) }, note: 'Proporcja 1 : 2. Przed gotowaniem przelej wrzątkiem, żeby nie była gorzka.' },
  { id: 'pecak', n: 'Kasza jęczmienna (pęczak)', c: 'Kasze i ryż', ways: { pot: w('ok. 35 min', 35) }, note: 'Proporcja 1 : 2,5.' },
  { id: 'bulgur', n: 'Bulgur', c: 'Kasze i ryż', ways: { pot: w('12–15 min', 13) }, note: 'Proporcja 1 : 2.' },
  { id: 'kuskus', n: 'Kuskus', c: 'Kasze i ryż', ways: { pot: w('5 min (zalać wrzątkiem)', 5) }, note: 'Proporcja 1 : 1. Zalej wrzątkiem, przykryj, po czasie rozczesz widelcem.' },
  { id: 'owsianka', n: 'Płatki owsiane (owsianka)', c: 'Kasze i ryż', ways: { pot: w('5 min', 5) }, note: 'Proporcja 1 : 2 z mlekiem lub wodą.' },
  { id: 'makaron', n: 'Makaron (spaghetti, penne)', c: 'Makaron', ways: { pot: w('8–11 min (wg opakowania)', 9) }, note: 'Ok. 1 litra wody i 10 g soli na 100 g makaronu. Zacznij sprawdzać minutę przed czasem z opakowania.' },
  { id: 'pierogi', n: 'Pierogi świeże', c: 'Makaron', ways: { pot: w('3–4 min od wypłynięcia', 4), fryer: w('9 min', 9, 'AIR FRY 200 °C (ugotowane, posmarowane olejem)') } },
  { id: 'pierogi-mroz', n: 'Pierogi mrożone', c: 'Makaron', ways: { pot: w('5–7 min od wypłynięcia', 6) }, note: 'Wrzucaj prosto z zamrażarki, nie rozmrażaj.' },
  { id: 'soczewica-cz', n: 'Soczewica czerwona', c: 'Strączkowe', ways: { pot: w('12–15 min', 14) }, note: 'Nie wymaga moczenia.' },
  { id: 'soczewica-z', n: 'Soczewica zielona/brązowa', c: 'Strączkowe', ways: { pot: w('25–30 min', 28) } },
  { id: 'ciecierzyca', n: 'Ciecierzyca (po moczeniu)', c: 'Strączkowe', ways: { pot: w('60–90 min', 75), fryer: w('14 min', 14, 'AIR FRY 200 °C (z puszki, osuszona)') }, note: 'Namocz 8–12 godzin. Sól dodaj pod koniec.' },
  { id: 'fasola', n: 'Fasola (po moczeniu)', c: 'Strączkowe', ways: { pot: w('60–90 min', 75) }, note: 'Namocz 8–12 godzin, wodę z moczenia wylej.' },
  { id: 'kurczak', n: 'Pierś z kurczaka', c: 'Mięso i ryby', ways: { pot: w('15–20 min', 18), oven: w('20–25 min', 22, '200 °C'), fryer: w('14 min', 14, 'AIR FRY 190 °C') }, note: 'W środku min. 75 °C. Odstaw na 5 min przed krojeniem.' },
  { id: 'losos', n: 'Łosoś (filet)', c: 'Mięso i ryby', ways: { steam: w('8–10 min', 9), oven: w('12–15 min', 13, '200 °C'), fryer: w('9 min', 9, 'AIR FRY 190 °C') }, note: 'W środku 63 °C.' },
  { id: 'parowki', n: 'Parówki', c: 'Mięso i ryby', ways: { pot: w('5 min w gorącej wodzie (nie gotuj)', 5), fryer: w('10 min', 10, 'AIR FRY 200 °C (kiełbasa)') } },
];
export const FOOD_CATEGORIES = ['Wszystkie', 'Ziemniaki', 'Warzywa', 'Kasze i ryż', 'Makaron', 'Strączkowe', 'Mięso i ryby'];

// ---- Measures ----------------------------------------------------------------------------
/** Polish kitchen standard: 1 szklanka = 250 ml, 1 łyżka = 15 ml, 1 łyżeczka = 5 ml (bez czubka). */
export const ML = { szklanka: 250, lyzka: 15, lyzeczka: 5 } as const;
export interface Ingredient { id: string; n: string; cup: number; kind: 'liquid' | 'dry' }
/** `cup` = grams in one level 250 ml glass. Approximate (±10%): packing and humidity change it. */
export const INGREDIENTS: Ingredient[] = [
  { id: 'woda', n: 'Woda', cup: 250, kind: 'liquid' }, { id: 'mleko', n: 'Mleko', cup: 255, kind: 'liquid' },
  { id: 'smietana', n: 'Śmietana', cup: 245, kind: 'liquid' }, { id: 'jogurt', n: 'Jogurt naturalny', cup: 250, kind: 'liquid' },
  { id: 'olej', n: 'Olej', cup: 230, kind: 'liquid' }, { id: 'oliwa', n: 'Oliwa z oliwek', cup: 225, kind: 'liquid' },
  { id: 'miod', n: 'Miód', cup: 340, kind: 'liquid' }, { id: 'maslo', n: 'Masło (roztopione)', cup: 230, kind: 'liquid' },
  { id: 'cukier', n: 'Cukier kryształ', cup: 220, kind: 'dry' }, { id: 'puder', n: 'Cukier puder', cup: 130, kind: 'dry' },
  { id: 'brazowy', n: 'Cukier brązowy', cup: 190, kind: 'dry' }, { id: 'maka', n: 'Mąka pszenna', cup: 150, kind: 'dry' },
  { id: 'skrobia', n: 'Skrobia ziemniaczana', cup: 160, kind: 'dry' }, { id: 'kukurydziana', n: 'Mąka kukurydziana', cup: 150, kind: 'dry' },
  { id: 'kakao', n: 'Kakao', cup: 100, kind: 'dry' }, { id: 'sol', n: 'Sól', cup: 300, kind: 'dry' },
  { id: 'proszek', n: 'Proszek do pieczenia', cup: 200, kind: 'dry' }, { id: 'soda', n: 'Soda oczyszczona', cup: 250, kind: 'dry' },
  { id: 'ryz', n: 'Ryż', cup: 200, kind: 'dry' }, { id: 'gryczana', n: 'Kasza gryczana', cup: 170, kind: 'dry' },
  { id: 'jaglana', n: 'Kasza jaglana', cup: 190, kind: 'dry' }, { id: 'manna', n: 'Kasza manna', cup: 180, kind: 'dry' },
  { id: 'platki', n: 'Płatki owsiane', cup: 90, kind: 'dry' }, { id: 'bulka', n: 'Bułka tarta', cup: 120, kind: 'dry' },
  { id: 'mak', n: 'Mak', cup: 150, kind: 'dry' }, { id: 'orzechy', n: 'Orzechy włoskie (siekane)', cup: 110, kind: 'dry' },
  { id: 'rodzynki', n: 'Rodzynki', cup: 160, kind: 'dry' }, { id: 'wiorki', n: 'Wiórki kokosowe', cup: 80, kind: 'dry' },
  { id: 'soczewica', n: 'Soczewica', cup: 190, kind: 'dry' }, { id: 'ser', n: 'Ser żółty (tarty)', cup: 100, kind: 'dry' },
];
export type Unit = 'szklanka' | 'lyzka' | 'lyzeczka' | 'ml' | 'g' | 'dag' | 'kg';
export const UNITS: { id: Unit; n: string }[] = [
  { id: 'szklanka', n: 'szklanka (250 ml)' }, { id: 'lyzka', n: 'łyżka (15 ml)' }, { id: 'lyzeczka', n: 'łyżeczka (5 ml)' },
  { id: 'ml', n: 'ml' }, { id: 'g', n: 'g' }, { id: 'dag', n: 'dag' }, { id: 'kg', n: 'kg' },
];
/** Grams per millilitre for an ingredient. */
export const density = (i: Ingredient) => i.cup / ML.szklanka;
export interface Converted { szklanka: number; lyzka: number; lyzeczka: number; ml: number; g: number; dag: number; kg: number }
export function convert(i: Ingredient, amount: number, unit: Unit): Converted {
  const d = density(i);
  let ml: number;
  switch (unit) {
    case 'szklanka': ml = amount * ML.szklanka; break;
    case 'lyzka': ml = amount * ML.lyzka; break;
    case 'lyzeczka': ml = amount * ML.lyzeczka; break;
    case 'ml': ml = amount; break;
    case 'g': ml = amount / d; break;
    case 'dag': ml = amount * 10 / d; break;
    case 'kg': ml = amount * 1000 / d; break;
  }
  const g = ml * d;
  return { szklanka: ml / ML.szklanka, lyzka: ml / ML.lyzka, lyzeczka: ml / ML.lyzeczka, ml, g, dag: g / 10, kg: g / 1000 };
}
/** Compact number for display: no trailing zeros, comma as decimal separator. */
export function num(v: number, digits = 1): string {
  if (!Number.isFinite(v)) return '—';
  const r = Math.round(v * 10 ** digits) / 10 ** digits;
  return String(r).replace('.', ',');
}
/** Round to a sensible kitchen precision: 1 g under 100 g, 5 g above. */
export const kitchenGrams = (g: number) => g < 100 ? Math.round(g) : Math.round(g / 5) * 5;

// ---- Temperatures ------------------------------------------------------------------------
export const cToF = (c: number) => c * 9 / 5 + 32;
export const fToC = (f: number) => (f - 32) * 5 / 9;
export const OVEN_C = [120, 140, 160, 170, 180, 190, 200, 220, 230, 250];
export const OVEN_NOTES: [string, string][] = [
  ['Piekarnik z termoobiegiem', 'Obniż temperaturę o ok. 20 °C względem przepisu na tryb góra-dół.'],
  ['Przepis z piekarnika → Air Fryer', 'Obniż temperaturę o ok. 20 °C i skróć czas o ok. 20%.'],
];
