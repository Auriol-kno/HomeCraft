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

- Stałe dolne menu: **Kuchnia / Napoje / Fryer / TM6 / Użyteczne / Zakupy**. Nie może znikać na ekranach modułów.
- Kuchnia: ekran startowy, książka 600 przepisów, wyszukiwanie według składników, wejście do zakupów i planowania, Moja lodówka oraz kontrola wydatków.
- Thermomix TM6: 65 własnych receptur do ręcznych ustawień (w tym 50 popularnych dodanych bez Cookidoo), timery i zasady używania.
- Książka: polskie i światowe kuchnie, popularne diety, Air Fryer/TM6, kcal na porcję, oceny, historia, ulubione i rozkład czasu. Cały kafel otwiera przepis; ulubione są grupowane na początku wyników.
- Napoje: Kawa, Parzenie, Sprzęt, Historia, Herbata i Fermentacja.
- Air Fryer: 37 dań dla COSORI TurboBlaze 6 l, oś czasu, ulubione, timery i zasady używania.
- TM6: przepisy, timery i zasady używania; aplikacja nie steruje urządzeniem.
- Użyteczne: timery, stoper, jajka, czasy gotowania i miarki.
- Zakupy: lista z działami sklepu, ilościami, szybkim dodawaniem i zapisem lokalnym.
- Kitchen OS: Plan → Przygotuj → Gotuj, harmonogram wstecz od godziny podania, checklisty, wspólne zasoby i timery.
- Fermentacja: kombucha, zakwasy i kiszonki, kalendarz oraz dziennik.

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
- „Moja lodówka” działa pod `#dom/fridge`: zapasy, terminy, minima, wartość i przekazywanie braków do Zakupów. Kontrola wydatków działa pod `#dom/expenses`: budżet miesięczny, transakcje i kategorie. Dane są rozdzielone na `homecraft.pantry.v1` i `homecraft.expenses.v1`, bez migracji istniejących kluczy.
- Kitchen OS nadal zapisuje jedną aktywną sesję.

## Start kolejnej sesji

1. Przeczytaj `README.md`, ten plik i `docs/AGENT_PROMPT.md`.
2. Sprawdź `git status`, `git fetch`, logi `main` i `demo-homecraft` oraz otwarte PR-y.
3. Zsynchronizuj demo, utwórz gałąź funkcji i dopiero wtedy zmieniaj kod.
4. Zakończ testami, kontrolą w przeglądarce i niezależnymi przeglądami opisanymi w `AGENT_PROMPT.md`.
