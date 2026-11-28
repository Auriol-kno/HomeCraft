# HomeCraft — przekazanie projektu

Dokument dla osoby lub agenta przejmującego rozwój HomeCraft. Przed pracą przeczytaj również `README.md` i `docs/AGENT_PROMPT.md`.

Stan zweryfikowany 26.11.2026: `main` = `fc77f8b` (commit publikacyjny zbudowany ze źródła `64588c8`). Zawsze wykonaj `git fetch` i sprawdź aktualny HEAD — numer w tym dokumencie jest punktem odniesienia, nie blokadą aktualizacji.

## Czym jest HomeCraft

HomeCraft to polskojęzyczna, instalowalna PWA dla iPhone'a, napisana w React 19, TypeScript i Vite. Działa offline i łączy pomoc w gotowaniu, kawę, urządzenia, timery, fermentację oraz zakupy.

- Repozytorium: https://github.com/Auriol-kno/HomeCraft
- Produkcja GitHub Pages: https://auriol-kno.github.io/HomeCraft/
- Produkcja Vercel: https://home-craft-omega.vercel.app/
- Podgląd gałęzi `demo-homecraft`: https://home-craft-git-demo-homecraft-kno-flow.vercel.app/

## Aktualny produkt

- Stałe dolne menu: **Kuchnia / Napoje / Fryer / TM6 / Użyteczne / Zakupy**. Nie może znikać na ekranach modułów. Menu działu nie jest drugim dolnym paskiem, tylko przewijanym rzędem zakładek pod nagłówkiem (`.section-nav`).
- Kuchnia: ekran startowy, książka 600 przepisów, wyszukiwanie według składników, wejście do zakupów i planowania, Moja lodówka oraz kontrola wydatków.
- Thermomix TM6: 65 własnych receptur do ręcznych ustawień (w tym 50 popularnych dodanych bez Cookidoo), timery i zasady używania.
- Książka: polskie i światowe kuchnie, popularne diety, Air Fryer/TM6, kcal na porcję, oceny, historia, ulubione i rozkład czasu. Cały kafel otwiera przepis; ulubione są grupowane na początku wyników.
- Napoje: Kawa, Parzenie, Sprzęt, Historia, Herbata i Fermentacja. W Sprzęcie jest „Mój sprzęt”: 10 popularnych młynków, 5 popularnych ekspresów oraz kompletny katalog rodzin urządzeń LELIT opisany w README; każdy model ma parametry, punkt startowy espresso i harmonogram serwisu (`homecraft.coffeegear.v1`).
- Air Fryer: 37 dań dla COSORI TurboBlaze 6 l, oś czasu, ulubione, timery i zasady używania.
- TM6: przepisy, timery i zasady używania; aplikacja nie steruje urządzeniem.
- Użyteczne: timery, stoper, jajka, czasy gotowania i miarki.
- Zakupy: lista z działami sklepu, ilościami, szybkim dodawaniem i zapisem lokalnym.
- Kitchen OS: Plan → Przygotuj → Gotuj, harmonogram wstecz od godziny podania, checklisty, wspólne zasoby i timery.
- Fermentacja: kombucha, zakwasy i kiszonki, kalendarz oraz dziennik.

## Zasada zoptymalizowanego wykorzystania zasobów AI

> **Od 28.11.2026 obowiązuje tryb oszczędny jako domyślny** (szczegóły: `docs/AGENT_PROMPT.md`, punkt 0): bez osobnych agentów i recenzentów, lokalnie tylko testy celowane, pełne testy robi CI, krótkie raporty. Pełna analiza i agenci tylko na wyraźne polecenie właściciela („pełna analiza”, „wyższe parametry”). Poniższe punkty stosuj w ramach tego trybu.

Obowiązuje wszystkich agentów i asystentów pracujących nad projektem (ChatGPT, Codex, Claude i inne AI). Celem jest zachowanie wysokiej jakości wersji końcowej bez zużywania pełnego zestawu zasobów po każdej drobnej czynności.

1. **Domyślnie pracuj adaptacyjnie.** Proste odczyty, małe korekty tekstu, pojedyncze style i bezpieczne zmiany dokumentacji wykonuj w trybie oszczędnym, bez uruchamiania kompletu agentów i całego zestawu testów po każdej zmianie.
2. **Najpierw zbieraj materiał, potem zmieniaj kod.** Łącz powiązane drobne poprawki w jeden logiczny pakiet, aby nie powtarzać tych samych analiz, instalacji, buildów i testów.
3. **W trakcie pracy uruchamiaj testy celowane.** Po logicznym pakiecie zmian sprawdź bezpośrednio dotknięty moduł, typy lub odpowiedni scenariusz. Pełny `npm run build`, `npm test`, testy obu baz URL i przeglądy agentów wykonuj przed PR, przed scaleniem albo wcześniej, gdy zmiana jest ryzykowna.
4. **Od razu używaj wysokiej dokładności dla zmian wysokiego ryzyka:** danych użytkownika i `localStorage`, migracji, routingu i nawigacji globalnej, service workera, wdrożeń, timerów, harmonogramów, dostępności, bezpieczeństwa żywności oraz czasów i temperatur przepisów.
5. **Osobnych agentów uruchamiaj celowo.** Korzystaj z nich, gdy wymaga tego zadanie lub kontrola końcowa i gdy mogą niezależnie ocenić kod, QA, dostępność, dane/wdrożenie albo bezpieczeństwo żywności. Nie powielaj nimi prostego odczytu ani tej samej drobnej kontroli.
6. **Pełna bramka jakości pozostaje obowiązkowa.** Optymalizacja nie zwalnia z końcowych testów, przeglądu w przeglądarce i wymaganych recenzji przed wydaniem. Uwagi krytyczne i ważne trzeba poprawić, a kontrole powtórzyć.
7. **Raportuj uczciwie zakres weryfikacji.** Zawsze rozdziel to, co faktycznie uruchomiono, od tego, czego jeszcze nie sprawdzono. Brak zasobów lub niedostępne środowisko nie może być przedstawiane jako zaliczony test.
8. **Wyraźne polecenie właściciela ma pierwszeństwo.** Jeśli właściciel prosi o pełną weryfikację, dodatkowych agentów albo maksymalną dokładność na wcześniejszym etapie, wykonaj ją wtedy.

## Wygląd

**Editorial jest motywem domyślnym.** Ma wersję jasną i ciemną oraz osiem lokalnych fotografii WebP:

`app/src/editorial/{cookbook,coffee,tea,ferment,fryer,tm6,tools,shop}.webp`

Zdjęcia nagłówków są pokazywane bez twardego kadrowania i przechodzą w kolor tła. Tekst musi pozostać czytelny w obu trybach. Motywy Pastel, Palarnia, Kawiarnia, Soft i Linia nadal są dostępne w ustawieniach.

Zatwierdzona makieta: `docs/editorial/concept-editorial.png`. Dokument historyczno-projektowy: `docs/editorial/AI_HANDOFF.md`.

## Zasady pracy i gałęzie

1. `main` jest produkcją. Nie scalaj do `main`, nie publikuj ręcznie i nie zmieniaj Vercel bez wyraźnego polecenia **„scal do main”**.
2. Przed nową funkcją zsynchronizuj `demo-homecraft` z `main`.
3. Utwórz `feature/<krótka-nazwa>` od aktualnego `demo-homecraft` i otwórz PR do `demo-homecraft`.
4. Polecenie **„scal”** oznacza scalenie zaakceptowanego PR do `demo-homecraft`. Nie oznacza produkcji.
5. Polecenie **„scal do main”** oznacza PR `demo-homecraft → main`, sprawdzenie konfliktów i CI, scalenie oraz kontrolę automatycznego wdrożenia.
6. Nie nadpisuj cudzych zmian ani plików wygenerowanych. Główne `index.html`, `assets/` i `sw.js` tworzy workflow publikacyjny.

## Dane użytkownika

Nie kasuj ani nie zmieniaj znaczenia istniejących danych. Nowa funkcja dostaje własny wersjonowany klucz, walidowany przy odczycie. Migracja musi być jednorazowa i opisana w README.

Najważniejsze klucze:

- `cremalab.iphone.v3`, `cremalab.preferences.v1` — kawa i preferencje;
- `homecraft.timers.v1`, `homecraft.stopwatch.v1`;
- `homecraft.fryer.favs.v1`;
- `homecraft.shopping.v1`;
- `homecraft.kitchen.v1`;
- `homecraft.cookbook.favourites.v1`, `homecraft.cookbook.feedback.v1`;
- `homecraft.fermentation.v1`;
- `homecraft.coffeegear.v1` — Mój sprzęt (10 popularnych młynków, 5 popularnych ekspresów, LELIT: 4 aktualne rodziny młynków, 12 aktualnych rodzin ekspresów domowych, 2 starsze i 1 profesjonalny); wybór steruje zakładkami „Twój warsztat”;
- `homecraft.profiles.v1` — profile użytkownika (Ustawienia): migawka ustawień (`cremalab.preferences.v1`, pola ustawień z `cremalab.iphone.v3` bez historii i liczników, `homecraft.coffeegear.v1`); wczytanie zapisuje te klucze i przeładowuje aplikację;
- `homecraft.pastelDefault.v1`, `homecraft.editorialDefault.v1` — jednorazowe znaczniki migracji motywu.

Nie istnieje i nie należy dodawać klucza do własnych palet kolorystycznych — funkcja definiowania kolorów została odrzucona.

## Architektura i ważne pliki

| Obszar | Pliki |
| --- | --- |
| Powłoka, routing i nawigacja | `app/src/App.tsx` |
| Preferencje i motywy | `app/src/preferences.ts`, `app/src/editorial.css` |
| Kawa | `app/src/brewing.js`, `app/src/screens/*.html` |
| Książka | `Cookbook.tsx`, `cookbook-data.ts`, `cookbook-store.ts`, `cookbook-recipes*.ts` |
| Air Fryer | `FryerModule.tsx`, `fryer-data.ts` |
| Kuchnia i Użyteczne | `HomeModule.tsx`, `TimersScreen.tsx`, `home-data.ts` |
| Timery | `app/src/modules/timers.ts` |
| Kitchen OS | `KitchenModule.tsx`, `kitchen-data.ts`, `kitchen-store.ts` |
| Fermentacja | `FermentationScreen.tsx`, `fermentation.css` |
| Zakupy | `ShoppingModule.tsx`, `shopping-data.ts` |
| Tłumaczenia nowych modułów | `app/src/modules/en.ts` |

Routing używa hashy, m.in. `#home`, `#timer`, `#fermentation`, `#fryer/...`, `#dom/kitchen|recipes|timers|eggs|cook|thermomix/...|measures`, `#shop/...` i `#plan/plan|mise|cook`.

Wspólne dodawanie do zakupów używa zdarzenia `homecraft:shop-add` z `detail: [{name, qty}]`.

## Testy i jakość

Przed PR uruchom faktycznie:

```sh
npm ci
npm run build
npm test
```

Playwright wymaga Chromium: `npx playwright install --with-deps chromium` albo `CHROMIUM_PATH=/usr/bin/chromium npm test`.

Sprawdź oba warianty bazowej ścieżki:

- GitHub Pages: `/HomeCraft/`;
- Vercel: `/` (`npx vite build --base=/`).

Minimalna kontrola przeglądarkowa: start, wszystkie sześć pozycji dolnego menu, pełny zmieniany scenariusz, 320/390 px i desktop, dzień/noc, odświeżenie w trakcie oraz brak poziomego przewijania. Cele dotyku mają co najmniej 44 px, a kontrast ma spełniać WCAG AA.

Przy przepisach i temperaturach sprawdź bezpieczeństwo żywności. COSORI ma zakres 30–230 °C. Czasy i kcal są orientacyjne; nie wolno twierdzić, że 600 przepisów przetestowano fizycznie.

## Publikacja

- `vite.config.ts` używa `base: '/HomeCraft/'`.
- `vercel.json` buduje z `--base=/`.
- Workflow po zmianie źródła w `main` tworzy commit `Zbuduj stronę z …` z plikami strony w katalogu głównym.
- Vercel wdraża automatycznie; nie uruchamiaj ręcznego deployu.
- Service worker może chwilowo pokazywać poprzednią wersję. Przy zmianie cache sprawdź aktualizację i przeładowanie bez utraty danych.

## Znane ograniczenia

- Alarm, wibracje i wake lock wymagają osobnego testu na fizycznym iPhonie/Safari/PWA.
- Czasy, temperatury oraz kcal są redakcyjnymi wartościami orientacyjnymi.
- Produkty w Mojej lodówce mogą mieć zdjęcie jako okrągłą ikonkę (IndexedDB `homecraft-photos`, klucz = nazwa produktu, poza kopią JSON).
- „Moja lodówka” działa pod `#dom/fridge`: zapasy, terminy, minima, wartość i przekazywanie braków do Zakupów. Kontrola wydatków działa pod `#dom/expenses`: budżet miesięczny, transakcje i kategorie. Dane są rozdzielone na `homecraft.pantry.v1` i `homecraft.expenses.v1`, bez migracji istniejących kluczy.
- Kitchen OS nadal zapisuje jedną aktywną sesję.

## Start kolejnej sesji

1. Przeczytaj `README.md`, ten plik i `docs/AGENT_PROMPT.md`.
2. Sprawdź `git status`, `git fetch`, logi `main` i `demo-homecraft` oraz otwarte PR-y.
3. Zsynchronizuj demo, utwórz gałąź funkcji i dopiero wtedy zmieniaj kod.
4. Zakończ testami, kontrolą w przeglądarce i niezależnymi przeglądami opisanymi w `AGENT_PROMPT.md`.
