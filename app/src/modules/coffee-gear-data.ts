// Coffee gear catalogue: 5 popular espresso grinders and 5 popular portafilter machines.
// Specifications come from manufacturer pages and retailer spec sheets (see `sources`, checked 28.11.2026).
// Service intervals are general home-use guidance, not manufacturer guarantees: the user can change them,
// and the manual of the exact machine always wins. Nothing here talks to a device.

export interface GearSpec { label: string; value: string }
export interface ServiceTask { id: string; title: string; detail: string; everyDays: number }
export interface GearSource { label: string; url: string }
export interface CoffeeGear {
  id: string; kind: 'grinder' | 'machine'; name: string; short: string; tagline: string;
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

export const GRINDERS: CoffeeGear[] = [
  {
    id: 'eureka-specialita', kind: 'grinder', name: 'Eureka Mignon Specialità', short: 'Mignon Specialità',
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
    id: 'niche-zero', kind: 'grinder', name: 'Niche Zero', short: 'Niche Zero',
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
      { label: 'Home-Barista: recenzja (330 obr./min)', url: 'https://home-barista.com/reviews/niche-zero-grinder-review-t57516.html' },
    ],
  },
  {
    id: 'df64-gen2', kind: 'grinder', name: 'DF64 Gen 2 (Turin)', short: 'DF64 Gen 2',
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
    id: 'sage-sgp', kind: 'grinder', name: 'Sage Smart Grinder Pro', short: 'Smart Grinder Pro',
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
    id: '1zpresso-jultra', kind: 'grinder', name: '1Zpresso J-Ultra', short: 'J-Ultra',
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
    ],
  },
];

export const MACHINES: CoffeeGear[] = [
  {
    id: 'gaggia-classic', kind: 'machine', name: 'Gaggia Classic Pro E24 (Evo Pro)', short: 'Gaggia Classic',
    tagline: 'Jeden kocioł mosiężny, kolba 58 mm, zawór 3-drożny, bez PID',
    specs: [
      { label: 'Ogrzewanie', value: 'jeden kocioł do kawy i pary (E24: mosiężny; Evo Pro: aluminiowy ok. 105 ml roboczych)' },
      { label: 'Kolba', value: '58 mm, stal nierdzewna, profesjonalna' },
      { label: 'Ciśnienie', value: 'pompa wibracyjna; OPV ok. 9 bar w wersjach z nową sprężyną (w UE sprawdź)' },
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
    service: [groupBrush, backflushWater, backflushDetergent, soakBaskets, steamWand, showerScreen, gasket, descale(90, 'Ręcznie, środkiem do odkamieniania wg instrukcji Gaggii.')],
    notes: ['Gaggia zaleca też cotygodniowe płukanie grupy ciepłą wodą (bez mydła).'],
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
      { label: 'Wymiary / waga', value: '33 × 31 × 40 cm, ok. 10,6 kg' },
    ],
    espresso: [
      'Sitko jednościenne 2-shot, ok. 18 g; nadmiar zbierz narzędziem Razor.',
      'Manometr: celuj w środek strefy espresso. Za nisko = drobniej, za wysoko = grubiej.',
      'Start: 18 g → ok. 36 g w 25–30 s.',
    ],
    service: [groupBrush, sageClean, sageFilter, steamWand, burrBrush, gasket, descale(90, 'Program odkamieniania z instrukcji Sage.')],
    notes: ['Sitka z podwójnymi ściankami (presuryzowane) są do kawy mielonej fabrycznie. Do świeżej kawy używaj jednościennych.'],
    sources: [
      { label: 'Sage: Barista Express (moc, Thermocoil, 16 ustawień, 54 mm)', url: 'https://sageappliances.com/eu/en/products/microwaves/bes875.html' },
      { label: 'Sage: PID 93 °C', url: 'https://sageappliances.com/no/en/products/espresso/bes875.html' },
      { label: 'Currys: specyfikacja (2 l, 15 bar / 9 bar, wymiary)', url: 'https://www.currys.co.uk/product/10174955.html' },
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
      { label: 'Wymiary / waga', value: '19,5 × 32 × 31 cm, 4,95 kg' },
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
