# HomeCraft — Editorial: dokument wdrożenia
Status 26.11.2026: wariant 04 został wdrożony i jest domyślnym motywem. Osiem zdjęć WebP, makiety, kod i testy znajdują się w repozytorium. Nie zamieniać fotografii na SVG ani na inne obrazy bez zgody.

## Cel
Utrzymywać zatwierdzony projekt z `docs/editorial/concept-editorial.png`, zachowując wszystkie funkcje i motywy. Pracować zgodnie z `docs/AGENT_PROMPT.md` i nie nadpisywać równoległych zmian.
## Pliki
app/src/editorial/{cookbook,coffee,tea,ferment,fryer,tm6,tools,shop}.webp — osiem zdjęć 16:9, kompozycja z wolną przestrzenią po lewej. docs/editorial/concept-editorial.png — zaakceptowana makieta. docs/editorial/concept-five-variants.png — porównanie, wariant 04 jest wiążący.
## Zasady utrzymania
1. Sprawdź git status, aktualny main, `editorial.css`, `preferences.ts`, `App.tsx`, `Cookbook.tsx` i style modułów. Nie resetuj cudzych zmian.
2. Korzystaj wyłącznie z lokalnych WebP przez względne `url('./editorial/cookbook.webp')` itd. Zdjęcia mają być widoczne w całości (`contain`), z pozycją dopasowaną do kompozycji i gradientem przechodzącym w rzeczywisty kolor tła. Nie używaj zewnętrznych URL. Zachowaj nagłówki HTML; nie wypalaj tekstu w grafice.
3. Zrealizuj wygląd makiety: grafitowy fotograficzny hero, ciepłe kremowe karty, terakotowy akcent, elegancka szeryfowa typografia nagłówków (lokalny font lub Georgia), czytelny systemowy sans w kontrolkach. Płaskie powierzchnie, subtelne obramowania, bez ciężkich cieni i fal. Dostosuj wszystkie ekrany, także szczegóły przepisu, kawa/parzenie/sprzęt/historia, herbata, fermentacja, Fryer, TM6, Użyteczne, zakupy, ustawienia.
4. Książka: wyszukiwarka na wierzchu, zwijane filtry z liczbą aktywnych i resetem, kategorie dostępne bez obcinania. Karty 2 kolumny gdy mieszczą się czytelnie. Nie przypisuj przypadkowych zdjęć do konkretnych dań: osiem obrazów to nagłówki tematyczne, nie 600 fotografii przepisów. Dodatkowe zdjęcia kart wymagają odrębnej biblioteki właściwie przypisanych obrazów. Nie twierdź że przepisy przetestowano fizycznie.
5. Editorial domyślny, pozostałe motywy Pastel, Palarnia, Kawiarnia, Soft i Linia dostępne. Zachowaj wybór motywu, tryb kolorów, język i ustawienia. Nie kasuj localStorage, ocen, ulubionych, 600 przepisów, timerów ani dziennika fermentacji.
6. Nawigacja: Kuchnia, Napoje, Fryer, TM6, Użyteczne, Zakupy; podmenu napojów zawiera Kawę i Ferment. Min. 44 px dotyku; bez poziomego overflow przy 320/375/390/430 px, zachowaj safe area i kontrast WCAG AA. Zwijane filtry tylko w Editorial, bez regresji pozostałych motywów.
7. Sprawdź package.json i uruchom rzeczywiste dostępne skrypty testowe, tsc, build Vite oraz testy nawigacji. Zweryfikuj każdy moduł na szerokościach mobilnych i desktop, dark/light, brak 404 obrazów, działanie 600 przepisów, filtrów, ulubionych, timerów, kalendarza .ics. Zaktualizuj nieaktualne oczekiwania testów 350→600 po sprawdzeniu rzeczywistej bazy. Zrób screenshoty. Nie przedstawiaj nieuruchomionych testów jako zaliczonych.
8. Zaktualizuj cache SW tylko gdy jest to potrzebne; nie usuwaj danych użytkownika. Nie wdrażaj ręcznie Vercel. Pracuj przez gałąź i PR według `docs/AGENT_PROMPT.md`, bez force push. Po uprawnionym scaleniu do `main` zweryfikuj automatyczne wdrożenie, SHA i publiczny adres. Jeśli testy nie przechodzą, napraw je przed scaleniem albo zgłoś konkretną blokadę.

## Stan wdrożenia

- Editorial jest domyślny; pozostałe motywy są dostępne.
- Osiem fotografii WebP znajduje się w `app/src/editorial/`.
- Zdjęcie Kawa jest ułożone jak ekran Parzenie i nie zasłania nagłówka.
- Fermentacja zachowuje czytelny tekst kart w jasnym i ciemnym trybie.
- Książka zawiera 600 przepisów, a obrazy nagłówków nie są przypisywane losowo do receptur.
- Funkcja definiowania własnych kolorów nie została zaakceptowana i nie należy do produktu.
