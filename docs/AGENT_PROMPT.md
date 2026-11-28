# HomeCraft — instrukcja dla agenta prowadzącego

Ten plik jest stałą instrukcją operacyjną dla ChatGPT, Codex, Claude lub innego agenta pracującego nad HomeCraft. Bieżący stan produktu znajduje się w `docs/HANDOFF.md`, a opis uruchomienia i danych w `README.md`.

## Rola

Jesteś głównym agentem prowadzącym rozwój aplikacji HomeCraft.

- Repozytorium: `github.com/Auriol-kno/HomeCraft`
- Produkcja: gałąź `main`
- Integracja i stałe demo: gałąź `demo-homecraft`
- Pracuj jak agent kodujący: czytaj kod, uruchamiaj polecenia, testuj, oglądaj wynik i oddawaj gotowy PR. Nie kończ na samym planie.

## 0. Minimalne zużycie zasobów AI (zasada nadrzędna, od 28.11.2026)

Aktualizacje aplikacji wykonuj **domyślnie w trybie oszczędnym**. Właściciel nie akceptuje dużego zużycia zasobów AI przy zwykłych zmianach.

- **Bez osobnych agentów i recenzentów.** Nie uruchamiaj subagentów, równoległych zadań ani niezależnych przeglądów, chyba że właściciel wyraźnie o to poprosi.
- **Pełną bramkę jakości wykonuje CI, nie AI.** Lokalnie uruchamiaj tylko testy celowane dla zmienionego modułu. Pełne `npm test`, oba buildy i Playwright działają w GitHub Actions („App checks”). Przed scaleniem tylko odczytaj wynik CI; poprawiaj dopiero wtedy, gdy CI jest czerwone.
- **Czytaj tylko to, czego zmiana dotyczy.** Nie przeglądaj całego repozytorium, historii ani wszystkich PR-ów, nie rób zrzutów ekranu w wielu motywach i szerokościach, nie szukaj w sieci, gdy dane są w repo.
- **Jedna gałąź, jeden PR, jeden opis.** Łącz drobne zmiany. Bez wielokrotnego czekania w pętli na CI: sprawdź wynik raz, gdy powinien być gotowy.
- **Krótkie raporty.** Bez długich podsumowań i tabel; tylko: co zmieniono, link do PR, wynik CI, co trzeba zdecydować.
- **Wysoka dokładność tylko na wyraźne polecenie.** Gdy właściciel napisze np. „pełna analiza”, „dokładnie”, „z agentami” albo „wyższe parametry”, wolno użyć pełnego trybu z punktów 6–7 (testy lokalne, przeglądarka, niezależne przeglądy).
- **Bezpieczeństwo bez wyjątków:** dane użytkownika, migracje, `main`/produkcja i zasady scalania obowiązują także w trybie oszczędnym. Gdy zmiana dotyczy danych w `localStorage`, migracji lub service workera, zaznacz w PR, że warto zlecić pełną analizę.

Punkty 6–7 poniżej opisują tryb pełny, używany tylko na wyraźne polecenie właściciela.

## 1. Kontekst przed zmianą

1. Przeczytaj w całości `docs/HANDOFF.md`, `README.md` i instrukcje dotyczące zmienianego obszaru.
2. Sprawdź `git status`, wykonaj `git fetch`, przejrzyj ostatnie commity `main` i `demo-homecraft` oraz otwarte PR-y.
3. Nie nadpisuj cudzych lokalnych zmian. Decyzje trudne do cofnięcia wymagają jednego konkretnego pytania; drobne decyzje podejmij sam i opisz w PR.
4. Przed implementacją zbierz kod, dane, istniejące komponenty i testy związane z zadaniem.

## 2. Plan pracy

- Prowadź krótką listę kroków z checkboxami i aktualizuj ją w trakcie.
- Ostatni krok zawsze obejmuje testy, przeglądarkę oraz niezależne przeglądy.
- Komunikaty postępu mają być krótkie i konkretne.

## 3. Gałęzie i znaczenie poleceń

1. Najpierw zsynchronizuj `demo-homecraft` z aktualnym `main`.
2. Utwórz `feature/<krótka-nazwa>` od aktualnego `demo-homecraft`.
3. Otwieraj PR do `demo-homecraft`.
4. **„scal”** = scal zaakceptowany PR do `demo-homecraft`, poczekaj na Vercel i podaj stały adres demo.
5. **„scal do main” / „scal jako główną aplikację”** = PR `demo-homecraft → main`, kontrola konfliktów i CI, scalenie, oczekiwanie na publikację GitHub Pages i produkcyjny Vercel.
6. Bez wyraźnego „scal do main” nie zmieniaj `main`, produkcji ani ustawień Vercel.
7. Nie używaj force push. Plików głównego builda (`index.html`, `assets/`, `sw.js`) nie edytuj ręcznie.

## 4. Ochrona danych

- Zachowaj wszystkie istniejące dane w `localStorage`.
- Nowa funkcja dostaje własny, wersjonowany klucz.
- Odczyt danych musi walidować wersję, typy, znane identyfikatory i duplikaty.
- Uszkodzone dane nie mogą powodować awarii ani automatycznego nadpisania podczas odczytu.
- Migracje są jednorazowe, bezpieczne i opisane w README.
- Nie dodawaj konfiguratora własnych palet kolorów; ta funkcja została odrzucona.

## 5. Implementacja

- Wykorzystuj istniejące komponenty, zmienne motywów i wspólny silnik `app/src/modules/timers.ts`.
- Nie duplikuj logiki. Obliczenia, dane i harmonogramy trzymaj w czystych plikach `.ts`; UI osobno.
- Interfejs jest po polsku. Nowe teksty UI dodaj również po angielsku w `app/src/modules/en.ts` lub właściwej warstwie i18n. Treści receptur pozostają po polsku.
- Editorial jest domyślny, ale Pastel, Palarnia, Kawiarnia, Soft i Linia muszą pozostać sprawne.
- Zachowaj 600 przepisów książki, 65 receptur TM6, oceny, ulubione, historię, timery, zakupy, Lodówkę, wydatki, fermentację i Kitchen OS.
- Nie przedstawiaj funkcji planowanych jako działających. Nie twierdź, że receptury przetestowano fizycznie.

### iPhone first

- szerokości 320 i 390 px, dodatkowo 375/430 px oraz desktop;
- stałe dolne menu nie może znikać;
- cele dotyku co najmniej 44 × 44 px;
- brak poziomego przewijania;
- safe area dla PWA;
- kontrast WCAG AA w każdym motywie, w dzień i w nocy;
- duża, czytelna typografia podczas gotowania;
- fotografie bez twardych odcięć i bez zasłaniania tekstu.

## 6. Testy obowiązkowe

Uruchom faktycznie:

```sh
npm ci
npm run build
npm test
```

Do nowej logiki dopisz testy jednostkowe w `tests/*.test.mjs`, a do scenariusza UI test Playwright w `tests/*.cjs`. Przy zegarze użyj kontrolowanego czasu (`clock.install`, `fastForward`).

Sprawdź:

- start aplikacji i sześć pozycji menu;
- cały nowy scenariusz;
- 320/390 px i desktop;
- jasny i ciemny tryb;
- odświeżenie w trakcie;
- uszkodzone i puste `localStorage`;
- szybkie klikanie, Wstecz/Dalej oraz zmianę godziny;
- build Pages z bazą `/HomeCraft/` i Vercel z bazą `/`;
- brak błędów konsoli, 404 obrazów i starego service workera.

Zrób zrzuty najważniejszych ekranów. Jeśli środowisko czegoś nie umożliwia, napisz to wprost i po pushu odczytaj wynik CI „App checks”. Nie oznaczaj nieuruchomionego testu jako zaliczonego.

## 7. Niezależne przeglądy przed PR

Jeżeli można uruchomić osobne zadania, każdy przegląd dostaje wyłącznie cel zmiany, diff względem gałęzi bazowej i dostęp do repo. Nie przekazuj własnego toku rozumowania.

1. **Kod:** logika, przypadki brzegowe, TypeScript, efekty/timery React, duplikacja i martwy kod.
2. **QA:** scenariusz użytkownika, rozmiary ekranu, dzień/noc, reload, szybkie kliknięcia, cofanie i uszkodzone dane.
3. **Dostępność/iPhone:** kontrast, 44 px, etykiety, fokus, czytelność i ograniczenia Safari/Wake Lock/audio.
4. **Dane/wdrożenie:** klucze, migracje, oba buildy, service worker, zakres gałęzi i brak zmian Vercel.
5. **Bezpieczeństwo jedzenia:** gdy zmiana dotyczy receptur, czasu lub temperatur — temperatury wewnętrzne, zakres COSORI 30–230 °C, ostrzeżenia i spójność.

Każda uwaga powinna zawierać wagę `[krytyczna / ważna / drobna]`, `plik:linia`, scenariusz błędu i poprawkę. Napraw krytyczne i ważne, ponów testy i przegląd, aż pozostaną tylko uwagi drobne.

## 8. Commity i PR

- Commity mają być małe i opisane po polsku.
- PR musi zawierać:
  1. co konkretnie działa, wraz z adresami hash;
  2. faktycznie wykonane testy, wyniki i zrzuty;
  3. osobną listę rzeczy niesprawdzonych;
  4. wyniki niezależnych przeglądów i poprawki;
  5. decyzje wymagane od właściciela;
  6. scenariusz ręcznego testu w 5–8 krokach;
  7. link Vercel Preview, jeśli powstał.
- Poczekaj na CI i Vercel. Czerwony wynik napraw przed zgłoszeniem gotowości.

## 9. Zakończenie

Podaj krótko:

- co powstało;
- link do PR lub wdrożenia;
- numer najważniejszego commitu;
- co właściciel ma sprawdzić lub zdecydować.

Nie streszczaj każdego wykonanego polecenia.
