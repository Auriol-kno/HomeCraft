// Tea guide. Facts are general tea knowledge (processing, origin, trivia); brewing values are common
// starting points that vary by producer, so every card says to follow the packaging when it differs.

export const TEA_CATEGORIES = ['Wszystkie', 'Białe', 'Zielone', 'Żółte', 'Oolong', 'Czarne', 'Pu-erh', 'Ziołowe', 'Owocowe', 'Rooibos i mate'] as const;
export type TeaCategory = Exclude<(typeof TEA_CATEGORIES)[number], 'Wszystkie'>;

export interface Tea {
  id: string; n: string; c: TeaCategory;
  /** One-line character shown in the closed card. */
  line: string;
  /** What it is. */
  what: string;
  /** How it is made, in order. */
  how: string[];
  /** Why it tastes / looks like that. */
  why: string;
  origin: string;
  taste: string;
  caffeine: 'brak' | 'niska' | 'średnia' | 'wysoka';
  /** Oxidation range in %, true teas only. */
  ox?: [number, number];
  /** Water °C. */
  temp: number;
  /** Dry leaf, grams per 100 ml of water. */
  g100: number;
  /** Seconds for each consecutive infusion. */
  steps: number[];
  /** Short note on a stage that is not an infusion (e.g. whisking). */
  stepLabel?: string;
  tips: string[];
  trivia: string[];
}

export const TEA_CATEGORY_INFO: Record<TeaCategory, { text: string; ox?: string }> = {
  'Białe': { ox: '5–15 %', text: 'Najmniej przetworzone: młode pąki i listki są tylko zwiędnięte i wysuszone. Delikatny, słodkawy napar o jasnym kolorze.' },
  'Zielone': { ox: '0–5 %', text: 'Liście są od razu podgrzewane (prażone na patelni w Chinach, parzone parą w Japonii), co zatrzymuje utlenianie i zachowuje zieleń oraz świeży, trawiasty smak.' },
  'Żółte': { ox: '5–10 %', text: 'Rzadka kategoria z Chin. Po zatrzymaniu utleniania liście są owijane i „dusi się” je, przez co smak jest łagodniejszy i mniej trawiasty niż w zielonej.' },
  'Oolong': { ox: '10–80 %', text: 'Herbata częściowo utleniona, między zieloną a czarną. Liście są potrząsane i obijane, żeby brzegi lekko się utleniły. Zakres smaków jest bardzo szeroki: od kwiatowych po prażone.' },
  'Czarne': { ox: '80–100 %', text: 'Liście są całkowicie utlenione. W Chinach nazywa się je „czerwoną herbatą” (hongcha), od koloru naparu, a nie liści. Mocny, wyrazisty smak, najwięcej kofeiny.' },
  'Pu-erh': { text: 'Herbata fermentowana mikrobiologicznie, z prowincji Yunnan. Sheng starzeje się latami, shou przechodzi przyspieszone leżakowanie w wilgotnych stosach. Ziemisty, głęboki smak.' },
  'Ziołowe': { text: 'Napary z ziół, kwiatów i korzeni. Botanicznie to nie herbata, bo nie pochodzą z Camellia sinensis, i zwykle nie mają kofeiny. Nie zastępują leczenia.' },
  'Owocowe': { text: 'Napary z owoców, płatków kwiatów i skórek. Kwaskowe, aromatyczne, bez kofeiny. Parzy się je długo i wrzątkiem.' },
  'Rooibos i mate': { text: 'Dwa popularne napoje „herbaciane” z innych roślin: afrykański rooibos (bez kofeiny) i południowoamerykańska yerba mate (z kofeiną).' },
};

export const TEA_GENERAL: { title: string; text: string }[] = [
  { title: 'Jedna roślina, pięć rodzajów', text: 'Biała, zielona, żółta, oolong, czarna i pu-erh to ta sama roślina, Camellia sinensis. O rodzaju decyduje obróbka po zbiorze, głównie stopień utlenienia, czyli brązowienia liścia pod wpływem tlenu, tak jak ciemnieje pokrojone jabłko.' },
  { title: 'Dlaczego temperatura wody ma znaczenie', text: 'Zbyt gorąca woda wyciąga z delikatnych liści więcej garbników i goryczy. Dlatego zielone i białe parzy się chłodniej, a czarne, pu-erh i zioła wrzątkiem.' },
  { title: 'Jak ostudzić wodę bez termometru', text: 'Orientacyjnie: po zagotowaniu odczekaj około minuty na ok. 95 °C, 2–3 minuty na 85–90 °C, 4–5 minut na ok. 80 °C. Przelanie wody do kubka obniża temperaturę o kilka stopni. Czajnik z regulacją temperatury jest dokładniejszy.' },
  { title: 'Woda', text: 'Najlepsza jest świeża, miękka woda o niskiej mineralizacji (filtrowana lub źródlana). Twarda woda przytępia smak i daje kożuszek na powierzchni. Nie gotuj wody drugi raz.' },
  { title: 'Parzenie na zimno', text: 'Około 8–10 g liści na litr zimnej wody, 6–10 godzin w lodówce. Napar jest słodszy i mniej gorzki. Najlepiej sprawdza się z zielonymi, białymi i oolongami, a także z owocowymi.' },
  { title: 'Kolejne zalewania', text: 'Dobre liście (zwłaszcza oolong, białe, zielone i pu-erh) można zalewać kilka razy. Każde zalanie ma inny smak. Liście zalewaj od razu, bez przerwy na wysychanie.' },
  { title: 'Przechowywanie', text: 'Szczelny, nieprzezroczysty pojemnik, z dala od światła, wilgoci, ciepła i zapachów. Zielone i białe tracą aromat najszybciej, pu-erh lubi leżeć.' },
  { title: 'Kofeina w herbacie', text: 'Herbata zawiera kofeinę i L-teaninę, aminokwas, który łagodzi jej działanie. Dłuższe parzenie i wyższa temperatura wyciągają więcej kofeiny, ale też więcej goryczy.' },
];

export const TEAS: Tea[] = [
  { id: 'silver-needle', n: 'Silver Needle (Bai Hao Yin Zhen)', c: 'Białe', line: 'Same pąki, delikatna, słodkawa', caffeine: 'niska', ox: [5, 10], temp: 80, g100: 1.2, steps: [180, 240, 300],
    what: 'Najszlachetniejsza biała herbata, zrobiona wyłącznie z nierozwiniętych pąków pokrytych srebrzystym puszkiem.',
    how: ['Zbiór pąków wczesną wiosną', 'Powolne więdnięcie na powietrzu', 'Delikatne suszenie', 'Brak zwijania i prażenia'],
    why: 'Pąki są bogate w aminokwasy i prawie nieprzetworzone, więc napar jest słodki, kwiatowo-miodowy, prawie bez goryczy. Puszek (jasne włoski) widać w naparze.', origin: 'Fujian, Chiny (Fuding, Zhenghe)', taste: 'miód, melon, kwiaty, bardzo łagodna',
    tips: ['Nie przekraczaj 85 °C.', 'Zalewaj powoli, bez mieszania.'], trivia: ['Nazwa znaczy „srebrna igła”, od kształtu i koloru pąków.', 'Zbiera się ją tylko przez kilka dni wczesną wiosną.'] },
  { id: 'bai-mudan', n: 'Bai Mudan (Biała Piwonia)', c: 'Białe', line: 'Pąk i dwa listki, pełniejsza niż Silver Needle', caffeine: 'niska', ox: [8, 15], temp: 85, g100: 1.2, steps: [180, 240, 300],
    what: 'Biała herbata z pąka i dwóch młodych listków, tańsza i nieco mocniejsza od Silver Needle.',
    how: ['Zbiór pąka i dwóch listków', 'Więdnięcie', 'Suszenie w niskiej temperaturze'],
    why: 'Listki dodają ciała i lekkiej cierpkości, a niewielkie utlenienie daje nuty suszonych owoców i ziół.', origin: 'Fujian, Chiny', taste: 'suszone owoce, kwiaty, lekko ziołowa',
    tips: ['Starzeje się dobrze, ciemnieje i łagodnieje po latach.'], trivia: ['Nazwa pochodzi od kształtu rozwiniętych liści, który przypomina kwiat piwonii.', 'Prasowane „herbaciane placki” białej herbaty starzeją się podobnie do pu-erh.'] },

  { id: 'sencha', n: 'Sencha', c: 'Zielone', line: 'Japońska klasyka, świeża i morska', caffeine: 'średnia', ox: [0, 3], temp: 75, g100: 1.5, steps: [60, 20, 50],
    what: 'Najpopularniejsza zielona herbata Japonii, uprawiana w pełnym słońcu.',
    how: ['Zbiór', 'Krótkie parzenie parą (zatrzymanie utleniania)', 'Zwijanie i formowanie igiełek', 'Suszenie'],
    why: 'Para zatrzymuje enzymy w kilkadziesiąt sekund i utrwala zieleń. Dlatego smak jest świeży, trawiasto-morski (nuty umami), a nie prażony jak w chińskich zielonych.', origin: 'Japonia (Shizuoka, Kagoshima)', taste: 'świeża trawa, algi, słodka goryczka',
    tips: ['Drugie zalewanie jest krótsze niż pierwsze.', 'Mętność naparu to drobiny liścia, to normalne.'], trivia: ['Około 80 % japońskiej herbaty to sencha.', 'Ten sam krzew po zacienieniu daje gyokuro, a po sproszkowaniu matchę.'] },
  { id: 'gyokuro', n: 'Gyokuro', c: 'Zielone', line: 'Zacieniana, bardzo słodka, umami', caffeine: 'wysoka', ox: [0, 3], temp: 55, g100: 3, steps: [120, 40, 90],
    what: 'Najwyżej cenione japońskie liście zielonej herbaty, na kilka tygodni przed zbiorem przykrywane cieniówką.',
    how: ['Zacienianie krzewów przez ok. 20 dni', 'Ręczny lub maszynowy zbiór najmłodszych liści', 'Parzenie parą', 'Zwijanie i suszenie'],
    why: 'Cień spowalnia rozkład teaniny na garbniki, więc liście są słodkie, pełne umami i mniej cierpkie. Więcej chlorofilu daje intensywnie zielony kolor.', origin: 'Japonia (Uji, Yame)', taste: 'umami, słodycz, bulion z alg, kremowa',
    tips: ['Tylko 50–60 °C, inaczej wyjdzie gorzka.', 'Tradycyjnie używa się dużo liści i mało wody w małym czajniczku.'], trivia: ['Nazwa znaczy „szmaragdowa rosa”.', 'Mimo łagodnego smaku ma więcej kofeiny niż większość herbat.'] },
  { id: 'matcha', n: 'Matcha', c: 'Zielone', line: 'Sproszkowany liść, ubijana, nie zalewana', caffeine: 'wysoka', ox: [0, 3], temp: 75, g100: 2.5, steps: [20], stepLabel: 'ubijanie',
    what: 'Drobno zmielony proszek z zacienianych liści (tencha). Pije się cały liść, nie sam napar.',
    how: ['Zacienianie 3–4 tygodnie', 'Zbiór i parzenie parą', 'Suszenie bez zwijania, powstaje tencha', 'Usunięcie ogonków i żyłek', 'Mielenie w kamiennych młynach'],
    why: 'Połknięcie całego liścia daje intensywny smak, kolor, kofeinę i teaninę. Zacienianie odpowiada za słodycz i umami.', origin: 'Japonia (Uji, Nishio)', taste: 'umami, kremowa, lekko słodka, trawiasta',
    tips: ['Przesiej proszek przez sitko, nie będzie grudek.', 'Ubijaj bambusową miotełką ruchem „W” około 20 sekund, aż powstanie piana.', 'Około 2 g proszku na 70–80 ml wody.'], trivia: ['Kamienny młyn mieli około 30 g proszku na godzinę.', 'Matcha jest sercem japońskiej ceremonii herbacianej (chanoyu).'] },
  { id: 'longjing', n: 'Longjing (Smocza Studnia)', c: 'Zielone', line: 'Płaskie liście, orzechowa, prażona', caffeine: 'średnia', ox: [0, 3], temp: 80, g100: 1.2, steps: [120, 100, 150],
    what: 'Najsłynniejsza chińska zielona herbata, o charakterystycznych płaskich, jasnozielonych liściach.',
    how: ['Zbiór wiosną (najlepsza przed świętem Qingming, początek kwietnia)', 'Krótkie więdnięcie', 'Prażenie i dociskanie liści na gorącej patelni', 'Suszenie'],
    why: 'Ręczne prażenie zatrzymuje utlenianie i nadaje płaski kształt oraz orzechowy, lekko prażony smak, inny niż parzona para sencha.', origin: 'Hangzhou, prowincja Zhejiang, Chiny (okolice Jeziora Zachodniego)', taste: 'orzechy, kasztany, świeża trawa, słodka',
    tips: ['Szklanka i patrzenie na opadające liście to część przyjemności.', 'Najlepsza w pierwszych 12 miesiącach od zbioru.'], trivia: ['Nazwa znaczy „Smocza Studnia”, od pobliskiego źródła.', 'Herbata przedqingmingowa uważana jest za najcenniejszą.'] },
  { id: 'gunpowder', n: 'Gunpowder', c: 'Zielone', line: 'Zwinięte kuleczki, mocna i lekko dymna', caffeine: 'średnia', ox: [0, 3], temp: 85, g100: 1.2, steps: [150, 180],
    what: 'Chińska zielona herbata zwinięta w ciasne kuleczki, które rozwijają się w wodzie.',
    how: ['Prażenie liści', 'Zwijanie w kuleczki', 'Suszenie'],
    why: 'Mocne zwinięcie chroni liście i długo utrzymuje świeżość. Prażenie daje mocniejszy, lekko dymny smak. Idealna do herbaty miętowej.', origin: 'Zhejiang, Chiny', taste: 'wyraziste, lekko dymne, cierpkie',
    tips: ['Sprawdza się w marokańskiej herbacie miętowej.'], trivia: ['Kuleczki przypominają ziarna prochu strzelniczego, stąd nazwa.'] },
  { id: 'jasmine', n: 'Zielona jaśminowa', c: 'Zielone', line: 'Zielona herbata pachnąca kwiatami jaśminu', caffeine: 'średnia', ox: [0, 3], temp: 80, g100: 1.2, steps: [150, 180],
    what: 'Zielona herbata, której liście przejmują aromat świeżych kwiatów jaśminu.',
    how: ['Wiosenny zbiór zielonej herbaty i przechowywanie', 'Latem układanie warstwami z kwiatami jaśminu na noc', 'Wymiana kwiatów, powtarzanie nawet kilka razy', 'Ponowne suszenie'],
    why: 'Liście chłoną olejki z kwiatów, które otwierają się nocą. Im więcej cykli, tym intensywniejszy aromat.', origin: 'Fujian, Chiny', taste: 'kwiatowa, słodka, delikatna',
    tips: ['Unikaj mieszanek z „aromatem jaśminu”, lepsze jest tradycyjne wonienie.'], trivia: ['Do wysokiej klasy herbat potrzeba kilku zmian kwiatów.'] },

  { id: 'yellow', n: 'Junshan Yinzhen', c: 'Żółte', line: 'Rzadka żółta herbata, łagodna i słodka', caffeine: 'niska', ox: [5, 10], temp: 80, g100: 1.2, steps: [180, 240, 300],
    what: 'Jedna z najrzadszych kategorii herbaty. Delikatne pąki, owijane i „duszone” po zatrzymaniu utleniania.',
    how: ['Zbiór pąków', 'Zatrzymanie utleniania w gorącej patelni', 'Owijanie w papier lub tkaninę i duszenie (menhuang)', 'Suszenie'],
    why: 'Wilgotne, ciepłe „duszenie” usuwa trawiastość zielonej herbaty. Liście lekko żółkną, a smak robi się miękki, słodki i bez cierpkości.', origin: 'Wyspa Junshan na jeziorze Dongting, Hunan, Chiny', taste: 'łagodna, słodka, lekko orzechowa',
    tips: ['Parz w szklance, pąki „tańczą”, pionowo opadają i unoszą się.'], trivia: ['W starożytności była herbatą cesarską.', 'Dziś jest trudna do kupienia poza Chinami.'] },

  { id: 'tie-guan-yin', n: 'Tie Guan Yin', c: 'Oolong', line: 'Kwiatowy, lekko słodki oolong, zwijany w kulki', caffeine: 'średnia', ox: [10, 30], temp: 95, g100: 1.5, steps: [180, 150, 180, 240],
    what: 'Znany oolong z Anxi, zwijany w zielone kulki, które w wodzie rozwijają się w całe liście.',
    how: ['Zbiór dojrzalszych liści', 'Więdnięcie na słońcu i w cieniu', 'Potrząsanie (obijanie brzegów liści)', 'Zatrzymanie utleniania', 'Wielokrotne zwijanie w kulki w tkaninie', 'Suszenie i opcjonalne prażenie'],
    why: 'Lekkie utlenienie daje orchideowy, kwiatowy aromat. Zwijanie łamie komórki, więc smak wydobywa się stopniowo przy kolejnych zalewaniach.', origin: 'Anxi, Fujian, Chiny', taste: 'orchidea, mleczna słodycz, świeża zieleń',
    tips: ['Kulki rozwijają się po kilku zalaniach.', 'Chiński sposób gongfu: dużo liści, krótkie zalewania.'], trivia: ['Nazwa znaczy „Żelazna Bogini Miłosierdzia”.', 'Tradycyjna wersja jest bardziej prażona i ciemniejsza.'] },
  { id: 'da-hong-pao', n: 'Da Hong Pao', c: 'Oolong', line: 'Skalny oolong z gór Wuyi, prażony i mineralny', caffeine: 'średnia', ox: [30, 60], temp: 95, g100: 1.5, steps: [180, 150, 180, 240, 300],
    what: 'Słynny „skalny” oolong z gór Wuyi, prażony nad węglem drzewnym.',
    how: ['Zbiór', 'Więdnięcie i mocne potrząsanie', 'Zatrzymanie utleniania', 'Zwijanie', 'Prażenie w piecu przez kilka godzin'],
    why: 'Utlenienie i długie prażenie dają głęboki, ciepły smak z nutami skał, prażonych orzechów i karmelu. Mineralność przypisuje się glebie z kamienistych zboczy.', origin: 'Góry Wuyi, Fujian, Chiny', taste: 'prażone orzechy, minerały, karmel, drewno',
    tips: ['Nadaje się do wielu zalań.', 'Odczekaj kilka tygodni po prażeniu, a smak się wyrówna.'], trivia: ['Nazwa znaczy „Wielka Czerwona Szata”, jedna z legend mówi o szacie, którą cesarz podarował krzewom.', 'Na starych krzewach macierzystych herbata jest tak cenna, że ich zbiór jest zakazany.'] },

  { id: 'assam', n: 'Assam', c: 'Czarne', line: 'Mocna, słodowa, do mleka', caffeine: 'wysoka', ox: [100, 100], temp: 97, g100: 1, steps: [240],
    what: 'Mocna czarna herbata z indyjskiego Assamu, z odmiany assamica o dużych liściach.',
    how: ['Zbiór', 'Więdnięcie', 'Rozdrabnianie (CTC lub ortodoksyjne)', 'Pełne utlenianie', 'Suszenie w gorącym powietrzu'],
    why: 'Duże liście odmiany assamica zawierają dużo związków, które dają ciemny kolor, słodowy smak i siłę, odporną na dodatek mleka.', origin: 'Assam, Indie', taste: 'słodowa, miodowa, mocna',
    tips: ['Świetnie z mlekiem i cukrem.', 'Nie przeciągaj parzenia powyżej 5 minut.'], trivia: ['Jest podstawą mieszanek English Breakfast i irlandzkich.', 'Odmiana assamica została odkryta dziko rosnąca w Indiach w XIX wieku.'] },
  { id: 'darjeeling', n: 'Darjeeling', c: 'Czarne', line: 'Lekka, muskatowa, „szampan herbat”', caffeine: 'średnia', ox: [30, 90], temp: 90, g100: 1, steps: [180],
    what: 'Herbata z podnóża Himalajów, lżejsza od innych czarnych. Rozróżnia się pierwszy zbiór (first flush), drugi (second flush) i jesienny.',
    how: ['Zbiór w jednej z pór roku', 'Więdnięcie', 'Zwijanie', 'Utlenianie (pierwszy zbiór krócej, drugi dłużej)', 'Suszenie'],
    why: 'Chłodny klimat i wysokość spowalniają wzrost, więc liście są pełne aromatów. Pierwszy zbiór jest jasny i kwiatowy, drugi ciemniejszy, z nutą muskatu.', origin: 'Darjeeling, Zachodni Bengal, Indie', taste: 'muskat, kwiaty, winogrona, jasna',
    tips: ['First flush parz w 85 °C, second flush w 90–95 °C.', 'Pij bez mleka.'], trivia: ['Bywa nazywana „szampanem herbat”.', 'Nazwa jest chroniona oznaczeniem geograficznym.'] },
  { id: 'ceylon', n: 'Ceylon', c: 'Czarne', line: 'Żywa, cytrusowa, uniwersalna', caffeine: 'średnia', ox: [100, 100], temp: 95, g100: 1, steps: [240],
    what: 'Czarna herbata z Sri Lanki. Wersje z wyżyn są lekkie i kwiatowe, z nizin mocniejsze i ciemniejsze.',
    how: ['Zbiór', 'Więdnięcie', 'Zwijanie', 'Utlenianie', 'Suszenie'],
    why: 'Wysokość nad poziomem morza wpływa na smak: im wyżej, tym delikatniej i bardziej aromatycznie.', origin: 'Sri Lanka', taste: 'cytrusowa, żywa, lekko cierpka',
    tips: ['Dobra do mrożonej herbaty.'], trivia: ['Wyspa zmieniła nazwę z Ceylon na Sri Lanka w 1972, ale nazwa herbaty została.', 'Plantacje zaczęły się od kawy, którą zniszczyła choroba liści pod koniec XIX wieku.'] },
  { id: 'keemun', n: 'Keemun (Qimen)', c: 'Czarne', line: 'Łagodna, winna i lekko dymna', caffeine: 'średnia', ox: [100, 100], temp: 95, g100: 1, steps: [240, 240],
    what: 'Chińska czarna herbata z Anhui, łagodna, bez goryczy.',
    how: ['Zbiór', 'Więdnięcie', 'Zwijanie', 'Utlenianie', 'Suszenie'],
    why: 'Odmiana i obróbka dają nuty winne, kakaowe i lekko dymne, a niską cierpkość.', origin: 'Anhui, Chiny', taste: 'wino, kakao, suszone śliwki',
    tips: ['Dobra bez dodatków.'], trivia: ['Jest jednym z głównych składników mieszanki English Breakfast.'] },
  { id: 'earl-grey', n: 'Earl Grey', c: 'Czarne', line: 'Czarna herbata z olejkiem bergamotki', caffeine: 'średnia', ox: [100, 100], temp: 95, g100: 1, steps: [240],
    what: 'Czarna herbata aromatyzowana olejkiem z bergamotki, cytrusa przypominającego skrzyżowanie gorzkiej pomarańczy i cytryny.',
    how: ['Czarna herbata bazowa (często Ceylon lub Keemun)', 'Spryskanie olejkiem bergamotowym', 'Wymieszanie i leżakowanie'],
    why: 'Olejek bergamotki jest lotny i kwiatowo-cytrusowy, a garbniki czarnej herbaty dodają mu strukturę.', origin: 'Anglia (baza z Chin, Indii lub Sri Lanki), bergamotka z Kalabrii we Włoszech', taste: 'cytrus, kwiaty, mocny czarny',
    tips: ['Najlepsza z prawdziwym olejkiem, a nie sztucznym aromatem.', 'Ostudź wodę do 95 °C, nie przeciągaj.'], trivia: ['Nazwa pochodzi od hrabiego Greya, premiera Wielkiej Brytanii w latach 30. XIX wieku, choć dokładna historia jest niepewna.'] },
  { id: 'lapsang', n: 'Lapsang Souchong', c: 'Czarne', line: 'Dymna, wędzona nad sosną', caffeine: 'średnia', ox: [100, 100], temp: 95, g100: 1, steps: [240, 240],
    what: 'Czarna herbata wędzona nad ogniem z sosnowego drewna, o wyraźnie dymnym zapachu.',
    how: ['Zbiór', 'Więdnięcie nad sosnowym dymem', 'Zwijanie i utlenianie', 'Suszenie nad sosnowymi ogniami'],
    why: 'Dym z żywicznego drewna osadza się na liściach i daje aromat ogniska, wędzonki i żywicy.', origin: 'Góry Wuyi, Fujian, Chiny', taste: 'dym, żywica, suszone owoce',
    tips: ['Spróbuj z serem lub w potrawach, np. jako dodatek do marynat.'], trivia: ['Uchodzi za pierwszą czarną herbatę na świecie.', 'Wędzenie wymyślono, żeby szybciej wysuszyć liście.'] },

  { id: 'sheng', n: 'Sheng pu-erh (surowy)', c: 'Pu-erh', line: 'Młody pu-erh, żywy, cierpki, starzeje się latami', caffeine: 'średnia', temp: 95, g100: 1.5, steps: [60, 45, 60, 90, 120],
    what: 'Prasowany, naturalnie starzejący się pu-erh. Młody jest zielony i cierpki, a z latami robi się miękki.',
    how: ['Zbiór liści dużolistnej odmiany z Yunnan', 'Krótkie prażenie', 'Suszenie na słońcu', 'Parowanie i prasowanie w placki', 'Leżakowanie, nawet dziesiątki lat'],
    why: 'Mikroorganizmy i powolne utlenianie z czasem zmieniają garbniki i aromat. Dlatego dobrze przechowywany pu-erh zyskuje na wartości.', origin: 'Yunnan, Chiny', taste: 'młody: cierpki, kwiatowy; stary: ziemisty, słodki',
    tips: ['Przepłucz liście wrzątkiem, wylej wodę i dopiero parz.', 'Ułamuj kawałek z placka igłą lub nożem.'], trivia: ['Dobry stary pu-erh osiąga bardzo wysokie ceny.', 'Placki (bing) mają zwykle 357 g.'] },
  { id: 'shou', n: 'Shou pu-erh (ciemny)', c: 'Pu-erh', line: 'Ciemny, ziemisty, łagodny', caffeine: 'średnia', temp: 100, g100: 1.5, steps: [30, 30, 45, 60, 90],
    what: 'Pu-erh po przyspieszonej fermentacji, ciemny i gładki od razu po produkcji.',
    how: ['Liście jak w sheng', 'Wilgotne stosy (wo dui) przez kilka tygodni', 'Prasowanie lub luzem', 'Suszenie'],
    why: 'Ciepłe, wilgotne stosy sprzyjają mikroorganizmom, które w kilka tygodni dają to, co sheng robi latami: ciemny kolor i ziemisty smak.', origin: 'Yunnan, Chiny', taste: 'ziemia, kakao, drewno, grzyby',
    tips: ['Przepłucz liście 5–10 sekund.', 'Dobrze znosi mleko.'], trivia: ['Metodę wo dui opracowano w latach 70. XX wieku.', 'Tradycyjnie pije się go po tłustych posiłkach.'] },

  { id: 'mint', n: 'Mięta', c: 'Ziołowe', line: 'Chłodna, świeża, bez kofeiny', caffeine: 'brak', temp: 95, g100: 1.2, steps: [420],
    what: 'Liście mięty pieprzowej, świeże lub suszone. Zawierają mentol, który daje wrażenie chłodu.',
    how: ['Zbiór przed kwitnieniem', 'Suszenie w cieniu', 'Przechowywanie w szczelnym pojemniku'],
    why: 'Mentol i inne olejki lotne uwalniają się z liści w gorącej wodzie. Dlatego napar parzy się pod przykryciem.', origin: 'Europa, cały świat', taste: 'chłodna, świeża, słodkawa',
    tips: ['Przykryj kubek, żeby olejki nie uleciały.', 'Świeżej mięty użyj garść i zalej 95 °C.'], trivia: ['Mięta pieprzowa jest naturalną mieszanką mięty wodnej i zielonej.'] },
  { id: 'chamomile', n: 'Rumianek', c: 'Ziołowe', line: 'Łagodny, jabłkowy, na wieczór', caffeine: 'brak', temp: 95, g100: 1.5, steps: [420],
    what: 'Suszone koszyczki rumianku pospolitego. Tradycyjnie pije się go wieczorem.',
    how: ['Zbiór koszyczków w pełni kwitnienia', 'Suszenie w cieniu'],
    why: 'W koszyczkach jest olejek eteryczny o jabłkowym zapachu. Nazwa „chamomile” pochodzi z greki i znaczy „ziemne jabłko”.', origin: 'Europa, Azja, Ameryka', taste: 'słodkie, jabłkowe, kwiatowe',
    tips: ['Parz pod przykryciem 5–10 minut.', 'Osoby uczulone na rośliny z rodziny astrowatych (np. ambrozję) powinny uważać.'], trivia: ['To jedno z najstarszych znanych ziół.'] },
  { id: 'lemon-balm', n: 'Melisa', c: 'Ziołowe', line: 'Cytrynowa, uspokajająca w smaku', caffeine: 'brak', temp: 95, g100: 1.2, steps: [420],
    what: 'Liście melisy lekarskiej, zioła z rodziny jasnotowatych, pachnące cytryną.',
    how: ['Zbiór przed kwitnieniem', 'Delikatne suszenie w cieniu'],
    why: 'Olejki, takie jak cytral, dają cytrynowy zapach. Są lotne, więc parz pod przykryciem.', origin: 'Europa, Azja Zachodnia', taste: 'cytrynowa, ziołowa, łagodna',
    tips: ['Parz pod przykryciem 5–10 minut.'], trivia: ['Nazwa rodzaju Melissa pochodzi od greckiego słowa „pszczoła”.'] },
  { id: 'nettle', n: 'Pokrzywa', c: 'Ziołowe', line: 'Ziemista, zielona, mineralna', caffeine: 'brak', temp: 95, g100: 1.2, steps: [480],
    what: 'Suszone liście pokrzywy zwyczajnej. Po wysuszeniu i zalaniu nie parzą.',
    how: ['Zbiór młodych liści w rękawicach', 'Suszenie'],
    why: 'Parzące włoski tracą działanie po wysuszeniu i zalaniu. Smak jest zielony, lekko słony i ziemisty.', origin: 'Europa, cały świat', taste: 'zielona, ziemista, lekko słona',
    tips: ['Dobrze łączy się z miętą lub cytryną.'], trivia: ['Z włókien pokrzywy od wieków robi się tkaniny.'] },
  { id: 'linden', n: 'Lipa', c: 'Ziołowe', line: 'Miodowa, kwiatowa, na przeziębienia', caffeine: 'brak', temp: 95, g100: 1.2, steps: [420],
    what: 'Suszone kwiatostany lipy, bardzo popularne w polskich domach.',
    how: ['Zbiór kwiatów w czasie kwitnienia (czerwiec, lipiec)', 'Suszenie w cieniu'],
    why: 'Kwiaty zawierają olejki o miodowym zapachu i śluzy, które dają łagodny, lekko oleisty smak.', origin: 'Europa', taste: 'miodowa, kwiatowa, łagodna',
    tips: ['Parz pod przykryciem 5–10 minut.'], trivia: ['Lipa to jedno z symbolicznych drzew słowiańskich.'] },
  { id: 'ginger', n: 'Imbir', c: 'Ziołowe', line: 'Korzenny, rozgrzewający', caffeine: 'brak', temp: 100, g100: 2, steps: [600],
    what: 'Plastry świeżego korzenia imbiru zalane wodą. Rozgrzewający napar.',
    how: ['Obranie korzenia', 'Pokrojenie w plastry', 'Zalanie wrzątkiem lub krótkie gotowanie'],
    why: 'Gingerole odpowiadają za ostry, palący smak. Gotowanie zmienia je w łagodniejsze, słodsze związki.', origin: 'Azja Południowa', taste: 'ostry, cytrusowy, rozgrzewający',
    tips: ['Dodaj cytrynę i miód, ale już po lekkim ostudzeniu.', 'Osoby przyjmujące leki na krzepliwość krwi powinny skonsultować się z lekarzem.'], trivia: ['Imbir jest podobnie jak kurkuma kłączem, a nie korzeniem.'] },

  { id: 'hibiscus', n: 'Hibiskus', c: 'Owocowe', line: 'Kwaśny, rubinowy, dobry na zimno', caffeine: 'brak', temp: 95, g100: 1.5, steps: [420],
    what: 'Suszone kielichy kwiatów Hibiscus sabdariffa, kwaskowe i intensywnie czerwone.',
    how: ['Zbiór kielichów po przekwitnięciu', 'Suszenie'],
    why: 'Zawiera antocyjany (czerwony barwnik) i kwasy organiczne, stąd kwaśny smak. Barwnik zmienia kolor po dodaniu cytryny na jaśniejszy.', origin: 'Afryka, Azja, Ameryka Środkowa', taste: 'kwaśny, żurawinowy, owocowy',
    tips: ['Świetny na zimno z lodem.', 'Osoby z niskim ciśnieniem lub przyjmujące leki na ciśnienie powinny pić go ostrożnie.'], trivia: ['W Egipcie i Sudanie pije się go jako karkade.'] },
  { id: 'rosehip', n: 'Owoc dzikiej róży', c: 'Owocowe', line: 'Kwaskowy, witamina C, długie parzenie', caffeine: 'brak', temp: 90, g100: 3, steps: [720],
    what: 'Suszone owoce dzikiej róży, kwaskowe i lekko słodkie.',
    how: ['Zbiór po pierwszych przymrozkach', 'Usunięcie pestek (opcjonalnie)', 'Suszenie'],
    why: 'Owoce są jednym z najbogatszych źródeł witaminy C wśród roślin. Wysoka temperatura i długie gotowanie ją niszczą, więc lepiej parzyć w ok. 90 °C.', origin: 'Europa, Azja', taste: 'kwaskowy, owocowy, lekko jabłkowy',
    tips: ['Rozgnieć owoce przed zalaniem.', 'Można zalać drugi raz.'], trivia: ['W czasie II wojny światowej Brytyjczycy zbierali owoce róży jako źródło witaminy C.'] },

  { id: 'rooibos', n: 'Rooibos', c: 'Rooibos i mate', line: 'Czerwony krzew z RPA, słodkawy, bez kofeiny', caffeine: 'brak', temp: 100, g100: 1.2, steps: [360, 420],
    what: 'Napar z igiełkowatych liści krzewu Aspalathus linearis, rosnącego prawie wyłącznie w górach Cederberg w RPA.',
    how: ['Zbiór i cięcie liści', 'Zwilżanie i utlenianie na stosach', 'Suszenie na słońcu'],
    why: 'Utlenianie nadaje czerwony kolor i słodkie, miodowo-orzechowe nuty. Zawiera mało garbników, więc nie robi się gorzki.', origin: 'Cederberg, Republika Południowej Afryki', taste: 'miód, orzechy, karmel',
    tips: ['Można parzyć długo, nie wyjdzie gorzki.', 'Dobry z mlekiem.'], trivia: ['Nazwa znaczy „czerwony krzew” w języku afrikaans.', 'Istnieje też zielony rooibos, który nie jest utleniany.'] },
  { id: 'mate', n: 'Yerba mate', c: 'Rooibos i mate', line: 'Pobudzająca, ziołowa, pita z kalebasy', caffeine: 'wysoka', temp: 80, g100: 2, steps: [300],
    what: 'Napar z liści ostrokrzewu paragwajskiego (Ilex paraguariensis), narodowy napój Urugwaju, Argentyny i Paragwaju.',
    how: ['Zbiór gałązek', 'Szybkie opalanie nad ogniem', 'Suszenie i rozdrabnianie', 'Opcjonalne leżakowanie'],
    why: 'Zawiera kofeinę (nazywaną też mateiną) i dymny, ziołowy smak od opalania. Wrzątek niszczy aromat i daje gorycz.', origin: 'Paragwaj, Argentyna, Urugwaj, Brazylia', taste: 'trawiasta, dymna, gorzkawa',
    tips: ['Nigdy nie zalewaj wrzątkiem, 70–80 °C.', 'W tradycyjnym sposobie kalebasę zalewa się wielokrotnie, pijąc przez bombillę.'], trivia: ['Dzielenie się kalebasą jest ważnym gestem towarzyskim w Ameryce Południowej.'] },
];

/** Grams of dry leaf for the water volume, rounded to a practical 0.5 g (0.1 g under 2 g). */
export function leafGrams(g100: number, ml: number): number {
  const g = (g100 * ml) / 100;
  return g < 2 ? Math.round(g * 10) / 10 : Math.round(g * 2) / 2;
}
/** Roughly how many level teaspoons that is (about 2 g per teaspoon of loose leaf). */
export const teaspoons = (g: number) => Math.max(0.5, Math.round((g / 2) * 2) / 2);
