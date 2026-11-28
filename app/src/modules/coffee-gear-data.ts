// Coffee gear catalogue: 5 popular electric grinders, 5 popular hand grinders, 5 popular portafilter machines
// and the Lelit range (3 grinders, 10 machines, two of them with a built-in grinder).
// Specifications come from manufacturer pages and retailer spec sheets (see `sources`, checked 28.11.2026).
// Service intervals are general home-use guidance, not manufacturer guarantees: the user can change them,
// and the manual of the exact machine always wins. Nothing here talks to a device.

export interface GearSpec { label: string; value: string }
export interface ServiceTask { id: string; title: string; detail: string; everyDays: number }
export interface GearSource { label: string; url: string }
export interface CoffeeGear {
  id: string; kind: 'grinder' | 'machine'; /** Grinders only: electric or hand grinder. */ drive?: 'electric' | 'manual'; /** Lelit products are grouped separately in the picker. */ brand?: 'lelit'; name: string; short: string; tagline: string;
  specs: GearSpec[];
  /** How to start espresso with this device (dose, ratio, grind start point). */
  espresso: string[];
  service: ServiceTask[];
  notes?: string[];
  sources: GearSource[];
}

// Shared service tasks (general guidance for home use, intervals in days).
const groupBrush: ServiceTask = { id: 'group-brush', title: 'Szczotka grupy i uszczelki', detail: 'Po sesji przetrzyj sitko prysznica i uszczelkę szczotką do grupy, przepłucz grupę wodą.', everyDays: 1 };
const backflushWater: ServiceTask = { id: 'backflush-water', title: 'Płukanie wsteczne wodą', detail: 'Ślepe sitko, 5 × 10 s włącz/wyłącz. Tylko w ekspresach z zaworem trójdrożnym (3-way).', everyDays: 2 };
const backflushDetergent: ServiceTask = { id: 'backflush-detergent', title: 'Płukanie wsteczne z detergentem', detail: 'Ślepe sitko z proszkiem do ekspresów (np. Cafiza, Cafetto), potem płukanie samą wodą. W domu zwykle co 2–4 tygodnie.', everyDays: 21 };
const soakBaskets: ServiceTask = { id: 'soak', title: 'Moczenie kolby i sitek', detail: 'Kolbę bez rączki i sitka namocz w roztworze środka do ekspresów, wypłucz.', everyDays: 14 };
const descale = (days: number, how: string): ServiceTask => ({ id: 'descale', title: 'Odkamienianie', detail: `${how} Częstotliwość zależy od twardości wody: z filtrem lub miękką wodą rzadziej.`, everyDays: days });
const gasket: ServiceTask = { id: 'gasket', title: 'Uszczelka grupy (wymiana)', detail: 'Sprawdzaj co pół roku: twarda, spłaszczona albo przeciekająca uszczelka do wymiany. Profilaktycznie raz w roku.', everyDays: 365 };
const showerScreen: ServiceTask = { id: 'screen', title: 'Sitko prysznica: zdjęcie i mycie', detail: 'Odkręć sitko prysznica, namocz w środku do ekspresów, oczyść grupę. Wymień, gdy jest odkształcone.', everyDays: 90 };
const steamWand: ServiceTask = { id: 'wand', title: 'Dysza parowa', detail: 'Przed i po spienianiu: przedmuch parą i przetarcie wilgotną ściereczką. Raz w tygodniu odetkaj otwory igłą lub narzędziem z zestawu.', everyDays: 7 };
const burrBrush: ServiceTask = { id: 'burr-brush', title: 'Czyszczenie żaren i komory', detail: 'Zdejmij górne żarno, usuń resztki i olej pędzelkiem lub odkurzaczem. Bez wody.', everyDays: 30 };
const deepGrinder: ServiceTask = { id: 'grinder-deep', title: 'Przegląd młynka', detail: 'Rozbierz komorę mielenia, oczyść oba żarna i kanał wylotowy, sprawdź punkt zerowy.', everyDays: 150 };
const sageFilter: ServiceTask = { id: 'water-filter', title: 'Wymiana filtra wody', detail: 'Wkład filtra w zbiorniku (Claro Swiss) wymieniaj zgodnie z instrukcją, zwykle co ok. 3 miesiące.', everyDays: 90 };
const sageClean: ServiceTask = { id: 'clean-cycle', title: 'Cykl czyszczenia (krążek + tabletka)', detail: 'Gumowy krążek w sitku, tabletka czyszcząca, program czyszczenia z instrukcji. Rób, gdy zapali się kontrolka czyszczenia.', everyDays: 30 };

const handClean: ServiceTask = { id: 'burr-brush', title: 'Czyszczenie żaren', detail: 'Rozkręć młynek, usuń resztki pędzelkiem i dmuchawką. Bez wody i bez mycia.', everyDays: 30 };
const handZero: ServiceTask = { id: 'zero', title: 'Kontrola punktu zerowego', detail: 'Po rozkręceniu sprawdź, czy zero na tarczy zgadza się z zamkniętymi żarnami.', everyDays: 90 };
export const GRINDERS: CoffeeGear[] = [
  {
    id: 'eureka-specialita', kind: 'grinder', drive: 'electric', name: 'Eureka Mignon Specialità', short: 'Mignon Specialità',
    tagline: 'Elektryczny, płaskie żarna 55 mm, bardzo cichy, dozowanie czasowe',
    specs: [
      { label: 'Żarna', value: 'płaskie 55 mm, stal hartowana' },
      { label: 'Żywotność żaren', value: 'ok. 300 kg kawy (wg producenta)' },
      { label: 'Regulacja', value: 'bezstopniowa, mikrometryczna (pokrętło)' },
      { label: 'Silnik', value: '1350 obr./min, 310 W' },
      { label: 'Wydajność', value: '1,8–2,5 g/s espresso, 2,5–3,5 g/s przelew' },
      { label: 'Zasobnik', value: '300 g (opcja 510 g)' },
      { label: 'Dozowanie', value: 'dotykowy ekran: 2 dawki na czas + tryb ciągły' },
      { label: 'Wymiary / waga', value: '12 × 14 × 35 cm, 5,6 kg' },
    ],
    espresso: [
      'Kręć regulacją tylko przy włączonym silniku: w prawo drobniej, w lewo grubiej.',
      'Najpierw ustaw czas dawki tak, by wychodziło 18 g (≈ 9–11 s), potem koryguj tylko grubość.',
      'Start: 18 g → 36 g w 25–30 s. Za szybko = drobniej, za wolno = grubiej, małymi kreskami.',
    ],
    service: [burrBrush, deepGrinder, { id: 'burr-life', title: 'Kontrola zużycia żaren', detail: 'Żarna na ok. 300 kg kawy. Przy 15 g dziennie to wiele lat; wymień, gdy mimo regulacji ekstrakcja „ucieka”.', everyDays: 365 }],
    sources: [
      { label: 'Eureka: Mignon Specialità (dane techniczne)', url: 'https://www.eureka.co.it/en/products/eureka+1920/mignon+grinders/silent+range/20/' },
      { label: 'Eureka: katalog (prędkość, moc, wydajność)', url: 'https://www.eureka.co.it/en/catalogo/prodotti/macinacaff%C3%A8+on+demand/1/20.aspx' },
    ],
  },
  {
    id: 'niche-zero', kind: 'grinder', drive: 'electric', name: 'Niche Zero', short: 'Niche Zero',
    tagline: 'Elektryczny, stożkowe żarna 63 mm, single dose, prawie bez retencji',
    specs: [
      { label: 'Żarna', value: 'stożkowe 63 mm, stal hartowana' },
      { label: 'Regulacja', value: 'bezstopniowa tarcza' },
      { label: 'Silnik', value: 'DC z przekładnią, ok. 330 obr./min' },
      { label: 'Wydajność', value: 'ok. 1 g/s (espresso)' },
      { label: 'Głośność', value: 'ok. 72 dB' },
      { label: 'Zasyp', value: 'single dose, lejek do ok. 50 g' },
      { label: 'Waga', value: '4,1 kg' },
    ],
    espresso: [
      'Waż ziarno przed mieleniem (np. 18 g): co wsypiesz, to wychodzi.',
      'Zakres espresso jest w dolnej części tarczy; pierwszy shot zrób w środku tego zakresu i koryguj o 1–2 kreski.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder],
    sources: [
      { label: 'Niche Coffee: Niche Zero (cechy i parametry)', url: 'https://nichecoffee.co.uk/features' },
      { label: 'Pull & Pour: pojemność lejka ok. 50 g', url: 'https://pullandpourcoffee.com/niche-zero-grinder-review/' },
      { label: 'Home-Barista: recenzja (330 obr./min)', url: 'https://home-barista.com/reviews/niche-zero-grinder-review-t57516.html' },
    ],
  },
  {
    id: 'df64-gen2', kind: 'grinder', drive: 'electric', name: 'DF64 Gen 2 (Turin)', short: 'DF64 Gen 2',
    tagline: 'Elektryczny, płaskie żarna 64 mm, single dose, mieszek do wydmuchu',
    specs: [
      { label: 'Żarna', value: 'płaskie 64 mm (stalowe lub DLC, wymienne np. na SSP)' },
      { label: 'Regulacja', value: 'bezstopniowa, 90 oznaczonych punktów' },
      { label: 'Silnik', value: '250 W, stałe 1400 obr./min' },
      { label: 'Retencja', value: 'ok. 0,2 g z mieszkiem' },
      { label: 'Dodatki', value: 'jonizator przeciw elektryzowaniu, kubek dozujący 58 mm' },
      { label: 'Wymiary / waga', value: '20 × 10 × 33 cm, ok. 3,9 kg' },
    ],
    espresso: [
      'Najpierw ustal punkt zerowy: przy pracującym silniku zbliżaj żarna do pierwszego „szurania”, cofnij i zapisz tę pozycję.',
      'Espresso zwykle kilkanaście kresek od zera; po każdym mieleniu użyj mieszka.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder, { id: 'zero', title: 'Kontrola punktu zerowego', detail: 'Sprawdź, czy zero na tarczy zgadza się z dotknięciem żaren; po czyszczeniu skalibruj ponownie.', everyDays: 90 }],
    sources: [
      { label: 'Homegrounds: DF64 Gen 2 (250 W, 1400 obr./min)', url: 'https://www.homegrounds.co/turin-df64-coffee-grinder-review/' },
      { label: 'Clive Coffee: DF64 Gen 2 (90 punktów, mieszek)', url: 'https://clivecoffee.com/products/turin-df64-gen-2-5-single-dose-coffee-grinder' },
      { label: 'Home Coffee Solutions: retencja, wymiary', url: 'https://www.homecoffeesolutions.com/products/df64-gen2-single-dose-coffee-grinder-with-dlc-burrs-black?country=CA' },
    ],
  },
  {
    id: 'sage-sgp', kind: 'grinder', drive: 'electric', name: 'Sage Smart Grinder Pro', short: 'Smart Grinder Pro',
    tagline: 'Elektryczny, stożkowe żarna, 60 ustawień, dozowanie na czas co 0,2 s',
    specs: [
      { label: 'Żarna', value: 'stożkowe, stal nierdzewna (ok. 40 mm)' },
      { label: 'Regulacja', value: '60 ustawień, od espresso po french press' },
      { label: 'Moc', value: '165 W' },
      { label: 'Zasobnik', value: '450 g, zdejmowany' },
      { label: 'Dozowanie', value: 'Dosing IQ, czas programowany co 0,2 s' },
      { label: 'W zestawie', value: 'kołyski kolby 50–54 mm i 58 mm, pojemnik na zmieloną kawę' },
      { label: 'Wymiary', value: '21,4 × 16 × 38,9 cm' },
    ],
    espresso: [
      'Espresso to najdrobniejsza część skali; zacznij w środku zakresu „espresso” z instrukcji i schodź po 1 ustawieniu.',
      'Ustaw czas dawki tak, by wychodziło ok. 18 g (zważ pierwsze dawki).',
      'Z kolbą 54 mm (Sage) dawka 18–19 g, z 58 mm 18 g.',
    ],
    service: [burrBrush, deepGrinder],
    notes: ['Do bardzo drobnego espresso część użytkowników przestawia górne żarno (kalibracja z instrukcji).'],
    sources: [
      { label: 'Sage: Smart Grinder Pro (dane techniczne)', url: 'https://www.sageappliances.com/ie/en/products/coffee/bcg820.html' },
      { label: 'Currys: specyfikacja (165 W, 60 ustawień)', url: 'https://www.currys.co.uk/products/sage-the-smart-grinder-pro-scg820bst-electric-coffee-grinder-black-stainless-steel-10224779.html' },
    ],
  },
  {
    id: '1zpresso-jultra', kind: 'grinder', drive: 'manual', name: '1Zpresso J-Ultra', short: 'J-Ultra',
    tagline: 'Ręczny, stożkowe żarna 48 mm, 8 µm na klik, zewnętrzna tarcza',
    specs: [
      { label: 'Żarna', value: 'stożkowe 48 mm, heptagonalne, powlekane (do espresso)' },
      { label: 'Regulacja', value: 'zewnętrzny pierścień, 100 klików na obrót, 8 µm na klik' },
      { label: 'Pojemność', value: '35–40 g' },
      { label: 'Waga', value: 'ok. 670–700 g' },
      { label: 'Odbiornik', value: 'magnetyczny pojemnik na kawę' },
    ],
    espresso: [
      'Licz od zera (żarna zamknięte); tolerancja zera to ok. ±10 klików.',
      'Espresso zwykle ok. 1,8–3,0 obrotu, przelew ok. 4,0–6,0 obrotu.',
      'Koryguj po 2–5 klików; start 18 g → 36 g w 25–30 s.',
    ],
    service: [{ id: 'burr-brush', title: 'Czyszczenie żaren', detail: 'Rozkręć młynek, usuń resztki pędzelkiem i dmuchawką z zestawu. Bez wody i bez mycia.', everyDays: 30 }, { id: 'zero', title: 'Kontrola punktu zerowego', detail: 'Po rozkręceniu sprawdź, czy zero na tarczy zgadza się z zamkniętymi żarnami.', everyDays: 90 }],
    sources: [
      { label: '1Zpresso: J-Ultra', url: 'https://1zpresso.coffee/products/j-ultra' },
      { label: 'Alternative Brewing: specyfikacja', url: 'https://alternativebrewing.com.au/products/1zpresso-j-ultra-coffee-grinder' },
      { label: 'Balance Journal: zakres espresso w obrotach', url: 'https://www.balancejournal.co/food-drink/1zpresso-j-ultra-review' },
      { label: 'Complete Home Barista: tolerancja zera ±10 klików', url: 'https://completehomebarista.com/guides/1zpresso-j-ultra-vs-j-max-what-changes-for-espresso/' },
    ],
  },
  {
    id: 'baratza-encore-esp', kind: 'grinder', drive: 'electric', name: 'Baratza Encore ESP', short: 'Encore ESP',
    tagline: 'Elektryczny, stożkowe żarna 40 mm M2, 20 nastaw espresso + 20 do przelewu',
    specs: [
      { label: 'Żarna', value: 'stożkowe 40 mm M2, stal' },
      { label: 'Regulacja', value: '40 kroków: 1–20 mikro (espresso), 21–40 makro (przelew)' },
      { label: 'Silnik', value: 'DC z przekładnią, ok. 550 obr./min' },
      { label: 'Wydajność', value: '1,5–2,4 g/s' },
      { label: 'Zasobnik', value: 'ok. 230 g' },
      { label: 'W zestawie', value: 'kubek dozujący z adapterem 58 mm' },
    ],
    espresso: [
      'Do espresso używaj nastaw 1–20 i kubka dozującego z zestawu.',
      'Zacznij w połowie zakresu espresso (ok. 10) i koryguj o 1–2 kroki.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder],
    sources: [
      { label: 'Baratza: Encore ESP karta produktu', url: 'https://cdn.shopify.com/s/files/1/0613/6823/8314/files/Baratza_EncoreESP_ProductSheet_v2.2_EN.pdf' },
      { label: 'Eight Ounce Coffee: specyfikacja', url: 'https://www.eightouncecoffee.ca/products/baratza-encore-esp-coffee-grinder' },
      { label: 'Seattle Coffee Gear: zakresy nastaw', url: 'https://www.seattlecoffeegear.com/pages/product-resources/baratza-encore-esp-coffee-and-espresso-grinder-product-guide' },
    ],
  },
  {
    id: 'comandante-c40', kind: 'grinder', drive: 'manual', name: 'Comandante C40 MK4', short: 'Comandante C40',
    tagline: 'Ręczny, stożkowe żarna Nitro Blade 39 mm, ok. 30 µm na klik',
    specs: [
      { label: 'Żarna', value: 'stożkowe 39 mm Nitro Blade, stal wysokoazotowa' },
      { label: 'Regulacja', value: 'kliki pod żarnem, ok. 25–30 µm na klik (Red Clix: 15 µm)' },
      { label: 'Pojemność', value: 'ok. 40 g' },
      { label: 'Waga', value: 'ok. 600–730 g' },
      { label: 'Odbiornik', value: 'dwa słoiki (szkło brązowe i polimer)' },
    ],
    espresso: [
      'Licz kliki od zamkniętych żaren.',
      'Bez Red Clix kroki są duże dla espresso; dopasuj też dawkę lub czas, gdy jeden klik to za dużo.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [handClean, handZero],
    sources: [
      { label: "Tom's Guide: specyfikacja C40 MK4", url: 'https://tomsguide.com/home/home-appliances/comandante-c40-mk4-review' },
      { label: 'Ozone Coffee: pojemność i kliki', url: 'https://ozonecoffee.co.uk/products/comandante-c40-nitro-mk4-black' },
    ],
  },
  {
    id: '1zpresso-kultra', kind: 'grinder', drive: 'manual', name: '1Zpresso K-Ultra', short: 'K-Ultra',
    tagline: 'Ręczny, stożkowe żarna 48 mm, 20 µm na klik, numerowana tarcza',
    specs: [
      { label: 'Żarna', value: 'stożkowe 48 mm, heptagonalne „K Burr”, stal' },
      { label: 'Regulacja', value: 'zewnętrzny pierścień, 100 klików na obrót, 20 µm na klik' },
      { label: 'Pojemność', value: '35–40 g' },
      { label: 'Waga', value: 'ok. 700 g' },
      { label: 'Odbiornik', value: 'magnetyczny pojemnik na kawę' },
    ],
    espresso: [
      'Zapisuj nastawę z tarczy (np. 1.4 = obrót 1, cyfra 4).',
      'Zakres espresso to dolna część pierwszego obrotu i początek drugiego; koryguj po 1–2 kliki.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [handClean, handZero],
    sources: [
      { label: '1Zpresso: K-Ultra', url: 'https://1zpresso.coffee/product/kultra/ref/oriffee/' },
      { label: 'JB Hi-Fi: specyfikacja', url: 'https://www.jbhifi.com.au/products/1zpresso-k-ultra-coffee-grinder-iron-grey' },
    ],
  },
  {
    id: 'kingrinder-k6', kind: 'grinder', drive: 'manual', name: 'KINGrinder K6', short: 'KINGrinder K6',
    tagline: 'Ręczny, stożkowe żarna 48 mm, 16 µm na klik, zewnętrzna tarcza',
    specs: [
      { label: 'Żarna', value: 'stożkowe 48 mm, heptagonalne, stal nierdzewna' },
      { label: 'Regulacja', value: 'zewnętrzny pierścień, 60 klików na obrót, 16 µm na klik' },
      { label: 'Pojemność', value: '30–35 g' },
      { label: 'Waga', value: 'ok. 630 g' },
      { label: 'Korpus', value: 'aluminium' },
    ],
    espresso: [
      'Licz kliki od zamkniętych żaren.',
      'Espresso zwykle w okolicy 30–50 klików od zera; koryguj o 1–2 kliki.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [handClean, handZero],
    sources: [
      { label: 'Sigma Coffee: KINGrinder K6', url: 'https://sigmacoffee.co.uk/products/kingrinder-k6' },
      { label: 'The Basic Barista: specyfikacja', url: 'https://thebasicbarista.com/products/kingrinder-k6-coffee-grinder' },
      { label: 'Front Desk Review: zakres klików espresso', url: 'https://frontdeskreview.com/product/coffee-grinders/kingrinder-k6/' },
    ],
  },
  {
    id: 'timemore-c3-esp', kind: 'grinder', drive: 'manual', name: 'Timemore Chestnut C3 ESP', short: 'Timemore C3 ESP',
    tagline: 'Ręczny, stożkowe żarna S2C 38 mm, 30 klików na obrót, budżetowy',
    specs: [
      { label: 'Żarna', value: 'stożkowe 38 mm S2C660, stal SUS420' },
      { label: 'Regulacja', value: 'wewnętrzna tarcza, 30 klików na obrót, ok. 23 µm na klik' },
      { label: 'Pojemność', value: 'do 25 g' },
      { label: 'Waga', value: 'ok. 430–530 g' },
      { label: 'Korpus', value: 'aluminium' },
    ],
    espresso: [
      'Licz kliki od zamkniętych żaren; zakres espresso to mniej więcej pierwszy obrót.',
      'Pojemność do 25 g wystarcza na jedną podwójną dawkę.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [handClean, handZero],
    sources: [
      { label: 'Timemore: Chestnut C3 ESP', url: 'https://www.timemore.com/products/timemore-chestnut-c3-esp-manual-coffee-grinder-1' },
      { label: 'Slow Pour Supply: porównanie serii C', url: 'https://www.slowpoursupply.co/pages/timemore-chestnut-c-series-model-comparison' },
      { label: 'Sigma Coffee: specyfikacja', url: 'https://sigmacoffee.co.uk/products/chestnut-c3-esp' },
    ],
  },
];

export const MACHINES: CoffeeGear[] = [
  {
    id: 'gaggia-classic', kind: 'machine', name: 'Gaggia Classic Pro E24', short: 'Gaggia Classic',
    tagline: 'Jeden kocioł mosiężny, kolba 58 mm, zawór 3-drożny, bez PID',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł do kawy i pary, mosiężny (poprzednik Evo Pro: aluminiowy, ok. 105 ml roboczych)' },
      { label: 'Kolba', value: '58 mm, stal nierdzewna, profesjonalna' },
      { label: 'Ciśnienie', value: 'pompa wibracyjna 15 bar (nominalnie); zawór OPV ok. 9 bar w wersjach z USA, w UE sprawdź swój egzemplarz' },
      { label: 'Temperatura', value: 'termostat, bez PID' },
      { label: 'Zawór', value: '3-drożny (suchy „puck”, można płukać wstecznie)' },
      { label: 'Zbiornik', value: '2,1 l' },
      { label: 'Moc', value: '1200 W (230 V)' },
      { label: 'Nagrzewanie', value: 'kocioł ok. 5 min, grupa i kolba dłużej (ok. 15–20 min)' },
    ],
    espresso: [
      'Sitko niepresuryzowane 2-shot: 18 g → 36 g w 25–30 s.',
      'Bez PID: przed shotem spuść chwilę wodę z grupy, aż zgaśnie i zapali się lampka gotowości (temperature surfing).',
      'Po spienianiu mleka zrzuć wodę przez grupę, zanim zrobisz kolejny shot.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, steamWand, showerScreen, gasket, descale(60, 'Ręcznie, środkiem do odkamieniania wg instrukcji Gaggii (producent podaje co 2 miesiące).')],
    sources: [
      { label: 'Gaggia: Classic E24 (moc, kocioł, odkamienianie)', url: 'https://www.gaggia.com/manual-machines/new-classic-e24/' },
      { label: 'CoffeeGeek: Classic Evo Pro (kocioł 105 ml, zbiornik 2,1 l)', url: 'https://coffeegeek.com/reviews/firstlooks/gaggia-classic-evo-pro-espresso-machine-first-look/' },
      { label: 'Whole Latte Love: Classic Evo Pro (58 mm, 9 bar)', url: 'https://wholelattelove.com/products/gaggia-classic-pro-in-venetian-red' },
    ],
  },
  {
    id: 'rancilio-silvia', kind: 'machine', name: 'Rancilio Silvia V6', short: 'Rancilio Silvia',
    tagline: 'Kocioł 0,3 l z mosiądzu, kolba 58 mm, mocna para, bez PID (wersja E)',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,3 l, mosiądz, izolowany' },
      { label: 'Kolba', value: '58 mm, chromowany mosiądz (jak w maszynach Rancilio do kawiarni)' },
      { label: 'Pompa', value: 'wibracyjna' },
      { label: 'Temperatura', value: 'termostat (Silvia E V6); wersja Pro X ma PID i dwa kotły' },
      { label: 'Zawór', value: '3-drożny' },
      { label: 'Zbiornik', value: 'ok. 2 l' },
      { label: 'Moc', value: 'ok. 950–1100 W zależnie od wersji napięcia' },
      { label: 'Nagrzewanie', value: 'ok. 6–10 min, lepiej 20 min z kolbą w grupie' },
    ],
    espresso: [
      '18 g → 36 g w 25–30 s, sitko 2-shot.',
      'Bez PID: ustaw stały rytuał (np. spust wody do zgaśnięcia lampki, odczekaj 30 s), żeby temperatura była powtarzalna.',
      'Para jest mocna: przełącz na parę, poczekaj na lampkę, potem spieniaj.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, steamWand, showerScreen, gasket, descale(120, 'Wg instrukcji Rancilio; przy twardej wodzie używaj filtrowanej.')],
    sources: [
      { label: 'Seattle Coffee Gear: Silvia (kocioł 0,3 l, 1100 W)', url: 'https://www.seattlecoffeegear.com/staff-picks/rancilio-silvia-espresso-machine' },
      { label: 'Coffee Blog: Silvia E V6 (zbiornik, kocioł, 3-way)', url: 'https://coffeeblog.co.uk/rancilio-silvia-review/' },
      { label: 'Galaxus: Silvia V6 (wersja 230 V)', url: 'https://www.galaxus.ch/en/s2/product/rancilio-silvia-v6-espresso-machines-12446859' },
    ],
  },
  {
    id: 'sage-barista-express', kind: 'machine', name: 'Sage Barista Express (BES875)', short: 'Barista Express',
    tagline: 'Ekspres z wbudowanym młynkiem, Thermocoil z PID 93 °C, kolba 54 mm',
    specs: [
      { label: 'Ogrzewanie', value: 'Thermocoil 1600 W z PID, woda ok. 93 °C' },
      { label: 'Kolba', value: '54 mm, stal nierdzewna, sitka pojedyncze i podwójne ścianki' },
      { label: 'Ciśnienie', value: 'pompa 15 bar, ekstrakcja ok. 9 bar, manometr' },
      { label: 'Młynek', value: 'wbudowany, stożkowe żarna stalowe, 16 ustawień' },
      { label: 'Zasobnik / zbiornik', value: '250 g ziaren / 2 l wody z filtrem' },
      { label: 'Moc', value: '1850 W' },
      { label: 'Wymiary / waga', value: 'ok. 33 × 31 × 40 cm (szer. × gł. × wys., wg sprzedawcy), ok. 10,6 kg' },
    ],
    espresso: [
      'Sitko jednościenne 2-shot, ok. 18 g; nadmiar zbierz narzędziem Razor.',
      'Manometr: celuj w środek strefy espresso. Za nisko = drobniej, za wysoko = grubiej.',
      'Start: 18 g → ok. 36 g w 25–30 s.',
    ],
    service: [groupBrush, sageClean, sageFilter, steamWand, burrBrush, gasket, descale(90, 'Program odkamieniania z instrukcji Sage.')],
    notes: ['Sitka z podwójnymi ściankami (presuryzowane) są do kawy mielonej fabrycznie. Do świeżej kawy używaj jednościennych.'],
    sources: [
      { label: 'Sage: Barista Express (Thermocoil, 16 ustawień, 54 mm)', url: 'https://sageappliances.com/eu/en/products/microwaves/bes875.html' },
      { label: 'Sage: PID 93 °C', url: 'https://sageappliances.com/no/en/products/espresso/bes875.html' },
      { label: 'Currys: specyfikacja (1850 W, 2 l, 15 bar / 9 bar, wymiary)', url: 'https://www.currys.co.uk/product/10174955.html' },
    ],
  },
  {
    id: 'sage-bambino-plus', kind: 'machine', name: 'Sage Bambino Plus (SES500)', short: 'Bambino Plus',
    tagline: 'ThermoJet gotowy w 3 s, PID, automatyczne spienianie mleka, kolba 54 mm',
    specs: [
      { label: 'Ogrzewanie', value: 'ThermoJet, temperatura ekstrakcji w 3 s, PID' },
      { label: 'Kolba', value: '54 mm, dawka 18–19 g' },
      { label: 'Ciśnienie', value: 'pompa 15 bar, preinfuzja niskim ciśnieniem, ekstrakcja 9 bar' },
      { label: 'Mleko', value: 'automatyczne spienianie, regulacja temperatury i tekstury' },
      { label: 'Po parze', value: 'auto purge: system sam się schładza przed kolejną kawą' },
      { label: 'Zbiornik', value: '1,9 l' },
      { label: 'Moc', value: '1300–1600 W' },
      { label: 'Wymiary / waga', value: 'ok. 19,5 × 32 × 31 cm (szer. × gł. × wys.), 4,95 kg' },
    ],
    espresso: [
      'W zestawie są sitka z podwójnymi ściankami. Ze świeżo mieloną kawą lepiej działają jednościenne 54 mm (dokup).',
      'Start: 18 g → 36 g w 25–30 s (przycisk 2 Cup, potem zatrzymaj ręcznie na wadze).',
      'Dzbanek na czujniku temperatury: nie wycieraj czujnika na sucho z mlekiem, tylko wilgotną ściereczką.',
    ],
    service: [groupBrush, sageClean, sageFilter, steamWand, gasket, descale(90, 'Program odkamieniania z instrukcji Sage.')],
    sources: [
      { label: 'Sage: Bambino Plus (ThermoJet, 15 bar, PID, 1,9 l)', url: 'https://sageappliances.com/dk/en/products/product/bes500.html' },
      { label: 'Currys: specyfikacja (wymiary, waga, 9 bar)', url: 'https://www.currys.co.uk/products/sage-the-bambino-plus-ses500-coffee-machine-black-stainless-steel-10224960.html' },
      { label: 'Costco UK: preinfuzja, auto purge', url: 'https://costco.co.uk/Appliances-Security/Commercial-Kitchen/Coffee-Machines/p/399351' },
    ],
  },
  {
    id: 'delonghi-dedica', kind: 'machine', name: "De'Longhi Dedica Style EC685", short: 'Dedica EC685',
    tagline: 'Wąski (15 cm), termoblok, kolba 51 mm, sitka presuryzowane i saszetki ESE',
    specs: [
      { label: 'Ogrzewanie', value: 'termoblok, nagrzewanie ok. 40 s' },
      { label: 'Kolba', value: '51 mm, sitka presuryzowane 1 i 2 filiżanki, wkład ESE' },
      { label: 'Ciśnienie', value: 'pompa 15 bar' },
      { label: 'Mleko', value: 'regulowana dysza „Adjustable Cappuccino System”' },
      { label: 'Zbiornik', value: '1,1 l' },
      { label: 'Moc', value: '1300 W' },
      { label: 'Wymiary / waga', value: '14,9 × 33 × 30,5 cm, ok. 4,2 kg; filiżanki do 12 cm' },
      { label: 'Serwis', value: 'wskaźnik odkamieniania, twardość wody do ustawienia' },
    ],
    espresso: [
      'Fabryczne sitka są presuryzowane: wybaczają grubsze mielenie, ale ograniczają smak.',
      'Ze świeżą kawą: sitko niepresuryzowane 51 mm, ok. 14–16 g → 30–35 g w 25–30 s.',
      'Bez zaworu 3-drożnego: kolbę zdejmuj ostrożnie po kilku sekundach od końca ekstrakcji.',
    ],
    service: [groupBrush, soakBaskets, steamWand, { id: 'gasket', title: 'Uszczelka grupy', detail: 'Sprawdzaj raz na pół roku; przy przeciekaniu wymień.', everyDays: 365 }, descale(60, "Program odkamieniania z instrukcji (De'Longhi EcoDecalk), gdy zapali się wskaźnik.")],
    notes: ['Nie ma zaworu 3-drożnego, więc nie rób płukania wstecznego z detergentem.'],
    sources: [
      { label: "De'Longhi: Dedica Style EC685 (wymiary, 15 bar)", url: 'https://www.delonghi.com/en/pump-espresso-dedica-ec685-m/p/EC685.M' },
      { label: "De'Longhi: EC685 (zbiornik 1,1 l, 1300 W)", url: 'https://www.delonghi.com/en-ae/p/dedica-manual-espresso-makers-dedica-style-manual-coffee-maker-ec685.bk/EC685.BK.html?pid=0132106140' },
      { label: 'Karta produktu EC685 (nagrzewanie 40 s)', url: 'https://www.zajadacz.de/files/AZ/DB/EC/ec685-w.pdf' },
      { label: 'Kaffeemacher: sitka 51 mm do Dedica', url: 'https://kaffeemacher.de/en/products/sieve-51mm' },
    ],
  },
];

// Lelit (Gemme Italian Producers, Castegnato): the current home range plus the discontinued Glenda.
// Specifications from Lelit technical sheets and manuals and retailer spec sheets (checked 28.11.2026).
const lelitSoftener = (litres: number): ServiceTask => ({ id: 'softener', title: 'Filtr zmiękczający w zbiorniku', detail: `Wkład z zestawu starcza na ok. ${litres} l wody: wymień go po tej ilości (przy ok. 1 l dziennie co ${litres} dni) albo wcześniej przy twardej wodzie.`, everyDays: litres });
const lelitDescale = (days: number): ServiceTask => descale(days, 'Tylko środkiem i procedurą z instrukcji Lelit. Najlepsza ochrona to miękka lub filtrowana woda.');
const lelitBoilerCare: ServiceTask = { id: 'boiler-care', title: 'Kamień w kotłach (serwis)', detail: 'W maszynach z wymiennikiem ciepła i dwoma kotłami nie odkamieniaj kwasem samodzielnie, jeśli instrukcja tego nie opisuje. Używaj filtra zmiękczającego, a kontrolę kotłów zlecaj serwisowi.', everyDays: 365 };
const lelitWand: ServiceTask = { ...steamWand, detail: 'Przed i po spienianiu: przedmuch parą i przetarcie wilgotną ściereczką. Lanca jest wielokierunkowa z osłoną przed poparzeniem; raz w tygodniu sprawdź otworki dyszy.' };
const builtInGrinder: ServiceTask = { id: 'built-in-grinder', title: 'Wbudowany młynek: czyszczenie żaren', detail: 'Opróżnij zasobnik, zmiel resztki, zdejmij górne żarno zgodnie z instrukcją i usuń pył pędzelkiem. Bez wody.', everyDays: 30 };
const lelitGroup57 = 'LELIT57 (57 mm), akcesoria LELIT57';
const lelitGroup58 = 'LELIT58 (58 mm), akcesoria LELIT58';
const lelitSrc = { anna: { label: 'Lelit: Anna PL41TEM (karta techniczna)', url: 'https://lelit.com/wp-content/uploads/2024/09/EN-Anna-EM.pdf' } };

export const LELIT_GRINDERS: CoffeeGear[] = [
  {
    id: 'lelit-fred-prima', kind: 'grinder', drive: 'electric', brand: 'lelit', name: 'Lelit Fred Prima PL043MMI', short: 'Fred Prima',
    tagline: 'Elektryczny, stożkowe żarna 38 mm, bezstopniowy, mielenie przyciskiem kolby',
    specs: [
      { label: 'Żarna', value: 'stożkowe 38 mm' },
      { label: 'Regulacja', value: 'bezstopniowa, mikrometryczna' },
      { label: 'Dozowanie', value: 'ręczne: przycisk naciskany kolbą (bez timera)' },
      { label: 'Zasobnik', value: '250 g' },
      { label: 'Wymiary / waga', value: '12,5 × 18 × 31 cm, 2,8 kg' },
    ],
    espresso: [
      'Mielenie trwa, dopóki kolba naciska przycisk: waż dawkę (np. 18 g) i zatrzymuj się na wadze.',
      'Kręć regulacją małymi krokami; bezstopniowa skala nie ma kresek do zapamiętania, więc zapisz pozycję markerem.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder],
    sources: [
      { label: 'Lelit: Fred Prima PL043MMI (karta techniczna)', url: 'https://lelit.com/wp-content/uploads/2024/09/EN-Fred-prima.pdf' },
      { label: 'Kaffeemacher: test Fred PL043 i PL044', url: 'https://kaffeemacher.ch/en/blogs/kaffeewissen/lelit-espressomuehlen' },
    ],
  },
  {
    id: 'lelit-fred-tempo', kind: 'grinder', drive: 'electric', brand: 'lelit', name: 'Lelit Fred Tempo PL044MMT', short: 'Fred Tempo',
    tagline: 'Elektryczny, stożkowe żarna 38 mm, bezstopniowy, dozowanie elektroniczne na czas',
    specs: [
      { label: 'Żarna', value: 'stożkowe 38 mm' },
      { label: 'Regulacja', value: 'bezstopniowa, mikrometryczna' },
      { label: 'Dozowanie', value: 'elektroniczne, programowany czas' },
      { label: 'Zasobnik', value: '250 g' },
      { label: 'Obudowa', value: 'stal nierdzewna, podpórka kolby i przycisk mielenia' },
    ],
    espresso: [
      'Najpierw ustaw czas tak, by wychodziło 18 g, potem zmieniaj tylko grubość mielenia.',
      'Po zmianie grubości sprawdź dawkę na wadze: drobniejsze mielenie to mniej gramów w tym samym czasie.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder],
    sources: [
      { label: 'Lelit: Fred Tempo PL044MMT (karta techniczna)', url: 'https://www.lelit.com/wp-content/uploads/2024/09/EN-Fred-tempo.pdf' },
      { label: 'Kaffeemacher: test Fred PL043 i PL044', url: 'https://kaffeemacher.ch/en/blogs/kaffeewissen/lelit-espressomuehlen' },
    ],
  },
  {
    id: 'lelit-william', kind: 'grinder', drive: 'electric', brand: 'lelit', name: 'Lelit William PL72', short: 'Lelit William',
    tagline: 'Elektryczny, płaskie żarna 64 mm, LCC z czasem dla 1 i 2 porcji',
    specs: [
      { label: 'Żarna', value: 'płaskie 64 mm' },
      { label: 'Regulacja', value: 'mikrometryczna' },
      { label: 'Dozowanie', value: 'LCC: czas dla 1 lub 2 porcji, przycisk dosypania lub zatrzymania' },
      { label: 'Silnik', value: '150 W' },
      { label: 'Zasobnik', value: '350 g' },
      { label: 'Wymiary / waga', value: '14 × 22,5 × 38,5 cm, 6,6 kg' },
      { label: 'Wylot', value: 'regulowana wysokość rynienki i podpórki kolby' },
    ],
    espresso: [
      'Ustaw w LCC czas podwójnej dawki tak, by wychodziło 18 g; przyciskiem możesz dosypać lub przerwać.',
      'Szczegółowe ustawienia pokrętła i czasu dla metod parzenia są w zakładce Młynek (asystent Crema Lab).',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [burrBrush, deepGrinder],
    sources: [
      { label: 'Lelit: William PL72 (instrukcja, dane techniczne)', url: 'https://cdn.shopify.com/s/files/1/0590/4865/7063/files/PL72_manual.pdf' },
      { label: 'Lelit: William PL72 (strona produktu)', url: 'https://lelit.com/product/william-pl72/' },
    ],
  },
];

export const LELIT_MACHINES: CoffeeGear[] = [
  {
    id: 'lelit-anna', kind: 'machine', brand: 'lelit', name: 'Lelit Anna PL41TEM', short: 'Lelit Anna',
    tagline: 'Jeden kocioł 0,25 l z PID, grupa LELIT57, zawór 3-drożny, kompaktowa',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,25 l, mosiądz, PID' },
      { label: 'Grupa / kolba', value: lelitGroup57 },
      { label: 'Ciśnienie', value: 'pompa wibracyjna 15 bar, manometr' },
      { label: 'Zawór', value: '3-drożny (suchy placek, płukanie wsteczne)' },
      { label: 'Zbiornik', value: '2,7 l, okienko poziomu wody' },
      { label: 'Moc', value: 'ok. 1050 W' },
      { label: 'Wymiary / waga', value: '23 × 38 × 34 cm, 7,5 kg' },
    ],
    espresso: [
      'Temperaturę ustawiasz w PID; szczegóły i zielone pole manometru 8–12 bar są w zakładce asystenta Anny.',
      'Sitko 2-porcjowe LELIT57 (14–18 g): start 16–18 g → 32–36 g w 25–30 s.',
      'Po spienianiu spuść trochę wody z grupy, żeby kocioł wrócił do temperatury parzenia.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitDescale(90)],
    sources: [
      lelitSrc.anna,
      { label: 'Whole Latte Love: Anna (kocioł 0,25 l, 57 mm)', url: 'https://www.wholelattelove.com/collections/lelit/products/lelit-anna-espresso-machine' },
      { label: 'Galaxus: Anna (1050 W)', url: 'https://www.galaxus.nl/en/s2/product/lelit-anna-espresso-machines-10885765' },
    ],
  },
  {
    id: 'lelit-anita', kind: 'machine', brand: 'lelit', name: 'Lelit Anita PL042TEMD', short: 'Lelit Anita',
    tagline: 'Anna z wbudowanym młynkiem: kocioł 0,25 l, TermoPID, żarna stożkowe 38 mm',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,25 l, mosiądz, TermoPID (kawa i para)' },
      { label: 'Młynek', value: 'wbudowany, stożkowe żarna 38 mm, bezstopniowy, zasobnik ok. 150 g' },
      { label: 'Grupa / kolba', value: lelitGroup57 },
      { label: 'Ciśnienie', value: 'pompa 15 bar, manometr' },
      { label: 'Zawór', value: '3-drożny' },
      { label: 'Zbiornik', value: '2,7 l, okienka z boku i z przodu' },
      { label: 'Wymiary / waga', value: '31,5 × 36,5 × 37 cm, 10,2 kg' },
    ],
    espresso: [
      'Mielenie startuje po oparciu kolby o włącznik młynka; waż dawkę, bo młynek nie ma timera.',
      'Ubijak jest wbudowany w obudowę; ubijaj równo i zawsze tak samo mocno.',
      'Start: 16–18 g → 32–36 g w 25–30 s.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, gasket, builtInGrinder, lelitDescale(90)],
    sources: [
      { label: 'Lelit: Anita PL042TEMD (strona produktu)', url: 'https://lelit.com/product/anita-pl042temd/' },
      { label: 'Lelit: Anita (karta techniczna)', url: 'https://assets.breville.com/Lelit/PL042TEMD/Technical_sheet.pdf' },
    ],
  },
  {
    id: 'lelit-grace', kind: 'machine', brand: 'lelit', name: 'Lelit Grace PL81T', short: 'Lelit Grace',
    tagline: 'Jeden kocioł 0,25 l, LCC z PID i preinfuzją, grupa LELIT57',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,25 l, mosiądz' },
      { label: 'Sterowanie', value: 'LCC: temperatura kawy i pary, preinfuzja' },
      { label: 'Grupa / kolba', value: lelitGroup57 },
      { label: 'Ciśnienie', value: 'pompa 15 bar, manometr' },
      { label: 'Zbiornik', value: '2,5 l' },
      { label: 'Moc', value: 'ok. 1050 W' },
      { label: 'Wymiary / waga', value: '22,5 × 27 × 38 cm, 7,4 kg' },
    ],
    espresso: [
      'Temperatura parzenia w LCC: zacznij od 93–94 °C, jaśniejsze palenie cieplej.',
      'Preinfuzja z LCC wyrównuje placek; zacznij od kilku sekund.',
      'Start: 16–18 g → 32–36 g w 25–30 s.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitDescale(90)],
    sources: [
      { label: 'Lelit: katalog linii VIP (Grace PL81T)', url: 'https://cdn.shopify.com/s/files/1/0487/2015/0691/files/grinder-lelit-fred-general-including-fred-PL044MMT-catalogue.pdf' },
      { label: 'Green Plantation: Grace (0,25 l, 57 mm, 2,5 l)', url: 'https://www.greenplantation.com/p/lelit-grace-pl81t' },
    ],
  },
  {
    id: 'lelit-glenda', kind: 'machine', brand: 'lelit', name: 'Lelit Glenda PL41PLUST', short: 'Lelit Glenda',
    tagline: 'Jeden kocioł 0,3 l z PID, kolba 58 mm, wycofana z produkcji',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,3 l, mosiądz, PID' },
      { label: 'Grupa / kolba', value: '58 mm' },
      { label: 'Grzałka', value: 'ok. 1200 W' },
      { label: 'Zawór', value: '3-drożny, manometr' },
      { label: 'Zbiornik', value: '2,7 l' },
      { label: 'Status', value: 'model wycofany; części dostępne w serwisach Lelit' },
    ],
    espresso: [
      'Sitko 2-porcjowe 58 mm: start 18 g → 36 g w 25–30 s.',
      'PID: zacznij od 93–94 °C i koryguj po smaku.',
      'Po spienianiu spuść wodę z grupy, by kocioł wrócił do temperatury parzenia.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitDescale(90)],
    sources: [
      { label: '1st-line: Glenda PL41PLUST (58 mm, 1200 W)', url: 'https://www.1st-line.com/buy/rrpl41plust/' },
      { label: 'Green Plantation: Glenda (kocioł 0,3 l)', url: 'https://www.greenplantation.com/p/lelit-glenda-pl41plust' },
      { label: 'Kaffeemacher: Glenda wycofana', url: 'https://kaffeemacher.de/fr/blogs/kaffeewissen/lelit' },
    ],
  },
  {
    id: 'lelit-victoria', kind: 'machine', brand: 'lelit', name: 'Lelit Victoria PL91T', short: 'Lelit Victoria',
    tagline: 'Jeden kocioł 0,3 l, LCC z OLED, PID i preinfuzją, grupa LELIT58',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,3 l, mosiądz' },
      { label: 'Sterowanie', value: 'LCC z ekranem OLED: temperatura kawy, pary i wody, czas parzenia' },
      { label: 'Grupa / kolba', value: lelitGroup58 },
      { label: 'Ciśnienie', value: 'pompa 15 bar, podświetlany manometr' },
      { label: 'Zawór', value: '3-drożny' },
      { label: 'Zbiornik', value: '2,5 l, wskaźnik braku wody' },
      { label: 'Moc', value: '1200 W' },
      { label: 'Wymiary / waga', value: '23 × 38 × 38 cm, ok. 9–11 kg' },
    ],
    espresso: [
      'W LCC ustaw temperaturę parzenia (start 93–94 °C) i krótką preinfuzję.',
      'LCC pokazuje czas ekstrakcji: celuj w 25–30 s.',
      'Start: 18 g → 36 g, sitko 14–18 g.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitSoftener(35), lelitDescale(120)],
    sources: [
      { label: 'Lelit: Victoria PL91T (karta techniczna)', url: 'https://www.lelit.com/wp-content/uploads/2024/09/EN-Victoria.pdf' },
      { label: 'Seattle Coffee Gear: Victoria (1200 W, 58 mm)', url: 'https://www.seattlecoffeegear.com/products/lelit-victoria-espresso-machine' },
    ],
  },
  {
    id: 'lelit-kate', kind: 'machine', brand: 'lelit', name: 'Lelit Kate PL82T', short: 'Lelit Kate',
    tagline: 'Victoria z wbudowanym młynkiem: kocioł 0,3 l, LCC, żarna stożkowe 38 mm',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł 0,3 l, mosiądz, LCC z PID' },
      { label: 'Młynek', value: 'wbudowany, stożkowe żarna 38 mm, bezstopniowy, 2 programowane dawki w LCC' },
      { label: 'Zasobnik', value: '350 g' },
      { label: 'Grupa / kolba', value: lelitGroup58 },
      { label: 'Ciśnienie', value: 'pompa 15 bar, manometr' },
      { label: 'Zbiornik', value: '2,5 l, tryb rezerwy przy braku wody' },
      { label: 'Moc', value: '1200 W' },
      { label: 'Wymiary / waga', value: '34 × 38 × 41,5 cm, 12–14,4 kg' },
    ],
    espresso: [
      'Ustaw w LCC czas mielenia podwójnej dawki tak, by wychodziło 18 g.',
      'Pokrętło grubości z boku nie ma podziałki: zaznacz pozycję i przesuwaj małymi krokami.',
      'Start: 18 g → 36 g w 25–30 s, temperatura 93–94 °C.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, builtInGrinder, lelitSoftener(35), lelitDescale(120)],
    sources: [
      { label: 'Lelit: Kate PL82T (karta techniczna)', url: 'https://assets.breville.com/Lelit/PESKA01/UK_PL82T-2G82.pdf' },
      { label: 'Lelit: Kate (instrukcja)', url: 'https://cdn.shopify.com/s/files/1/0654/9015/7800/files/Kate.pdf' },
    ],
  },
  {
    id: 'lelit-elizabeth', kind: 'machine', brand: 'lelit', name: 'Lelit Elizabeth PL92T', short: 'Lelit Elizabeth',
    tagline: 'Dwa kotły (0,3 l kawa, 0,6 l para), LCC, grupa LELIT58, pompa wibracyjna',
    specs: [
      { label: 'Kotły', value: 'kawa 0,3 l (mosiądz), para 0,6 l (stal AISI316L), oba z PID' },
      { label: 'Sterowanie', value: 'LCC: temperatury, dawki, preinfuzja, czas, tryb oszczędny' },
      { label: 'Grupa / kolba', value: lelitGroup58 },
      { label: 'Pompa', value: 'wibracyjna, manometr podświetlany' },
      { label: 'Zawór', value: '3-drożny' },
      { label: 'Zbiornik', value: '2,5 l' },
      { label: 'Wymiary / waga', value: '32 × 38 × 38 cm, 15,3 kg' },
    ],
    espresso: [
      'Kawa i para działają jednocześnie: ustaw temperaturę parzenia 93–94 °C w LCC.',
      'Preinfuzję i dawki programujesz osobno dla każdego przycisku.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitSoftener(35), lelitBoilerCare],
    sources: [
      { label: 'Lelit: Elizabeth PL92T (strona produktu)', url: 'https://lelit.com/?p=3195' },
      { label: 'Lelit: Elizabeth (karta techniczna)', url: 'https://lelit.com/wp-content/uploads/2024/09/EN-Elizabeth.pdf' },
      { label: 'Seattle Coffee Gear: Elizabeth', url: 'https://www.seattlecoffeegear.com/products/lelit-elizabeth-espresso-machine' },
    ],
  },
  {
    id: 'lelit-mara-x', kind: 'machine', brand: 'lelit', name: 'Lelit Mara X V2 PL62X', short: 'Lelit Mara X',
    tagline: 'Wymiennik ciepła, kocioł 1,8 l, grupa E61 (L58E), dwa czujniki temperatury',
    specs: [
      { label: 'Ogrzewanie', value: 'kocioł 1,8 l ze stali AISI316L z wymiennikiem ciepła' },
      { label: 'Grzałka', value: '1400 W (230 V)' },
      { label: 'Grupa / kolba', value: 'L58E (typ E61) z mechaniczną preinfuzją, 58 mm' },
      { label: 'Tryby', value: 'priorytet kawy lub pary, 3 temperatury do wyboru' },
      { label: 'Pompa', value: 'wibracyjna, bardzo cicha; dwa manometry' },
      { label: 'Zbiornik', value: '2,5 l, filtr zmiękczający 35 l w zestawie' },
      { label: 'Wymiary / waga', value: '22,5 × 52 × 35,5 cm, 18,5 kg' },
    ],
    espresso: [
      'Tryb priorytetu kawy i środkowa temperatura to dobry start.',
      'Grupa E61 nagrzewa się dłużej: daj maszynie ok. 20 min od włączenia.',
      'Start: 18 g → 36 g w 25–30 s.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitSoftener(35), lelitBoilerCare],
    sources: [
      { label: 'Lelit: MaraX PL62X (karta techniczna)', url: 'https://www.lelit.com/wp-content/uploads/2024/09/EN-MaraX.pdf' },
      { label: 'Clive Coffee: Mara X (tryby, manometry)', url: 'https://clivecoffee.com/products/lelit-mara-x-espresso-machine' },
      { label: 'Galaxus: Mara X V2 (1400 W)', url: 'https://galaxus.nl/en/s2/product/lelit-mara-v2-espresso-machines-25043456' },
    ],
  },
  {
    id: 'lelit-mara-x3', kind: 'machine', brand: 'lelit', name: 'Lelit MaraX3 PL62X3', short: 'Lelit MaraX3',
    tagline: 'Wymiennik ciepła 1,8 l, grupa L58E, kontrola przepływu (Pagaia), nowość 2026',
    specs: [
      { label: 'Ogrzewanie', value: 'kocioł 1,8 l ze stali AISI316L z wymiennikiem ciepła' },
      { label: 'Grupa / kolba', value: 'L58E (typ E61), 58 mm' },
      { label: 'Przepływ', value: 'dźwignia Pagaia do ręcznej kontroli przepływu' },
      { label: 'Zbiornik', value: '2,5 l, filtr zmiękczający 70 l w zestawie' },
      { label: 'Wymiary / waga', value: '25,5 × 53,5 × 38,5 cm, 18,3 kg' },
    ],
    espresso: [
      'Zacznij bez kombinowania z dźwignią: pełne otwarcie i 18 g → 36 g w 25–30 s.',
      'Potem spróbuj preinfuzji: dźwignia przymknięta przez kilka sekund, potem pełny przepływ.',
      'Daj grupie ok. 20 min nagrzewania.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitSoftener(70), lelitBoilerCare],
    sources: [
      { label: 'Lelit: MaraX3 (karta techniczna)', url: 'https://www.lelit.com/content/dam/lelit/npd/lpe/EN_Technical%20Sheet%20MaraX3.pdf' },
      { label: 'Kaffeemacher: Mara X3 z Pagaią', url: 'https://kaffeemacher.de/fr/blogs/kaffeewissen/lelit' },
    ],
  },
  {
    id: 'lelit-bianca', kind: 'machine', brand: 'lelit', name: 'Lelit Bianca V3 PL162T', short: 'Lelit Bianca',
    tagline: 'Dwa kotły (0,8 l kawa, 1,5 l para), pompa rotacyjna, grupa L58E z kontrolą przepływu',
    specs: [
      { label: 'Kotły', value: 'kawa 0,8 l i para 1,5 l, stal AISI316L, oba z PID' },
      { label: 'Grzałki', value: 'kawa 1000 W, para 1400 W' },
      { label: 'Pompa', value: 'rotacyjna, możliwe podłączenie do sieci wodnej' },
      { label: 'Grupa / kolba', value: 'L58E (typ E61) z łopatką kontroli przepływu, 58 mm' },
      { label: 'Sterowanie', value: 'LCC: temperatury, tryby gotowości, funkcja Low flow (V3)' },
      { label: 'Zbiornik', value: '2,5 l, montowany z trzech stron' },
      { label: 'Wymiary / waga', value: '29 × 58,5 × 39 cm, 27,2 kg' },
    ],
    espresso: [
      'Fabrycznie kocioł kawy ma 95 °C, a pary 125 °C; do jasnych paleń zostaw 95 °C, do ciemnych zejdź do 92–93 °C.',
      'Zacznij z łopatką w pełni otwartą (ok. 9 bar): 18 g → 36 g w 25–30 s.',
      'Potem profiluj: kilka sekund preinfuzji przy przymkniętej łopatce, pełne otwarcie, zamykanie pod koniec.',
    ],
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, lelitWand, showerScreen, gasket, lelitSoftener(70), lelitBoilerCare],
    sources: [
      { label: 'Lelit: Bianca (karta techniczna)', url: 'https://lelit.com/wp-content/uploads/2024/09/EN-Bianca.pdf' },
      { label: 'Lelit: Bianca V3 zmiany i ustawienia fabryczne', url: 'https://lelit.com/l3t1l/uploads/2022/02/BiancaV3-updates-WEB.pdf' },
      { label: 'Clive Coffee: Bianca V3 (moc grzałek)', url: 'https://clivecoffee.com/products/lelit-bianca-dual-boiler-espresso-machine?hsLang=en' },
    ],
  },
];

GRINDERS.push(...LELIT_GRINDERS);
MACHINES.push(...LELIT_MACHINES);
export const GEAR: CoffeeGear[] = [...GRINDERS, ...MACHINES];
export const gearById = (id: string) => GEAR.find(g => g.id === id);

// ---- service schedule -------------------------------------------------------------------------
export const GEAR_KEY = 'homecraft.coffeegear.v1';
export interface GearState {
  v: 1; grinder: string | null; machine: string | null;
  /** Last time a task was done, key `${gearId}:${taskId}` → ms. */
  done: Record<string, number>;
  /** User interval in days, same key. */
  every: Record<string, number>;
}
export const EMPTY_GEAR: GearState = { v: 1, grinder: null, machine: null, done: {}, every: {} };
export const taskKey = (gear: CoffeeGear, task: ServiceTask) => `${gear.id}:${task.id}`;
const DAY = 86400000;

/** Validate saved data: unknown gear ids, wrong kinds, bad numbers and unknown task keys are dropped. */
export function parseGear(raw: string | null): GearState {
  try {
    const v: unknown = JSON.parse(raw || 'null');
    if (!v || typeof v !== 'object' || (v as { v?: unknown }).v !== 1) return { ...EMPTY_GEAR, done: {}, every: {} };
    const o = v as Record<string, unknown>;
    const pick = (id: unknown, kind: CoffeeGear['kind']) => typeof id === 'string' && gearById(id)?.kind === kind ? id : null;
    const keys = new Set(GEAR.flatMap(g => g.service.map(t => taskKey(g, t))));
    const nums = (x: unknown, ok: (n: number) => boolean) => {
      const out: Record<string, number> = {};
      if (x && typeof x === 'object') for (const [k, n] of Object.entries(x)) if (keys.has(k) && typeof n === 'number' && ok(n)) out[k] = n;
      return out;
    };
    return { v: 1, grinder: pick(o.grinder, 'grinder'), machine: pick(o.machine, 'machine'),
      done: nums(o.done, n => Number.isFinite(n) && n > 0), every: nums(o.every, n => Number.isInteger(n) && n >= 1 && n <= 730) };
  } catch { return { ...EMPTY_GEAR, done: {}, every: {} }; }
}

export type DueState = 'never' | 'ok' | 'soon' | 'overdue';
export interface TaskStatus { every: number; last: number | null; dueAt: number | null; state: DueState; daysLeft: number | null }
/** When a task is next due. "soon" = within 20 % of the interval (at least 1 day). */
export function taskStatus(state: GearState, gear: CoffeeGear, task: ServiceTask, now: number): TaskStatus {
  const key = taskKey(gear, task), every = state.every[key] ?? task.everyDays, last = state.done[key] ?? null;
  if (last == null) return { every, last, dueAt: null, state: 'never', daysLeft: null };
  const dueAt = last + every * DAY, daysLeft = Math.ceil((dueAt - now) / DAY);
  return { every, last, dueAt, daysLeft, state: daysLeft < 0 ? 'overdue' : daysLeft <= Math.max(1, Math.round(every * 0.2)) ? 'soon' : 'ok' };
}
/** Count of tasks that need attention (overdue) for the selected gear. */
export function overdueCount(state: GearState, now: number) {
  return [state.grinder, state.machine].map(id => id ? gearById(id) : undefined).filter((g): g is CoffeeGear => !!g)
    .reduce((n, g) => n + g.service.filter(t => taskStatus(state, g, t, now).state === 'overdue').length, 0);
}
