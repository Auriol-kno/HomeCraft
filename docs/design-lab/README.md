# HomeCraft Kitchen OS — prototyp 01 + 02 + 07

**Status:** wyłącznie laboratorium UX. Nie jest częścią działającej aplikacji HomeCraft. Nie zapisuje żadnych danych i nie steruje urządzeniami.

## Otwórz prototyp

Plik: [demo/index.html](demo/index.html). Jest **samodzielny** (jeden HTML, CSS, JavaScript bez zewnętrznych bibliotek i API). Pobierz go i otwórz lokalnie w przeglądarce albo uruchom serwer statyczny w folderze `demo`:

```sh
python -m http.server 8080
```

Następnie wejdź na `http://localhost:8080`.

Podgląd HTML online przez zewnętrzną bramkę renderującą GitHub, o ile przeglądarka na to pozwala:
https://raw.githack.com/Auriol-kno/HomeCraft/concept/homecraft-kitchen-os-2026/docs/design-lab/demo/index.html

Uwaga: link online wymaga zewnętrznej usługi raw.githack, nie jest jeszcze niezależnie potwierdzonym wdrożeniem; oficjalny Vercel i GitHub Pages HomeCraft **nie są zmieniane**.

## Co faktycznie działa w interaktywnym prototypie?

- 4 nawigowane sekcje: Pulpit, Plan, Przygotuj, Moduły.
- Pulpit: podsumowanie sesji i symulacja dwóch niezależnych odliczeń z pauzą/wznowieniem.
- Plan: zmiana godziny podania ±5 minut aktualizuje wszystkie godziny czynności.
- Przygotuj: checklist składników, postęp, 5 kroków z przewijaniem w przód/w tył.
- Przygotuj: przycisk demonstracyjnego timera uruchamia przykładowy 15-minutowy licznik na pulpicie.
- Moduły: wyliczenie istniejących funkcji, ale bez połączenia z aktualną aplikacją.
- Makieta mobilna: viewport 320 i 390 px, semantyczne przyciski, kontrastowe kontrolki.

**To symulacja.** Harmonogram korzysta z przykładowego obiadu, nie jest jeszcze silnikiem zależności. Odliczanie demo nie zapisuje stanu między odświeżeniami; realny HomeCraft już ma niezależny silnik timerów i ten należy wykorzystać dopiero w planowanej integracji.

## Testy prototypu

```sh
npm ci
npx playwright install chromium
node tests/design-lab.cjs
```

Automatyczne testy w `.github/workflows/design-lab.yml` testują interakcje i brak overflow na 320/390px. Nie publikują serwisu.

## Dalej w Claude Code

1. `git fetch origin && git switch concept/homecraft-kitchen-os-2026`
2. Przeczytaj `CLAUDE.md`, `docs/design-lab/SELECTED_TRIO_SPEC.md`, `docs/design-lab/UX_CRITIQUE_AND_ROADMAP.md`.
3. Uruchom role z `.claude/agents/` (jeżeli dostępne), wykonaj niezależną recenzję i zachowaj jej dowody.
4. Ustal z właścicielem projektu ostateczny kierunek stylistyczny; dopiero potem buduj moduły w React na nowej gałęzi implementacyjnej.
5. Nie modyfikuj produkcyjnego `main`, Vercel ani GitHub Pages bez osobnej akceptacji.

## Wyraźne ograniczenia
W prototypie nie ma prawdziwego planowania całego obiadu, integracji z urządzeniami, automatycznych powiadomień, synchronizacji rodzinnej, importu danych ani dostępu do danych użytkownika. Żaden z tych elementów nie powinien być reklamowany jako gotowy.
