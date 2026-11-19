# HomeCraft

Polskojęzyczny pomocnik domowy na iPhone'a (PWA, React + TypeScript + Vite) w trzech działach, w jednym wyglądzie:

- **Kawa:** dawne Crema Lab. Sześć metod parzenia, prowadzenie krok po kroku, timer, sprzęt (młynki, Lelit Anna), historia i baza kaw. Cały kod i dane są bez zmian.
- **Air Fryer:** dawna „Ściąga Air Fryer” pod COSORI TurboBlaze 6 l. 37 dań z trybem, temperaturą i czasem w układzie wyświetlacza urządzenia, kroki, ulubione, niezależne timery z przypomnieniem „potrząśnij / obróć”.
- **Dom (pomoc w domu):** nowy dział, który będzie rósł.
  - **Jajka:** czasy na miękko, półtwardo i na twardo (we wrzątku i na parze) z korektą na wielkość i temperaturę jajka, jajko w koszulce, sadzone, jajecznica, test świeżości.
  - **Gotowanie:** ponad 30 produktów (ziemniaki, warzywa, kasze, ryż, makaron, strączkowe, mięso i ryby) z czasami w garnku, na parze, w piekarniku i w Air Fryerze, proporcjami wody i jednym przyciskiem do timera.
  - **Miarki:** przelicznik szklanka / łyżka / łyżeczka / ml / g / dag / kg dla 30 produktów (np. szklanka cukru = 220 g = 22 dag), tabela miarek, °C ↔ °F, bezpieczne temperatury mięs.
  - **Timery:** wspólne dla wszystkich działów. Przetrwają odświeżenie, trzymają ekran włączony, dzwonią i wibrują, a pływający znacznik czasu jest widoczny też w dziale Kawa.

Motywy (Palarnia, Kawiarnia, Soft), tryb dzień / noc / systemowy, gęstość i język (PL / EN) działają we wszystkich działach, bo nowe ekrany używają tych samych zmiennych kolorów. Szczegóły: [docs/badanie-aplikacji.md](docs/badanie-aplikacji.md) (porównanie z innymi aplikacjami i plan rozwoju działu Dom).

## Uruchomienie i rozwój

Wymagany Node.js 22 i npm:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Otwórz adres Vite ze ścieżką `/HomeCraft/`. Nawigacja używa fragmentu URL: kawa `#timer`, `#history` itd., Air Fryer `#fryer/dishes|timers|modes`, Dom `#dom/eggs|cook|measures|timers`.

## Publikacja

Strona: https://auriol-kno.github.io/HomeCraft/

GitHub Pages publikuje `main / (root)` (Settings → Pages). `npm run build` sprawdza TypeScript, buduje Vite i kopiuje wynik do głównego `index.html`, `assets/`, ikon, `manifest.webmanifest` i `sw.js`. Po scaleniu do `main` workflow **App checks** sam buduje stronę i commituje wynik (`github-actions[bot]`), więc nie edytuj głównego `index.html` ręcznie. Wejście aplikacji to `app/index.html`.

Aplikacja działa offline (service worker) i da się ją dodać do ekranu początkowego.

## Dane i migracja

Wszystko jest w `localStorage` na urządzeniu. Klucze kawy (`cremalab.*`) zostały bez zmian, więc historia, kalibracja i baza kaw z Crema Lab są widoczne w HomeCraft w tej samej przeglądarce (GitHub Pages używa jednego adresu `auriol-kno.github.io` dla obu aplikacji). Nowe klucze: `homecraft.timers.v1` (timery) i `homecraft.fryer.favs.v1` (ulubione dania). Eksport / import kopii JSON w Historii obejmuje dane kawy; ulubione i timery nie są w kopii.

Ulubione i timery z dawnej Ściągi Air Fryer (artefakt Claude) są w innym adresie, więc trzeba je oznaczyć gwiazdką od nowa.

## Struktura

- `app/src/App.tsx`: powłoka, pasek działów (Kawa / Air Fryer / Dom), routing przez hash. Ekrany kawy pozostają zamontowane, żeby timer kawy działał podczas pracy w innym dziale.
- `app/src/modules/fryer-data.ts`, `FryerModule.tsx`: dane i ekran Air Fryera.
- `app/src/modules/home-data.ts`, `HomeModule.tsx`: jajka, czasy gotowania, miarki, temperatury. **Nowy temat w dziale Dom to nowy wpis w `home-data.ts` i zakładka w `HomeModule.tsx`.**
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

Przy systemowym Chromium: `CHROMIUM_PATH=/usr/bin/chromium npm test`. Testy: `tests/homecraft.test.mjs` (dane i przeliczniki, w tym szklanka cukru, jajka, spójność słowników), `tests/modules.cjs` (przeglądarka: przełączanie działów, 37 dań, timery, jajka, miarki, alarm, angielski, 320 px), a także wszystkie testy Crema Lab (`advice`, `coffees`, `mobile`, `features`).

## Zastrzeżenia

Czasy gotowania, ilości wody i gramatury są **orientacyjne**: zależą od wielkości produktu, sprzętu i wilgotności. Miary: szklanka 250 ml, łyżka 15 ml, łyżeczka 5 ml, bez czubka, dokładność około ±10%. Przy mięsie i drobiu sprawdzaj temperaturę termometrem. Nie testowano na fizycznym iPhonie (dźwięk, wibracje i wake lock zależą od Safari).
