# Badanie aplikacji: pomoc w kuchni i w domu (listopad 2026)

Przegląd sklepów z aplikacjami i serwisów porównawczych. Opisy to parafrazy ze stron sklepów i artykułów, bez ocen jakości, bo nie testowano tych aplikacji.

## Czasy gotowania, jajka, miarki

| Aplikacja | Co robi dobrze | Co warto przejąć |
| --- | --- | --- |
| Migma (iPhone) | Wiele timerów naraz z czasami gotowania dla ponad 60 produktów, skalowanie porcji, skan przepisu | Baza czasów z jednym przyciskiem do timera (jest w Gotowaniu), skalowanie porcji |
| Egg Timer Plus, EGGY Pro | Czas jajka z wielkości, temperatury początkowej i końcowej; wersja Pro dodaje wysokość n.p.m. | Korekta na wielkość i temperaturę (jest), wysokość n.p.m. (pomysł) |
| Boiled Egg Timer (Taparoo) | Bardzo prosty timer jajka o różnej twardości | Prostota: jeden duży przycisk (jest) |
| Cooking Converter Plus | Przeliczanie objętości na wagę według gęstości składnika, lista zakupów | Przelicznik z gęstością (jest), lista zakupów (pomysł) |
| Cook's Convertor | Trzy timery naraz, liczą dalej po zerze, dwa przeliczniki obok siebie | Timery liczące po zerze (pomysł) |
| Recipe Timer (Zafapp) | Gotowe timery do jajek, makaronu, ryb, mięs, kalkulator kuchenny, timer pieczeni, historia gotowania | Timer pieczeni według rodzaju mięsa i grubości (pomysł) |
| Deglaze | Tryb gotowania z jednym dotknięciem do timera, sesje z kilku przepisów | Tryb „gotuję teraz” (pomysł) |

Wniosek: w kategorii „czasy + miarki + timery” najbardziej zaawansowane aplikacje łączą bazę produktów, korekty (wielkość, temperatura) i wiele timerów. HomeCraft ma już te trzy elementy po polsku i w jednym wyglądzie, czego zwykle brakuje (angielskie aplikacje używają „cups” i uncji, nie szklanki 250 ml i dag).

## Prowadzenie domu (sprzątanie, obowiązki)

| Aplikacja | Pomysł |
| --- | --- |
| Tody, Sweepy | Harmonogram sprzątania po pokojach, aplikacja pamięta, kiedy zadanie wykonano ostatnio, i układa listę „na dziś” |
| Housy, Roomy | Automatycznie generowane zadania dla każdego pokoju, powtarzalność dzienna, tygodniowa, w wybrane dni |
| Flatastic, Homey, CleanTasker | Współdzielone listy, przydzielanie zadań domownikom, rotacja, punkty i nagrody |

## Planowanie posiłków i przepisy

Mealime (gotowe plany tygodnia), Paprika (import przepisów ze stron), AnyList, Plan to Eat, a z otwartych: KitchenOwl, Mealie, Cooklang. Wspólne elementy: lista zakupów łącząca składniki, tryb gotowania z wygaszonymi krokami, skalowanie, wspólne konto domowników.

## Proponowana kolejność rozbudowy działu Dom

1. **Zamienniki i przechowywanie:** czym zastąpić jajko, masło, mleko; ile dni trzymać produkty w lodówce, zamrażarce.
2. **Sprzątanie po pokojach:** powtarzalne zadania z datą ostatniego wykonania i listą „na dziś” (wzór Tody / Sweepy), wszystko lokalnie.
3. **Pranie i plamy:** symbole na metkach, temperatury prań, sposoby na typowe plamy.
4. **Zakupy i spiżarnia:** lista zakupów z ilościami z przelicznika miarek.
5. **Timer pieczeni i skalowanie porcji** (pomysły z Recipe Timer i Migma).

Każdy punkt to nowy wpis w `home-data.ts` i zakładka w `HomeModule.tsx`.

## Źródła

- App Store: Migma, Cooking Converter Plus, Cook's Convertor, Recipe Timer (Zafapp), Egg Timer Plus, EGGY Pro, Boiled Egg Timer, Tidily, Housy, Home Tasker, Roomy, Flatastic, Sweepy, CleanTasker
- Tom's Guide: 7 cleaning apps to help you maintain a tidy home
- Family Handyman: 11 Home Organization Apps
- Cooklang: Mealie vs Paprika vs KitchenOwl vs Cooklang (2026); Deglaze vs Paprika
- Fortune: best meal planning apps
- RMF24 (czasy jajek i test świeżości), Omni Calculator (miary kuchenne, szklanka 250 ml)
