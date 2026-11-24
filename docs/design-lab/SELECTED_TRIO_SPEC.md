# HomeCraft Kitchen OS — selected trio 01 + 02 + 07
24 listopada 2026 · Product/UX design specification v0.1 · **CONCEPT ONLY — NOT RELEASED**

## Source and boundary
Grounding: `README.md`, `app/src/App.tsx`, `app/src/modules/timers.ts` and `docs/design-lab/CONCEPTS_2026.md`. Existing HomeCraft includes Coffee (including Lelit and grinders), Air Fryer, Home and Shopping, local data and PWA. This document proposes a future workflow and does not claim these new features already operate in the application. No existing navigation, timers, data or deployments may be removed.

## Product idea
**Three views, one cooking session.** 
- **01 Mission Control** answers: what is happening now / what needs my attention next / what finishes when?
- **02 Cooking Timeline** answers: in what order should I start steps to serve at 18:30?
- **07 Mise en Place** answers: what must be ready before I begin and what do I do next?

Not three competing home screens: they are interconnected stages.

## Information architecture
Bottom navigation in a new optional Kitchen OS experience: **Pulpit**, **Plan**, **Przygotuj**, **Moduły**.
The Moduły entry is a bridge to the existing full-featured Coffee, Air Fryer, Dom, Zakupy sections, not an inferior reconstruction.
Status/elapsed time remains visible in a compact dock when switching between views. No fake connected-appliance actions.

## Detailed screen wireframe A — Mission Control, home 390×844
```
┌─────────────────────────────────────┐
│  HOMECRAFT / KITCHEN OS     ◷ 17:47 │
│  Dobry wieczór                     │
│  Co dzisiaj gotujemy?              │
│  [ Obiad 18:30         Zmień › ]   │
├─────────────────────────────────────┤
│  W TRAKCIE                         │
│  [ 43:00 ] do podania              │
│  ▰▰▰▱▱ 2 z 5 zadań                 │
│  Teraz: Przygotuj marynatę         │
│  [ Przejdź do kroku        → ]      │
├─────────────────────────────────────┤
│  AKTYWNE TIMERY                    │
│  Air Fryer   12:40    [ Pauza ]    │
│  Ryż         06:15    [ Pauza ]    │
├─────────────────────────────────────┤
│  NASTĘPNIE                         │
│  17:55   Wstaw ryż                 │
│  18:10   Włącz Air Fryer           │
├─────────────────────────────────────┤
│  [Kawa] [Air Fryer] [Dom] [Zakupy] │
│  Pulpit    Plan   Przygotuj Moduły │
└─────────────────────────────────────┘
```
Precise hierarchy: large greeting (24–28px); hero deadline (40px) + one decisive CTA; active timers (24–32px, tabular numerals); next two actions only. Overflow is handled by vertical scrolling, not tiny labels. Empty state: “Nie ma aktywnego gotowania” with “Zaplanuj obiad” and direct module shortcuts. Error state: failed session load offers safe reset or local export; **must never delete user coffee data**.

## Detailed screen wireframe B — Cooking Timeline, schedule
```
┌─────────────────────────────────────┐
│  ← Pulpit       PLAN OBIADU         │
│  Podanie: [18:30 −] [ + ]           │
│  3 dania · 5 zadań · 2 urządzenia  │
├─────────────────────────────────────┤
│  17:45  18:00  18:15  18:30       │
│  🥣 Marynata  ━━━━━               │
│  🍚 Ryż             ━━━━━━━       │
│  🍗 Air Fryer    ━━━━━━━━━        │
│  🥦 Warzywa               ━━━━━   │
│                                 ║  │
├─────────────────────────────────────┤
│  17:45  Przygotuj marynatę          │
│  18:05  Rozgrzej Air Fryer          │
│  18:10  Wstaw kosz                  │
│  [ Przelicz plan ] [ Do przygotow.] │
│  ⚠ Czasy szacunkowe; gotowość mięsa│
│    sprawdź termometrem             │
└─────────────────────────────────────┘
```
Scheduling model is deterministic: task start = target serve time - required duration - relative offsets/dependency slack. Adjust estimated prep times; never silently change a running timer. Colored lanes always have labels (not color-only). A missed start creates a *replan suggestion* requiring confirmation. Empty state: “Dodaj pierwszą potrawę”; conflict state: two devices needed at the same time / impossible prep overlap; cannot promise cooking automation.

## Detailed screen wireframe C — Mise en Place, active cooking
```
┌─────────────────────────────────────┐
│  PRZYGOTOWANIE  3 / 6               │
│  Kurczak panko · 4 porcje          │
│  [■■■□□□]  Gotowe przed startem     │
├─────────────────────────────────────┤
│  □ 500 g piersi kurczaka            │
│  ☑ 2 jajka                         │
│  □ 120 g panko                      │
│  ☑ 1 łyżka oleju                    │
│  [ + Dodaj brakujące do zakupów ]   │
├─────────────────────────────────────┤
│  KROK 2 Z 5                        │
│  Obtocz kurczaka w jajku i panko   │
│  Podpowiedź: osobne naczynia...    │
│  [ Wstecz ]   [ Zrobione → ]        │
├─────────────────────────────────────┤
│  Urządzenie: COSORI (ręcznie)      │
│  200°C • 15–20 min (orientacyjnie) │
│  [ Start timera ]                   │
│  Bezpieczne gotowanie: termometr   │
└─────────────────────────────────────┘
```
Simple mode bypasses the preflight checklist to prevent excessive friction; guided mode explicitly confirms ingredients and the step. Keyboard/VoiceOver: semantic buttons and inputs, live timer updates not announced every second.

## UX decisions and trade-offs
| Question | Decision | Risk | Mitigation/test |
|---|---|---|---|
| First-screen density? | Dashboard shows **one next action**, two active timers max and overflow indicator | heavy task board | test glance comprehension under 3 seconds |
| When to ask for ingredients? | Preflight optional for quick timer; mandatory only before multi-dish plan (user can skip with warning) | slow start | benchmark start under 10 seconds |
| Timeline accuracy? | User sets serve time; all durations clearly labeled estimated | food safety/time misses | test delay/replan and dinner conflict |
| Device integration? | Only manual device settings in v1 | perceived smart control | “Ustaw ręcznie na urządzeniu” wording |
| Background iOS? | Absolute timestamps for remaining time; no claim of guaranteed audio | missed alarm while locked | real-device tests and visible warning |
| Existing modules? | Separate Kitchen OS shell with bridge navigation | losing legacy workflows | parity test all four sections + stored data |
| AI? | optional future suggestions, no LLM in MVP | latency/cost/hallucination | rules-based v1, opt-in AI later |

## User flows
### Flow 1: dinner at a fixed time
Pulpit -> “Zaplanuj obiad” -> select sample meal with 3 dishes -> Timeline calculates tasks backward from 18:30 -> user checks ingredients (Mise en Place) -> starts first action -> dashboard shows live progress -> manual appliance configuration -> user completes steps -> end-of-cooking report. At every stage users can see next step and which device to use.

### Flow 2: quick Air Fryer
Pulpit -> Air Fryer legacy module (direct shortcut) -> existing dish -> existing timer. **No new friction.**

### Flow 3: interrupted cooking
Pause step and timer manually; after iPhone becomes active again, show elapsed real time, overdue tasks and a replan choice. No invented audio alerts during suspension.

## Illustrative visual system (not a brand commitment)
Primary proposed palette: cream #F7F6F1; ink #172833; action navy #193D50; success deep green #23634A; warning copper #A45A22. Active cooking state can use a graphite control strip with lime/green action indicator but must retain contrast. Typography: native iOS sans; time digits monospaced/tabular. Touch targets >=44 CSS pixels. 320px layouts never introduce horizontal scrolling. Avoid large translucent cards, low-contrast tiny captions, and decorative progress animations during cooking.

## Criteria for approval
1. Interactions can be evaluated in a separate offline self-contained prototype, not production.
2. User chooses final style and prioritizes features before integration.
3. Accessibility verified by automated tests then real Safari/VoiceOver.
4. Legacy coffee brewing, Lelit calibration, Air Fryer dishes, household timers and shopping are still accessible and persistence is unchanged.
5. No merge or Vercel production deployment without separate approval.

## Claude Code handoff
Implement **concept-only** prototypes first. Existing role definitions in `.claude/agents/` provide four perspectives; they have not been executed in this conversation. Run a skeptical review and provide screenshots of 320px and 390px states. Report implementation diffs and test evidence. 
