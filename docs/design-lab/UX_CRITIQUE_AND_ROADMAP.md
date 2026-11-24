# Kitchen OS — krytyczne porównanie UX i plan dostarczenia
Status: opinia projektowa / nie badanie na użytkownikach · 2026-11-24
Podstawa: aktualny README i kod HomeCraft oraz dokument SELECTED_TRIO_SPEC.md.

## Najważniejsza decyzja
**Nie wdrażamy trzech niezależnych interfejsów.** Traktujemy 01 jako pulpit, 02 jako plan i 07 jako wykonanie. Bez wspólnego modelu sesji trzy ekrany powielałyby statusy, mogłyby inaczej pokazywać czas i stwarzałyby ryzyko zagubionego timera.

| Aspekt | 01 Mission Control | 02 Cooking Timeline | 07 Mise en Place | Decyzja hybrydowa |
|---|---|---|---|---|
| Natychmiastowa orientacja | 5/5 | 3/5 | 3/5 | 01 na start |
| Plan wielu dań | 2/5 | 5/5 | 2/5 | 02 w planowaniu |
| Unikanie pominiętych kroków | 3/5 | 3/5 | 5/5 | 07 w gotowaniu |
| Szybkie użycie timera | 5/5 | 3/5 | 3/5 | skrót do starego timera |
| Obciążenie poznawcze | wysokie przy wielu kartach | wysokie przy wielu zależnościach | niskie przy jednym kroku | jeden główny CTA |
| Koszt zbudowania | średni | wysoki | średni | iteracyjne wdrożenie |
| Odporność na iPhone w tle | ograniczenie platformy | ograniczenie platformy | ograniczenie platformy | znane ograniczenie, bez obietnic alertu |

Skala 1–5 jest **subiektywną ekspercką oceną**, nie dowodem przewagi w badaniach. Nie mierzy czasu wykonania w praktyce.

## Odrzucane rozwiązania
1. Nie wprowadzamy AI-chatu jako głównego ekranu — wolniejszy od jednoznacznych akcji, halucynacje i koszt API.
2. Nie dodajemy automatycznego sterowania COSORI/Lelit/TM6 — brak potwierdzonych integracji.
3. Nie wymagamy przepisywania produktów do spiżarni przed timerem — zbyt wysoka bariera wejścia.
4. Nie używamy poziomego miniaturowego Gantta jako wyłącznego sposobu czytania planu na 320 px — chronologiczna lista musi być dostępna.
5. Nie zastępujemy istniejących ekranów Coffee/Air Fryer/Dom/Zakupy prototypową imitacją.

## P0 / P1 / P2
- **P0: pominięty koniec gotowania przy zablokowanym iPhonie.** Absolutne czasy końca gwarantują *rekonstrukcję stanu po powrocie*, ale nie dźwięk powiadomienia podczas uśpienia. W UI musi to być zrozumiałe; testować rzeczywisty Safari i tryb PWA.
- **P0: ryzyko żywnościowe.** Nigdy nie oznaczać mięsa „bezpieczne” tylko dlatego, że upłynął czas. Zachować informację o termometrze.
- **P1: konflikt w harmonogramie.** Dwie czynności z wymaganym tym samym urządzeniem, czynność z nieprzygotowanym składnikiem, spóźniony początek — wymagają ostrzeżenia i ręcznej akceptacji nowego planu.
- **P1: zmiana czasów w trakcie aktywnego timera.** Żadne automatyczne resetowanie timera po korekcie godziny podania.
- **P1: regresja starej aplikacji.** Sprawdzić bazę kaw, kalibracje Lelit/William/K-Pro, 37 potraw, listę zakupów, wszystkie timery, tłumaczenia i obecne motywy.
- **P2: przesadny dashboard.** Pokazujemy dwa najpilniejsze aktywne timery, nie więcej; reszta za „Pokaż wszystkie”.
- **P2: nadmiar checklist.** Włączany tryb szybki i prowadzony, bez przymusu zaznaczania produktów do zwykłego gotowania.

## Model danych / separacja
Proponowane domeny:
- `KitchenSession {id, title, servings, serveAt, tasks, status, version}`
- `KitchenTask {id, label, durationEstimateSec, dependsOnIds[], resourceId?, state, startedAt?, completedAt?}`
- `KitchenIngredient {id, amount, unit, checked, missing}`
- `DevicePreset {deviceType, temperatureC?, durationSec?, mode?, manualOnly: true}`
- `LinkedTimer {kitchenTaskId, existingTimerId}`

Adapter jest bezpieczniejszy niż kopiowanie silnika timerów. Sesje nowego workflow mają osobny klucz np. `homecraft.kitchen.sessions.v1`; klucze `cremalab.*`, `homecraft.timers.v1`, `homecraft.fryer.favs.v1` pozostają nietknięte. Migracje muszą być odwracalne i testowane. Schematy są planem, a **nie aktualnym kodem**.

## Przekazanie do Claude Code — fazy
| Etap | Deliverable | Kryterium stop | Ryzyko |
|---|---|---|---|
| 0. Design Lab | aktualna interaktywna makieta HTML, 3 ekrany, ocena | wybór stylu przez użytkownika | niskie |
| 1. Design System | tokeny, typografia, 320/390px, ciemny/jasny, komponenty | czytelność i 44px targety | niskie |
| 2. Kitchen Session | nowy model sesji, 1 przykładowy obiad, zapis i odczyt w izolacji | testy serializacji, odświeżenia i błędu | średnie |
| 3. Timeline Engine | dependency graph, walidacja konfliktów, ręczna zmiana targetu | testy powtarzalności i spóźnienia | wysokie |
| 4. Guided Cooking | checklist, kroki, obsługa dostępności, adapter timerów | brak resetu starych timerów | średnie |
| 5. Integration Preview | optional Kitchen OS shell, bridge do czterech modułów | 100% regresji starych funkcji | wysokie |
| 6. iPhone acceptance | Safari/PWA, wyłączony ekran, offline, VoiceOver, duże fonty | jawna akceptacja człowieka | wysokie |
| 7. Release | PR z raportem i zgodą | brak automatycznej publikacji | kontrolowane |

## Testy akceptacyjne na realnym zadaniu
**Scenariusz A:** kurczak panko + ryż + warzywa na 18:30, start po korekcie o +5 min; porównanie z używaniem zwykłych timerów. Kryterium testowe proponowane: użytkownik widzi następny krok w <=3 sekund, ręczna zmiana podania nie zeruje żadnego timera.
**Scenariusz B:** zwykłe espresso + lista zakupów, bez tworzenia sesji. Kryterium: dojście do istniejących ekranów nie wymaga dodatkowych ekranów startowych.
**Scenariusz C:** przepis z brakującym panko, opóźnieniem i uśpionym telefonem. Kryterium: brak cichej utraty stanu, czytelna korekta planu, jawnie ograniczony alarm.
**Scenariusz D:** tryb iOS VoiceOver i fonty powiększone, ekran 320 px. Kryterium: brak nieodczytywalnych etykiet, focus przewidywalny, przyciski minimum 44×44 CSS px.

## Rekomendacja krytyczna
Na MVP najbardziej broni się **07 + najprostszy element 01**. Dokładny plan 02 jest innowacyjny, ale wymaga wiarygodnych danych o czasie pracy i wykrywania konfliktów. Implementuj Timeline po zbudowaniu stabilnego modelu KitchenSession, nie jako pierwszy komponent UI.

## Stan weryfikacji
To dokument przygotowany przez asystenta na podstawie repo i wcześniejszej analizy. Czterech podagentów Claude Code **nie uruchomiono**. Funkcjonalne testy produkcji oraz testy iPhone nie zostały wykonane w ramach tego sprintu. Żaden release nie jest zatwierdzony.
