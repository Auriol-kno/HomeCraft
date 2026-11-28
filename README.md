# HomeCraft

Polskojęzyczny pomocnik kuchenny na iPhone'a (PWA, React + TypeScript + Vite), działający również offline.

- **Kawa:** dawne Crema Lab. Sześć metod parzenia, prowadzenie krok po kroku, timer, sprzęt (młynki, Lelit Anna), historia i baza kaw. Cały kod i dane są bez zmian.
- **Air Fryer:** dawna „Ściąga Air Fryer” pod COSORI TurboBlaze 6 l. 37 dań z trybem, temperaturą i czasem w układzie wyświetlacza urządzenia, kroki, ulubione, niezależne timery z przypomnieniem „potrząśnij / obróć”.
- **Kuchnia i książka kucharska:** ekran startowy Kuchni, 600 przepisów, wyszukiwanie, diety, urządzenia, kcal na porcję, oceny, ulubione i rozkład czasu. Cały kafel otwiera przepis, a ulubione są zawsze grupowane na początku wyników. „Moja lodówka” kontroluje zapasy, terminy, minima i wartość produktów; braki przekazuje do Zakupów. Kontrola wydatków zapisuje miesięczny budżet, transakcje i strukturę kategorii.
- **Użyteczne:** wspólne timery, stoper, jajka, czasy gotowania i miarki. Timery przetrwają odświeżenie i mogą być uruchamiane z innych działów.
  - **Jajka:** czasy na miękko, półtwardo i twardo, korekta na wielkość i temperaturę, jajko w koszulce, sadzone, jajecznica i test świeżości.
  - **Czasy:** ponad 30 produktów z czasami w garnku, na parze, w piekarniku i Air Fryerze oraz jednym przyciskiem do timera.
  - **Miarki:** przelicznik objętości i masy dla 30 produktów, tabela miarek, °C ↔ °F i bezpieczne temperatury mięs.
- **Thermomix TM6:** 65 przepisów (15 dotychczasowych i 50 nowych popularnych receptur) z ustawieniami czasu, temperatury i obrotów do ręcznego ustawienia na urządzeniu, bez Cookidoo i bez internetu. Duże przyciski Przepisy / Timery / Zasady używania działają wewnątrz ekranu TM6; ich adresy `#dom/thermomix/recipes|timers|rules` obsługują odświeżenie oraz Wstecz/Dalej.
- **Napoje:** Kawa, Parzenie, Sprzęt, Historia, 24 herbaty i napary oraz Fermentacja z przepisami, kalendarzem nastawów i dziennikiem.
- **Mój sprzęt** (Napoje → Sprzęt → Mój sprzęt): 10 popularnych młynków, 5 popularnych ekspresów oraz katalog LELIT. Obejmuje cztery aktualne rodziny młynków (Fred Prima, Fred Tempo, William w obu wykończeniach i Steve), 12 aktualnych rodzin ekspresów domowych (Anna/Anita z PID i bez PID, Victoria/Victoria3, Kate, Elizabeth/Elizabeth3, MaraX/MaraX3 i Bianca), starsze Grace/Glenda oraz profesjonalną GiuliettaX. Każdy model ma parametry ze źródłami, punkt startowy espresso i własny harmonogram serwisu z „Zrobione dziś” i edytowanymi interwałami. Klucz `homecraft.coffeegear.v1` zachowuje wcześniejsze wybory; asystenci Crema Lab dla Lelit William i Anna PL41TEM pozostają dostępni.
- **Zdjęcia produktów w Mojej lodówce:** zdjęcie (aparat lub galeria) staje się okrągłą ikonką produktu. Przycinane do 256 × 256 px JPEG, zapisywane w IndexedDB (`homecraft-photos`) według nazwy produktu, więc wraca przy ponownym dodaniu. Zdjęcia zostają na urządzeniu i nie trafiają do kopii JSON.
- **Zaplanuj gotowanie (Kitchen OS, demo):** dostępne z Air Fryera i Kuchni. Plan liczy harmonogram wstecz od godziny podania, a widoki Przygotuj i Gotuj obsługują checklisty, zakupy, równoległe kroki i wspólne timery. Ustawienia urządzeń są do wpisania ręcznie; aplikacja nie steruje sprzętem.
- **Zakupy:** lista zakupów z podziałem na działy sklepu, ilościami („2 l mleko”), odhaczaniem, szybkim dodawaniem częstych produktów, kopiowaniem/udostępnianiem i zapisem na urządzeniu.

Motyw **Editorial** jest domyślny. Korzysta z ośmiu lokalnych fotografii WebP, terakotowego akcentu i osobnych palet jasnej oraz ciemnej. Pastel, Palarnia, Kawiarnia, Soft i Linia pozostają dostępne. Tryb dzień / noc / systemowy, gęstość i język PL / EN działają we wszystkich działach.

## Uruchomienie i rozwój

Wymagany Node.js 22 i npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Otwórz adres Vite ze ścieżką `/HomeCraft/`. Nawigacja używa fragmentu URL: kawa `#timer`, `#history` itd., Air Fryer `#fryer/dishes|timers|modes`, Kuchnia `#dom/kitchen|recipes|fridge|expenses|timers|eggs|cook|thermomix/<recipes|timers|rules>|measures`, Zakupy `#shop/list|staples`, Zaplanuj gotowanie `#plan/plan|mise|cook`.

## Publikacja

Strona: https://auriol-kno.github.io/HomeCraft/

GitHub Pages publikuje `main / (root)` (Settings → Pages). `npm run build` sprawdza TypeScript, buduje Vite i kopiuje wynik do głównego `index.html`, `assets/`, ikon, `manifest.webmanifest` i `sw.js`. Po scaleniu do `main` workflow **App checks** sam buduje stronę i commituje wynik (`github-actions[bot]`), więc nie edytuj głównego `index.html` ręcznie. Wejście aplikacji to `app/index.html`.

Aplikacja działa offline (service worker) i da się ją dodać do ekranu początkowego.

## Dane i migracja

Editorial jest motywem domyślnym. Jednorazowa migracja `homecraft.editorialDefault.v1` przenosi wyłącznie poprzedni domyślny Pastel na Editorial. Jawnie wybrane Palarnia, Kawiarnia, Soft i Linia pozostają bez zmian. Historyczny znacznik `homecraft.pastelDefault.v1` nadal istnieje dla urządzeń, które pominęły wcześniejsze wydanie.


Wszystko jest w `localStorage` na urządzeniu. Klucze kawy (`cremalab.*`) zostały bez zmian, więc historia, kalibracja i baza kaw z Crema Lab są widoczne w HomeCraft w tej samej przeglądarce (GitHub Pages używa jednego adresu `auriol-kno.github.io` dla obu aplikacji). Nowe klucze: `homecraft.timers.v1` (timery), `homecraft.fryer.favs.v1` (ulubione dania), `homecraft.kitchen.v1` (jedna sesja „Zaplanuj gotowanie”), `homecraft.pantry.v1` (wersjonowane zapasy) i `homecraft.expenses.v1` (wersjonowany budżet oraz wydatki). Odczyt dwóch ostatnich kluczy waliduje wersję, typy, limity i daty; uszkodzony zapis daje pusty stan i nie jest nadpisywany podczas samego odczytu. Nie ma migracji ani zmian istniejących kluczy. Eksport / import kopii JSON w Historii obejmuje dane kawy; pozostałe moduły nie są jeszcze w kopii.

Ulubione i timery z dawnej Ściągi Air Fryer (artefakt Claude) są w innym adresie, więc trzeba je oznaczyć gwiazdką od nowa.

## Struktura

- `app/src/App.tsx`: powłoka, stały dolny pasek Kuchnia / Napoje / Fryer / TM6 / Użyteczne / Zakupy oraz routing przez hash. Ekrany kawy pozostają zamontowane, żeby timer kawy działał podczas pracy w innym dziale.
- `app/src/modules/fryer-data.ts`, `FryerModule.tsx`: dane i ekran Air Fryera.
- `app/src/modules/TimersScreen.tsx`, `timers.ts`: okrągły minutnik, stoper i wspólny magazyn timerów.
- `app/src/modules/shopping-data.ts`, `ShoppingModule.tsx`: lista zakupów.
- `app/src/modules/home-data.ts`, `HomeModule.tsx`: jajka, czasy gotowania, miarki, temperatury. **Nowy temat w dziale Dom to nowy wpis w `home-data.ts` i zakładka w `HomeModule.tsx`.**
- `app/src/modules/kitchen-data.ts`, `kitchen-store.ts`, `KitchenModule.tsx`: Zaplanuj gotowanie. Scenariusz i planowanie wstecz od godziny podania (jedna osoba i jeden kosz Air Fryera naraz), zapis sesji i trzy widoki. Nowy scenariusz to nowy `Recipe` w `kitchen-data.ts`.
- `app/src/modules/timers.ts`: wspólny silnik timerów (czas bezwzględny, dźwięk, wibracja, wake lock).
- `app/src/modules/ui.tsx`: wspólne elementy (arkusz szczegółów, timery, alarm, powiadomienie).
- `app/src/modules/en.ts`: angielskie napisy interfejsu nowych działów. Treść przepisów (nazwy dań, kroki) jest po polsku.
- `app/src/modules/modules.css`: style nowych działów, wyłącznie na zmiennych motywu.
- Pozostałe pliki w `app/src/` to Crema Lab (patrz historia repozytorium Crema-Lab, jego README opisuje silnik parzenia, motywy i warstwy CSS).

## Testy

```sh
npx playwright install --with-deps chromium
npm test
```

Przy systemowym Chromium: `CHROMIUM_PATH=/usr/bin/chromium npm test`. Testy: `tests/homecraft.test.mjs` (dane i przeliczniki, w tym szklanka cukru, jajka, spójność słowników), `tests/modules.cjs` (przeglądarka: przełączanie działów, 37 dań, timery, jajka, miarki, alarm, angielski, 320 px), `tests/kitchen.test.mjs` (planowanie: zależności, brak nakładania się pracy i kosza, opóźnienie), `tests/kitchen.cjs` (przeglądarka: cały scenariusz z kontrolowanym zegarem, alarm, przeładowanie, Zakupy, 320 / 390 px i desktop), a także wszystkie testy Crema Lab (`advice`, `coffees`, `mobile`, `features`).

## Zastrzeżenia

Czasy gotowania, ilości wody i gramatury są **orientacyjne**: zależą od wielkości produktu, sprzętu i wilgotności. Miary: szklanka 250 ml, łyżka 15 ml, łyżeczka 5 ml, bez czubka, dokładność około ±10%. Przy mięsie i drobiu sprawdzaj temperaturę termometrem. Nie testowano na fizycznym iPhonie (dźwięk, wibracje i wake lock zależą od Safari).

## Książka kucharska (demo)

Książka (`#dom/recipes`) zawiera 600 receptur, w tym dania polskie, azjatyckie i śródziemnomorskie,
polskie klasyki, szybkie dania, przekąski, napoje i soki. Karta przepisu ma adres
`#dom/recipes/<id>`. Wyszukiwanie obejmuje nazwę i składniki (wiele słów działa łącznie,
bez polskich znaków); filtry kuchni, posiłku, do 30 min i ulubionych łączą się.
Sortowanie: polskie A–Z, czas, kcal rosnąco lub malejąco. Lista pokazuje po 20 kart.
Stałe dolne menu prowadzi do Kuchni, Napojów, Air Fryera, TM6, Użytecznych i Zakupów. Kuchnia ma własny ekran startowy z wejściem do książki, wyszukiwania według składników, zakupów, planowania, Lodówki i Wydatków. Lodówka sortuje produkty według terminu, pokazuje niskie stany i przekazuje braki do istniejącej listy zakupów. Wydatki mają miesięczny budżet, historię i podział kategorii. Podmenu bieżącego działu jest zawsze nad nim. Książkę można filtrować według kuchni, posiłku, popularnych diet (wysokobiałkowa, niskowęglowodanowa, śródziemnomorska, wegetariańska, wegańska i bezglutenowa) oraz urządzenia (Air Fryer, Thermomix albo bez urządzenia). Cały kafel otwiera przepis, a oznaczone gwiazdką przepisy zawsze znajdują się przed pozostałymi, z zachowaniem wybranego sortowania w obu grupach. Ulubione pozostają w walidowanym kluczu `homecraft.cookbook.favourites.v1`; ta wersja nie wymaga migracji danych.

Editorial ma osobną jasną i ciemną paletę. Zdjęcia nagłówków są wyświetlane w całości (`contain`) i łagodnie przechodzą w rzeczywisty kolor tła, dzięki czemu nie mają twardych odcięć. Dolne menu Editorial i Kawiarni używa szklano-karmelowych przycisków z zagłębionym stanem aktywnym.

Każdy przepis przechodzi przez istniejące `#plan/plan`, `#plan/mise` i `#plan/cook`:
zakupy, checklisty, harmonogram i wspólne timery. Wybór innego przepisu wymaga
potwierdzenia, jeżeli istnieje postęp; usuwa wyłącznie timery przypisane do zastępowanej
sesji. Bez zmiany przepisu otwiera istniejący plan. Liczba porcji jest ustalona dla
receptury; automatycznego skalowania porcji/partii jeszcze nie ma.

Dane ulubionych: wyłącznie nowy klucz `homecraft.cookbook.favourites.v1`, format
`{v:1,ids:string[]}`. Odczyt waliduje wersję, typy, znane identyfikatory i duplikaty.
Uszkodzone dane dają pustą listę bez nadpisywania przy odczycie. Błąd zapisu jest
zgłaszany; ulubione działają wtedy tylko w pamięci. Nie ma migracji. Dotychczasowy
`homecraft.kitchen.v1` nadal przechowuje tę samą pojedynczą sesję i oryginalny przepis
panko zachowuje identyfikatory. Pozostałe dane nie są migrowane ani kasowane.

Baza jest lokalna w `cookbook-recipes.ts`; każdy rekord ma trwałe jawne ID (nie zmieniaj
ich przy edycji ani sortowaniu). Nowe rekordy dodaje się bez zmiany algorytmu katalogu;
test sprawdza wyszukiwanie i sortowanie całej bazy 600 rekordów. Logika jest w czystych
plikach `.ts`; interfejs w `Cookbook.tsx`. Planer uwzględnia wyłączne zasoby osoby,
kosza, kuchenki, piekarnika i blendera, także dodatkowe zasoby aktywnego kroku.
Nowe scenariusze są celowo sekwencyjne: jedna osoba i bez konfliktów sprzętu.

**Kcal na porcję są szacunkowe**, obliczane jako suma `gramy × kcal/100 g / 100`
podzielona przez liczbę porcji, zaokrąglana do całej kcal. Obejmują wszystkie wymienione
składniki, olej i dodatki. Wartości kcal/100 g są orientacyjnymi wartościami redakcyjnymi,
nie importem zweryfikowanych rekordów USDA ani danymi laboratoryjnymi. Szczegóły
obliczenia widać w karcie; suche produkty są ważone na sucho, konserwy po odsączeniu.
Soki mają określony uzysk i porcję w ml; kompot uwzględnia także zjedzone jabłka.
W rosole kcal zakładają zjedzenie mięsa i warzyw. Zamienniki i inne marki zmieniają kcal.

Receptury są własnymi domowymi opracowaniami, nie kopiami opisów źródłowych ani
rankingiem popularności. Linki kategorii służą jako inspiracje do doboru dań, nie jako
potwierdzenie dokładnej gramatury czy czasu. **Nie przetestowano ich w kuchni**.
W wybranych przepisach Air Fryera partie są jawnie rozdzielone na kroki. Większe porcje mogą wymagać dodatkowych partii i wydłużenia planu. Sprawdzaj gotowość,
a mięso termometrem: drób 75 °C (przyjęte zaokrąglenie w górę), mielona wieprzowina/
wołowina 71 °C, ryby 63 °C, całe kawałki wieprzowiny 63 °C + 3 min odpoczynku.
Podstawą progów jest FoodSafety.gov; nie zakładaj gotowości wyłącznie po czasie.

Źródła przeglądu (24.11.2026):
- https://www.kwestiasmaku.com/przepisy — polskie dania i codzienne gotowanie;
- https://www.recipetineats.com/category/asian-recipes/ — rodziny dań azjatyckich;
- https://www.bbcgoodfood.com/recipes/collection/family-meal-recipes — posiłki rodzinne;
- https://cosori.com/pages/air-fryer-recipes — inspiracje do Air Fryera;
- https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures — bezpieczeństwo;
- https://fdc.nal.usda.gov/ — możliwe przyszłe źródło zweryfikowanych danych odżywczych;
  obecne wartości nie są jego automatycznym importem.

Testy książki: `tests/cookbook.test.mjs` i `tests/cookbook.cjs` (wchodzą w `npm test`).
Zrzuty przeglądarkowe zapisują się w `test-results/cookbook/`, także jako artefakt CI.
Wariant Vercel: `npx vite build --base=/`, potem
`BOOK_BASE=/ CHROMIUM_PATH=/usr/bin/chromium node tests/cookbook.cjs`.
Wariant Pages: `npm run build`, potem `npm test`. Nie commituj wygenerowanych plików strony.
Safari na fizycznym iPhonie wymaga osobnego testu: alarm nie jest gwarantowany przy
zamkniętej aplikacji lub zablokowanym ekranie; wake lock zależy od wsparcia systemu.

## Kuchnia i rozkład czasu (demo)

Stałe dolne menu: Kuchnia / Napoje / Fryer / TM6 / Użyteczne / Zakupy. Dawny dział
Dom nosi nazwę **Kuchnia** i ma własny ekran startowy. Air Fryer oraz TM6 otwierają
się bezpośrednio z dolnego paska; ich menu kontekstowe to przewijany rząd zakładek pod nagłówkiem (od 28.11.2026 jest tylko jeden dolny pasek). Zachowane
są stare adresy `#dom/...` i `#fryer/...` oraz wszystkie
klucze localStorage; zmiana nazwy nie wymaga migracji. W EN sekcja to „Kitchen”,
a filtr kuchni pochodzenia przepisów pozostaje „Cuisine”.

Każda z 600 kart książki ma widoczny rozkład czasu z tego samego harmonogramu co
Plan: pasy osoby i używanego sprzętu, czas całkowity oraz rozwijane „Etapy i czasy”.
Oś w karcie liczy minuty od rozpoczęcia; w Planie pokazuje rzeczywiste godziny.
Pasy uwzględniają także współdzielone zasoby (np. osoba mieszająca na kuchence).
To podgląd bez zapisu: nie zastępuje sesji, nie zmienia godziny podania i nie uruchamia timerów.

Również każde z 37 dań Air Fryera ma oś rozgrzewania i pracy urządzenia oraz
momenty obrócenia/potrząśnięcia. Ta oś **nie obejmuje przygotowania z opisów**, dla
którego nie mamy osobnych danych o czasie (np. namaczania frytek); karta mówi o tym
wprost. Czasów receptur, temperatur i alarmów nie zmieniono.

Wspólny komponent: `CookingTimeline.tsx`; czyste projekcje: `timeline-data.ts`.
Testy: `tests/menu-timeline.test.mjs` i `tests/menu-timeline.cjs`, w `npm test` i
w dodatkowym przebiegu CI dla bazy `/`. Zrzuty: `test-results/menu-timeline/`.

Przy odczycie timerów niekompletne starsze rekordy są normalizowane (np. brakujące
marks/fired → puste tablice), bez zapisu migracji przy samym odczycie. Poprawne timery,
w tym stan rund i alertu przed końcem, są zachowywane. Karta Air Fryera przywraca
fokus po zamknięciu i zatrzymuje Tab wewnątrz modala. Żeberka pokazują również
istniejący etap BROIL 230 °C / 4 min; przypomnienia osi zachowują dokładność sekund.

### Rozbudowana książka kucharska
600 przepisów obejmuje kuchnie świata, polskie klasyki, popularne diety oraz 50 wypieków (20 ciast, 10 chlebów, 10 bułek i 10 innych wypieków). Oceny smaku 1–5, ulubione, historia przygotowań i sortowanie są lokalne. Trudność i wskaźnik składników są orientacyjne; przepisy nieprzetestowane w kuchni. Menu główne: Kuchnia, Napoje, Fryer, TM6, Użyteczne, Zakupy.

## Ładowanie i pamięć offline

600 przepisów książki jest w osobnym pliku (`app/src/modules/cookbook-all.ts`, ładowany przez `cookbook-load.ts`). Pobiera się chwilę po pierwszym ekranie albo od razu przy otwarciu książki; do tego czasu ulubione są sprawdzane tylko co do formatu, a zapisana sesja „Zaplanuj gotowanie” z przepisem z książki czeka na wczytanie i nie jest nadpisywana. Główny skrypt zmniejszył się o ok. 29%. Po wczytaniu, gdy urządzenie jest online, strona wysyła do service workera listę plików tej wersji, a ten usuwa starsze skrypty i style z `assets/` (zdjęcia zostają). Testy: `tests/lazy-cookbook.test.mjs`, `tests/coffee-gear.test.mjs`, `tests/gear-pantry-nav.cjs`.
