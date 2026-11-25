# HomeCraft — przekazanie projektu

Ten plik jest dla kolejnego asystenta lub osoby, która przejmuje pracę nad HomeCraft (np. ChatGPT, Codex, Claude). Zanim zaczniesz, przeczytaj go razem z `README.md`.

Stan na 24.11.2026: `main` = `a9c126a`.

## Czym jest HomeCraft

Kuchenna aplikacja PWA w React 19, TypeScript i Vite, po polsku. Ma działać wygodnie na iPhonie i offline.

- Repozytorium: https://github.com/Auriol-kno/HomeCraft
- Wersja publiczna: https://auriol-kno.github.io/HomeCraft/ oraz Vercel produkcyjny, oba z gałęzi `main`.
- Wersja testowa: https://home-craft-git-demo-homecraft-kno-flow.vercel.app/ z gałęzi `demo-homecraft`. Odświeża się po scaleniu PR do tej gałęzi.

## Zasady pracy

1. **`main` to produkcja.** Nie scalaj do `main` i nie wdrażaj na produkcję bez wyraźnej zgody właściciela.
2. **Każda zmiana idzie tą samą drogą:** osobna gałąź od aktualnego `demo-homecraft`, potem PR do `demo-homecraft`. Scalenie dopiero po akceptacji właściciela.
3. **Przed nową pracą zsynchronizuj `demo-homecraft` z `main`.** Teraz `demo-homecraft` jest za `main`: brakuje mu commita scalenia i commita z buildem strony.
4. **Nie zmieniaj ustawień Vercel.**
5. **Nie psuj zapisanych danych użytkowników** w `localStorage`. Nowe funkcje dostają własne klucze, a odczyt danych jest walidowany.
6. **Przed otwarciem PR** uruchom `npm run build` (`tsc --noEmit` + Vite) oraz `npm test` (testy jednostkowe i Playwright). CI „App checks” robi to samo na każdym PR. Vercel tworzy podgląd PR chroniony logowaniem.
7. **Wymagania interfejsu:**
   - Teksty po polsku, tłumaczenia EN dla elementów interfejsu w `app/src/modules/en.ts`. Treści przepisów tylko po polsku.
   - Czytelność na iPhonie przy 320 i 390 px.
   - Przyciski co najmniej 44 px.
   - Brak przewijania w poziomie.
   - Kontrast tekstu zgodny z WCAG AA.
8. **Opis PR** podaje, co działa, co faktycznie sprawdzono, co wymaga decyzji, oraz krótki scenariusz testu do przejścia w przeglądarce.

## Zasada zoptymalizowanego wykorzystania zasobów AI

Obowiązuje wszystkich agentów i asystentów pracujących nad projektem (ChatGPT, Codex, Claude i inne AI). Celem jest zachowanie wysokiej jakości wersji końcowej bez zużywania pełnego zestawu zasobów po każdej drobnej czynności.

1. **Domyślnie pracuj adaptacyjnie.** Proste odczyty, małe korekty tekstu, pojedyncze style i bezpieczne zmiany dokumentacji wykonuj w trybie oszczędnym, bez uruchamiania kompletu agentów i całego zestawu testów po każdej zmianie.
2. **Najpierw zbieraj materiał, potem zmieniaj kod.** Łącz powiązane drobne poprawki w jeden logiczny pakiet, aby nie powtarzać tych samych analiz, instalacji, buildów i testów.
3. **W trakcie pracy uruchamiaj testy celowane.** Po logicznym pakiecie zmian sprawdź bezpośrednio dotknięty moduł, typy lub odpowiedni scenariusz. Pełny `npm run build`, `npm test`, testy obu baz URL i przeglądy agentów wykonuj przed PR, przed scaleniem albo wcześniej, gdy zmiana jest ryzykowna.
4. **Od razu używaj wysokiej dokładności dla zmian wysokiego ryzyka:** danych użytkownika i `localStorage`, migracji, routingu i nawigacji globalnej, service workera, wdrożeń, timerów, harmonogramów, dostępności, bezpieczeństwa żywności oraz czasów i temperatur przepisów.
5. **Osobnych agentów uruchamiaj celowo.** Korzystaj z nich, gdy wymaga tego zadanie lub kontrola końcowa i gdy mogą niezależnie ocenić kod, QA, dostępność, dane/wdrożenie albo bezpieczeństwo żywności. Nie powielaj nimi prostego odczytu ani tej samej drobnej kontroli.
6. **Pełna bramka jakości pozostaje obowiązkowa.** Optymalizacja nie zwalnia z końcowych testów, przeglądu w przeglądarce i wymaganych recenzji przed wydaniem. Uwagi krytyczne i ważne trzeba poprawić, a kontrole powtórzyć.
7. **Raportuj uczciwie zakres weryfikacji.** Zawsze rozdziel to, co faktycznie uruchomiono, od tego, czego jeszcze nie sprawdzono. Brak zasobów lub niedostępne środowisko nie może być przedstawiane jako zaliczony test.
8. **Wyraźne polecenie właściciela ma pierwszeństwo.** Jeśli właściciel prosi o pełną weryfikację, dodatkowych agentów albo maksymalną dokładność na wcześniejszym etapie, wykonaj ją wtedy.

## Build i wdrożenia

- `vite.config.ts` ma `base: '/HomeCraft/'` dla GitHub Pages.
- `vercel.json` buduje z `--base=/`, bo Vercel serwuje od korzenia domeny. Oba warianty muszą działać.
- Workflow `publish` po każdej zmianie w `main` buduje stronę i zapisuje commit „Zbuduj stronę z …”. Pliki w katalogu głównym (`index.html`, `assets/`) to wynik builda. Nie edytuj ich ręcznie.
- Service worker (`app/public/sw.js`) zapisuje aplikację do pracy offline. Po wdrożeniu użytkownik może przez chwilę widzieć starą wersję.

## Moduły i ważne pliki

| Dział | Co robi | Pliki |
| --- | --- | --- |
| Kawa (Crema Lab) | Parzenie, sprzęt, historia, herbata. Starszy silnik. | `app/src/brewing.js`, `app/src/screens/*.html` |
| Air Fryer | 37 dań dla COSORI TurboBlaze 6 l, ulubione, timery z przypomnieniami | `app/src/modules/fryer-data.ts`, `FryerModule.tsx` |
| Dom | Timery, stoper, jajka, czasy gotowania, miary | `HomeModule.tsx`, `TimersScreen.tsx`, `home-data.ts` |
| Zakupy | Lista zakupów z działami sklepu | `ShoppingModule.tsx`, `shopping-data.ts` |
| Zaplanuj gotowanie (Kitchen OS) | Plan → Przygotuj → Gotuj | `kitchen-data.ts`, `kitchen-store.ts`, `KitchenModule.tsx` |

Elementy wspólne:

- **Timery:** `app/src/modules/timers.ts`. Odpowiada za alarm, przypomnienia „potrząśnij / obróć”, podtrzymanie ekranu i zapis w `homecraft.timers.v1`.
- **Dodawanie do Zakupów z innych modułów:** zdarzenie `window` o nazwie `homecraft:shop-add`, w `detail` lista `[{ name, qty }]`.
- **Routing przez hash:** `#home`, `#fryer/...`, `#dom/...`, `#shop/...`, `#plan/plan|mise|cook`. Obsługuje go `app/src/App.tsx`.
- **Motywy:** `app/src/preferences.ts`. Dostępne są Pastel (domyślny), Palarnia, Kawiarnia (`bar`), Soft i Linia, każdy w trybie dzień / noc / systemowy.

Klucze w `localStorage`:

- `cremalab.*`: kawa i preferencje.
- `homecraft.timers.v1`, `homecraft.fryer.favs.v1`, `homecraft.shopping.v1`, `homecraft.stopwatch.v1`.
- `homecraft.kitchen.v1`: sesja „Zaplanuj gotowanie”.
- `homecraft.pastelDefault.v1`: znacznik jednorazowego przełączenia motywu.

## Ostatnio zrobione (PR #1, #4 i #5, wszystko jest w `main`)

1. **„Zaplanuj gotowanie”.** Przycisk jest w Air Fryer → Dania i w Dom → Timery. Jest jeden scenariusz: kurczak w panko, frytki i sałatka na 2 porcje.
   - **Plan:** godzina podania i harmonogram liczony od niej wstecz. Uwzględnia, że gotuje jedna osoba i że Air Fryer ma jeden kosz.
   - **Przygotuj:** składniki, sprzęt i czynności do odhaczenia. Nieodhaczone składniki można dodać do Zakupów.
   - **Gotuj:** pokazuje, co teraz, co następne i o której koniec. Obsługuje kroki równoległe, timery z alarmem, opóźnienie i przeliczenie planu (działające timery się nie resetują).
   - Testy: `tests/kitchen.test.mjs` i `tests/kitchen.cjs`.
2. **Stoper.** Cyfry są niżej i na podkładzie, więc wskazówka ich nie zasłania. Przycisk Pauza wypełnia się w rytm minuty.
3. **Motyw Pastel jako główny wygląd.** Szałwiowe tło z falami, jasne karty z miękkim cieniem, terakota i teal, wersja nocna.
   - Pliki: `app/src/pastel.css` (paleta i tło) oraz układ wspólny z Kawiarnią: selektory `bar` obejmują też `pastel`.
   - Zapisany dawny domyślny motyw Palarnia przełącza się raz na Pastel.

## Otwarte decyzje i pomysły

- Czy „Zaplanuj gotowanie” ma mieć własną zakładkę w pasku działów? Teraz to karta w Air Fryer i Dom.
- Namaczanie frytek przez 30 min wydłuża plan do 1 h 22 min. Skrócić je albo dać jako opcję?
- Kolejne scenariusze gotowania: nowy obiekt `Recipe` w `kitchen-data.ts`, ewentualnie wybór spośród dań Air Fryera.
- Czasy dla kurczaka w panko (200 °C, 12 min, obrócić w połowie) trzeba sprawdzić na prawdziwym COSORI.
- Test na fizycznym iPhonie: dźwięk alarmu, wibracje i podtrzymanie ekranu w Safari i w PWA. Do tej pory testowano tylko w Chrome i przez Playwright.
- Otwarte PR do decyzji:
  - **#2** (`concept/homecraft-kitchen-os-2026`): koncepcje i dokumentacja Kitchen OS.
  - **#3** (`ops/vercel-quality-2026`): nagłówki bezpieczeństwa Vercel dla `main`.

## Jak zacząć

1. Przeczytaj `README.md` i ten plik. Przejrzyj `git log` na `main`.
2. Zsynchronizuj `demo-homecraft` z `main`, potem utwórz gałąź roboczą.
3. `npm ci`, potem `npm run dev` do pracy, a `npm run build` i `npm test` przed PR.
4. Zaproponuj plan, zanim zaczniesz większą zmianę.
