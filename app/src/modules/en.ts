// English UI strings for the Air Fryer and Dom modules. Lookup is by the whole Polish phrase
// (never by fragments), so a phrase without a translation stays readable Polish instead of
// turning into a mixed sentence. Recipe content (dish names, steps, tips) is Polish only.
const en: Record<string, string> = {
  // modules and navigation
  'Air Fryer': 'Air Fryer', 'Dom': 'Home', 'Dania': 'Dishes', 'Timery': 'Timers', 'Tryby': 'Modes', 'Jajka': 'Eggs', 'Gotowanie': 'Cooking', 'Miarki': 'Measures',
  'Nawigacja Air Fryer': 'Air Fryer navigation', 'Nawigacja Dom': 'Home navigation', 'Dział aplikacji': 'App section', 'Timery kuchenne': 'Kitchen timers',
  'COSORI TURBOBLAZE 6 L': 'COSORI TURBOBLAZE 6 L', 'Ściąga Air Fryer': 'Air Fryer cheat sheet', 'TIMERY': 'TIMERS', 'Czas na potrząśnięcie': 'Time to shake',
  'TRYBY': 'MODES', 'Tryby i zasady': 'Modes and rules', 'POMOC W DOMU': 'HOME HELP', 'Idealne jajko': 'The perfect egg', 'Czasy gotowania': 'Cooking times', 'Miarki i temperatury': 'Measures and temperatures',
  // timers
  'Nazwa (np. Frytki)': 'Name (e.g. Fries)', 'Nazwa timera': 'Timer name', 'Minuty': 'Minutes', 'Sekundy': 'Seconds', 'Uruchom timer': 'Start timer',
  'Przypomnij w połowie, żeby potrząsnąć / obrócić': 'Remind me halfway to shake / turn', 'Ustaw czas dłuższy niż 0 sekund': 'Set a time longer than 0 seconds',
  'przypomnienie w połowie': 'reminder halfway', 'Brak aktywnych timerów. Wybierz danie albo ustaw czas powyżej.': 'No active timers. Pick a dish or set a time above.',
  'Timer działa niezależnie od urządzenia. Zostaw aplikację otwartą: ekran nie zgaśnie, dopóki timer odlicza. Pierwsze dotknięcie włącza dźwięk.': 'Timers run independently of the appliance. Keep the app open: the screen stays on while a timer counts down. The first tap enables sound.',
  'GOTOWE': 'DONE', 'OK, wyłącz': 'OK, stop', 'Wznów': 'Resume', 'Pauza': 'Pause', 'Od nowa': 'Restart', 'Usuń': 'Delete', 'Zamknij': 'Close',
  'Wyjmij jedzenie. Mięso sprawdź termometrem.': 'Take the food out. Check meat with a thermometer.', 'Wyłącz alarm': 'Stop alarm', 'Jeszcze 2 min': '2 more min', 'Parzenie trwa': 'Brewing in progress',
  // air fryer
  'Szukaj dania': 'Search dishes', 'Szukaj: frytki, skrzydełka, łosoś…': 'Search: fries, wings, salmon…', 'Ulubione': 'Favourites', 'Kategorie': 'Categories', 'Wszystkie': 'All',
  'Nic nie pasuje. Spróbuj innej nazwy albo ustaw własny timer w zakładce Timery.': 'Nothing matches. Try another name or set your own timer in Timers.', 'Nic nie pasuje.': 'Nothing matches.',
  'rozgrzej': 'preheat', 'obróć': 'turn', 'potrząśnij': 'shake', 'w środku': 'inside', 'nie trzeba': 'not needed', 'wg wyglądu': 'by look',
  'Ustaw na urządzeniu': 'Set on the appliance', 'Tryb': 'Mode', 'Temp.': 'Temp.', 'Czas': 'Time', 'Ilość (kosz 6 l)': 'Amount (6 l basket)', 'Tłuszcz': 'Fat', 'W trakcie': 'During', 'W środku': 'Inside',
  'Najpierw PREHEAT (ok. 3 min), potem ': 'First PREHEAT (about 3 min), then ', 'Krok po kroku': 'Step by step', 'Start timera': 'Start timer', 'z przypomnieniem': 'with a reminder', 'Najpierw timer rozgrzewania 3 min': 'Preheat timer first (3 min)',
  'Bezpieczna temperatura w środku': 'Safe internal temperature', 'Drób (pierś, udka, skrzydełka)': 'Poultry (breast, thighs, wings)', 'Mięso mielone': 'Minced meat', 'Wieprzowina (schab, karkówka)': 'Pork (loin, neck)', 'Ryby': 'Fish',
  'Wołowina: krwisty / średni / wysmażony': 'Beef: rare / medium / well done', 'Zasady, które zawsze działają': 'Rules that always work', 'dań w ściądze': 'dishes in the sheet',
  'Kosz wypełniaj maks. do połowy przy frytkach i warzywach': 'Fill the basket at most halfway for fries and vegetables', 'Przepis z piekarnika? Obniż temperaturę i skróć czas': 'Oven recipe? Lower the temperature and shorten the time',
  'Olej w sprayu lub pędzlem, nie lej': 'Spray or brush the oil, do not pour', 'Nie wkładaj papieru do pustego kosza w czasie grzania': 'Never put paper in an empty basket while it heats',
  'Ziemniaki': 'Potatoes', 'Drób': 'Poultry', 'Mięso': 'Meat', 'Warzywa': 'Vegetables', 'Mrożonki': 'Frozen', 'Przekąski': 'Snacks', 'Desery i wypieki': 'Desserts and baking', 'Odgrzewanie': 'Reheating',
  'Smażenie': 'Air frying', 'Pieczenie mięs': 'Roasting', 'Grill': 'Broil', 'Wypieki': 'Baking', 'Suszenie': 'Dehydrating', 'Wyrastanie': 'Proofing', 'Rozgrzewanie': 'Preheating',
  'Najszybszy nawiew. Frytki, skrzydełka, panierki, wszystko co ma być chrupiące.': 'Fastest airflow. Fries, wings, breaded food, anything that should be crispy.',
  'Dla większych kawałków mięsa i warzyw. Równo przypieka bez wysuszania.': 'For larger cuts of meat and vegetables. Browns evenly without drying out.',
  'Mocne ciepło od góry. Steki, przypiekanie serów, karmelizowanie.': 'Strong heat from above. Steaks, melting cheese, caramelising.', 'Produkty prosto z zamrażarki, bez rozmrażania.': 'Food straight from the freezer, no thawing.',
  'Wolniejszy nawiew, ciasto nie przypala się z wierzchu. Muffiny, zapiekanki, jajka.': 'Gentler airflow, batter does not burn on top. Muffins, gratins, eggs.', 'Pizza, frytki, panierki z wczoraj. Wracają chrupiące, nie gumowe.': "Pizza, fries, yesterday's breaded food. Comes back crispy, not rubbery.",
  'Bardzo niski nawiew i temperatura. Chipsy z owoców, suszone pomidory, zioła.': 'Very low airflow and temperature. Fruit chips, dried tomatoes, herbs.', 'Ciepło do wyrastania ciasta drożdżowego.': 'Warmth for proving yeast dough.', 'Rozgrzewa kosz ok. 3 min. Warto przed mięsem i frytkami.': 'Heats the basket in about 3 min. Worth it before meat and fries.',
  // home: eggs
  'Sposób': 'Method', 'We wrzątku': 'Boiling', 'Na parze': 'Steamed', 'Wielkość jajka': 'Egg size', 'Temperatura jajka': 'Egg temperature', 'S (małe)': 'S (small)', 'M (średnie)': 'M (medium)', 'L (duże)': 'L (large)', 'XL (bardzo duże)': 'XL (extra large)',
  'Z lodówki': 'From the fridge', 'Pokojowa': 'Room temp.', 'Na miękko': 'Soft-boiled', 'Półtwarde (mollet)': 'Medium (mollet)', 'Na twardo': 'Hard-boiled', 'Start': 'Start', 'od wrzenia': 'from boiling', 'na parze': 'steamed',
  'Białko ścięte, żółtko płynne.': 'Set white, runny yolk.', 'Białko twarde, żółtko kremowe, w środku miękkie.': 'Firm white, creamy yolk, soft in the middle.',
  'Białko i żółtko całkowicie ścięte. Dłuższe gotowanie daje szary pierścień wokół żółtka.': 'White and yolk fully set. Cooking longer gives a grey ring around the yolk.', 'Nad wrzącą wodą, pod przykryciem.': 'Over boiling water, lid on.',
  'Czas liczysz od chwili, gdy woda wrze, a jajka wkładasz łyżką. Po wyjęciu zalej zimną wodą.': 'Count from the moment the water boils, lowering the eggs in with a spoon. Cool in cold water afterwards.',
  'Czas liczysz od pojawienia się pary, garnek pod przykryciem. Po wyjęciu zalej zimną wodą.': 'Count from when steam appears, pot covered. Cool in cold water afterwards.',
  'Wartości orientacyjne dla jajka M z lodówki; wielkość i temperaturę korygują czas.': 'Times are for a medium egg from the fridge; size and temperature adjust them.',
  'Inne jajka': 'Other eggs', 'Świeżość i obieranie': 'Freshness and peeling', 'Test świeżości': 'Freshness test', 'Łatwe obieranie': 'Easy peeling', 'Pęknięta skorupka': 'Cracked shell',
  'Zanurz jajko w szklance wody. Świeże opada i leży na boku. Starsze niż tydzień staje pionowo (nadaje się, najlepiej na twardo). Pływające wyrzuć.': 'Put the egg in a glass of water. A fresh one sinks and lies on its side. Older than a week stands upright (fine, best hard-boiled). Floating ones go in the bin.',
  'Po ugotowaniu zalej zimną wodą i odczekaj. Do gotowania na twardo wybieraj jajka kilka dni starsze, bo świeże obiera się trudniej.': 'Cover with cold water after cooking and wait. For hard-boiled use eggs a few days old, fresh ones are harder to peel.',
  'Jajko wkładaj do wody łyżką. Łyżeczka soli w wodzie pomaga, gdy skorupka pęknie, i ułatwia obieranie.': 'Lower eggs into the water with a spoon. A teaspoon of salt helps if a shell cracks and makes peeling easier.',
  // home: cooking
  'Metoda': 'Method', 'Garnek': 'Pot', 'Piekarnik': 'Oven', 'Szukaj: ryż, brokuł, kasza…': 'Search: rice, broccoli, groats…', 'Szukaj produktu': 'Search ingredient',
  'Czas od zagotowania wody': 'Time from when the water boils', 'Czas od pojawienia się pary': 'Time from when steam appears', 'Po rozgrzaniu piekarnika': 'After the oven has preheated', 'COSORI TurboBlaze, tryb jak w dziale Air Fryer': 'COSORI TurboBlaze, mode as in the Air Fryer section',
  'Czasy orientacyjne: zależą od wielkości kawałków, garnka i płyty. Przycisk uruchamia timer z wartością środkową.': 'Times are approximate: they depend on piece size, pot and hob. The button starts a timer with the middle value.',
  'Kasze i ryż': 'Grains and rice', 'Makaron': 'Pasta', 'Strączkowe': 'Legumes', 'Mięso i ryby': 'Meat and fish',
  // home: measures
  'Produkt': 'Ingredient', 'Ilość': 'Amount', 'Jednostka': 'Unit', 'szklanka': 'cup', 'szklanki': 'cups', 'łyżka': 'tbsp', 'łyżki': 'tbsp', 'łyżeczka': 'tsp', 'łyżeczki': 'tsp', 'Tabela miarek': 'Measures table', 'Temperatury': 'Temperatures',
  'szklanka (250 ml)': 'cup (250 ml)', 'łyżka (15 ml)': 'tablespoon (15 ml)', 'łyżeczka (5 ml)': 'teaspoon (5 ml)',
  'Szklanka = 250 ml, łyżka = 15 ml, łyżeczka = 5 ml, miary płaskie (bez czubka). Wartości orientacyjne (±10%): zależą od ubicia i wilgotności.': 'Cup = 250 ml, tablespoon = 15 ml, teaspoon = 5 ml, level measures. Approximate (±10%): packing and humidity change them.',
  'Piekarnik z termoobiegiem': 'Fan oven', 'Obniż temperaturę o ok. 20 °C względem przepisu na tryb góra-dół.': 'Lower the temperature by about 20 °C compared with a top-and-bottom recipe.',
  'Przepis z piekarnika → Air Fryer': 'Oven recipe → Air Fryer', 'Obniż temperaturę o ok. 20 °C i skróć czas o ok. 20%.': 'Lower the temperature by about 20 °C and shorten the time by about 20%.',
};
export const isEnglish = () => document.documentElement.lang === 'en';
/** Translate a whole UI phrase; unknown phrases stay Polish. */
export const t = (pl: string): string => (isEnglish() ? en[pl] ?? pl : pl);
