# HomeCraft — przekazanie dla Claude

Stan: 28.11.2026. Ten plik uzupełnia `HANDOFF.md` i opisuje rozszerzenie **Napoje → Sprzęt → Mój sprzęt** o urządzenia LELIT.

## Co wdrożono

- Zachowano 10 popularnych młynków i 5 popularnych ekspresów istniejących wcześniej.
- Dodano wszystkie rodziny młynków widoczne w aktualnym katalogu producenta: Fred Prima PL043MMI, Fred Tempo PL044MMT, William PL72/PL72-P oraz Steve PM20.
- Dodano wszystkie 12 rodzin domowych ekspresów z aktualnej strony LELIT: Anna PL41EM/PL41TEM, Anita PL042EM/PL042TEMD, Victoria PL91T, Victoria3 PL91T3, Kate PL82T, Elizabeth PL92T, Elizabeth3 PL92T3, MaraX PL62X, MaraX3 PL62X3 i Bianca PL162T.
- Zachowano starsze Grace PL81T i Glenda PL41PLUST, a profesjonalną GiuliettaX PL2SVX umieszczono w osobnej grupie.
- Każde urządzenie ma specyfikację, instrukcję startową espresso, źródła i zadania serwisowe. Zaznaczanie „Zrobione dziś” oraz własne interwały działają przez istniejący magazyn.
- Lista jest podzielona na: aktualną ofertę LELIT, starsze modele i urządzenia profesjonalne. Kolory lub wykończenia o identycznej funkcjonalności są opisane jako warianty jednego modelu, zamiast dublować karty.
- Wybór Lelit William nadal odsłania asystenta młynka Crema Lab, a Lelit Anna PL41TEM — asystenta Anny.

## Dane i zgodność

- Nie dodano migracji ani nowego klucza. Nadal obowiązuje `homecraft.coffeegear.v1` w formacie `v: 1`.
- Dotychczasowe identyfikatory i zapisane wybory pozostają ważne. Nowe urządzenia mają trwałe identyfikatory `lelit-*`.
- Uszkodzony zapis jest walidowany jak wcześniej i nie jest automatycznie nadpisywany podczas odczytu.
- Dane urządzeń nie sterują sprzętem. Interwały serwisowe są orientacyjne; instrukcja konkretnego modelu i autoryzowany serwis mają pierwszeństwo.

## Najważniejsze pliki

- `app/src/modules/coffee-gear-data.ts` — katalog, serwis, walidacja danych.
- `app/src/modules/CoffeeGear.tsx` — grupowanie, wybór, szczegóły i harmonogram.
- `app/src/App.tsx` — integracja wybranego sprzętu z „Twoim warsztatem”.
- `tests/coffee-gear.test.mjs` — kompletność katalogu i walidacja.
- `tests/gear-pantry-nav.cjs` — wybór urządzeń, serwis, reload i widoki mobilne.

## Zasady dalszych zmian

1. Aktualizuj ofertę na podstawie oficjalnych kategorii `lelit.com/categorie-prodotti/coffee-grinders/` i `.../coffee-machines/`.
2. Nie twórz osobnej karty dla samego koloru lub wykończenia, jeżeli parametry i funkcje są identyczne; dodaj wariant do `specs`.
3. Nie zmieniaj istniejących ID. Nowy model dostaje nowe stabilne ID i test kompletności.
4. Nie zmieniaj wersji `homecraft.coffeegear.v1`, dopóki format zapisu pozostaje zgodny.
5. Po zmianie uruchom test celowany `node --experimental-strip-types tests/coffee-gear.test.mjs`; pełną bramkę wykonuje CI `App checks`.
