# HOMECRAFT — Kitchen OS 2026: discovery & concept selection
Date: 2026-11-24. Status: exploratory, NOT implementation approval.
Source project: HomeCraft v3 (React 19, TypeScript, Vite, PWA, GitHub Pages main). Keep all existing features and data unchanged.

## Verified existing implementation (repo README)
- Coffee: six brewing methods, grinder and Lelit Anna, history and tea.
- Air Fryer: 37 recipes, device modes, timers and favorites.
- Home: independent timers, eggs, cooking, measurements, Thermomix TM6 manual instructions.
- Shopping: sectioned offline-friendly list.
- Themes Palarnia/Kawiarnia/Soft/Linia; PL/EN; light/dark; mobile PWA.
- Storage: localStorage. No confirmed server sync; PWA notifications when backgrounded must be tested on iOS.
- DO NOT imply native appliance control: no verified appliance APIs or supported integrations.

## Competitor evidence (research 2026-11-24)
1. Paprika 4 offers recipe import from social apps, shopping, meal planning, pantry, voice, timers, barcodes, widgets/Shortcuts. https://www.paprikaapp.com/news/2026/09/28/paprika-4-is-now-in-open-beta/
2. Samsung Food+ offers AI-guided recipes, planning and compatible appliance workflows. https://samsungfood.com/food-plus/
3. Kitchen Stories focuses on guided recipes, shopping and suggestions. https://apps.apple.com/us/app/kitchen-stories-easy-recipes/id771068291
4. SideChef features guided cooking and integrations for compatible smart appliances. https://www.sidechef.com/business/iot-and-smart-kitchen
5. Cookidoo features Guided Cooking and weekly planning, with new assistant features. https://support-gb.vorwerk.com/hc/en-gb/articles/30641414749724-What-s-new-with-the-latest-Cookidoo-update
6. Cooklist offers pantry expiry prediction and collaborative shopping. https://cooklist.com/cooklist-app
7. Home Assistant dashboards support dedicated kitchen displays and timer entities. https://www.home-assistant.io/dashboards/

Therefore **not differentiated on their own**: AI chat tab, shopping checklist, generic recipe gallery, kitchen timer, automatic meal planner, pantry list.

## Ten deliberately different visual/product directions
| ID | Concept | Distinctive visual language | Core job-to-be-done | Truly different interaction | Main risk | Complexity |
|----|---------|-----------------------------|--------------------|------------------------------|-----------|------------|
| 01 | Kitchen Mission Control | dark charcoal + electric lime, modular live cards | See all kitchen activity in one place | Single 'now/next' board, multi-timer command surface | dashboard overload | M |
| 02 | Cooking Timeline | ivory + deep blue, horizontal Gantt/task rails | Finish whole meal together | schedule backward from serving time; dependency graph | inaccurate prep-time estimates | H |
| 03 | Zero Waste Atlas | sage + terracotta, ingredient-first photo tiles | Cook using food already at home | three confidence levels for 'have / maybe / missing'; expiry nudges | inventory maintenance burden | H |
| 04 | Hands-Free Sous Chef | cobalt + warm white, giant type and single action | Operate with wet hands | voice-led, full-screen step with one large confirmation | Web Speech reliability / accessibility | H |
| 05 | Appliance Bridge | graphite + amber, physical-dial instrument UI | Work with kitchen devices | manual 'set appliance' cards and synchronized timers | mistaken implication of real IoT control | M |
| 06 | Family Kitchen Board | coral + indigo, visual household planner | Divide meal prep with household | roles, portions, shared tasks, kid-safe assistance | account/sync/privacy scope | H |
| 07 | Mise en Place | matte white + vermilion, disciplined chef grid | Avoid missing ingredients or forgetting steps | preflight checklist before starting heat | feels too rigid for casual meals | M |
| 08 | Adaptive Kitchen Companion | deep violet + neutral cream, contextual bottom sheets | Answer 'What can I do in 20 min?' | constraint-based choice engine with explainable tradeoffs | hallucinated recipes / unsafe suggestions | H |
| 09 | Classic Recipe Folio | parchment + burgundy serif, archival editorial | Enjoy browsing reliable recipes | beautifully typeset recipe sheets, handwritten-style notes | looks like a cookbook, not a tool | L |
| 10 | Classic Culinary Atelier | warm marble + brass, restrained European heritage | Bring calm premium ritual to cooking | a minimalist start screen with timer/recipe precision | expensive visual assets; accessibility | M |

Concepts 09 and 10 are the ONLY deliberately classical directions. No generic ten-color reskins. Every concept needs a home screen, active cooking screen, error/empty state, and safe dark/light variant.

## Critical product priorities (proposed)
- P0: accuracy/safety and state preservation. Timer persists across navigation; when iOS suspends PWA, on-return time must be correct (audible alerts while suspended cannot be guaranteed).
- P0: food safety disclaimers and thermometer-based verification, not absolute claims based on cooking time. Official reference: https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures
- P1: accessibility and wet-hand controls >=44x44, big contrasting time, no gesture-only critical actions, VoiceOver labels.
- P1: quick start under 10 seconds, no login for core functionality, offline recipes/timers.
- P1: cross-module continuity Coffee/Fryer/Dom/Shopping, no loss of saved coffee data.
- P2: ingredient import/OCR is opt-in and always editable; no invented stock quantities/expiry dates.
- P2: family sharing and appliance integration are prototypes only until permissions, API support, privacy and costs are known.
- P2: AI is advisory, optional, explainable and not required for offline functions.

## Decision process
Scores (1–5) to be evaluated by human testing. Candidate criteria: usefulness 35%, novelty 20%, feasibility 20%, visual clarity 15%, differentiation 10%. Scores in conversation are *preliminary subjective estimates*, not verified consumer testing.

SHORTLIST: 02 Timeline for primary workflow, 01 Mission Control for glanceable dashboard, 07 Mise en Place for reliable execution. Visual direction can borrow 10 Atelier for premium atmosphere, but keep kitchen-operation UX from 02/07.

Test with 3 scenarios: (A) chicken + potatoes + vegetables with Air Fryer and one pot to be served at same time; (B) morning espresso + family shopping list; (C) same meal with unavailable ingredient and iPhone locked. Benchmark number of taps, missed timers, cognitive load and accessibility.

## Architecture for prototyping
- Do not restructure existing modules in phase 1.
- Build a **separate isolated visual concept gallery** in a new /design-lab or static mock HTML component only after selection; never replace production app without approval.
- Define contracts for: KitchenSession, Task, TaskDependency, Timer, Ingredient, DevicePreset, ShoppingItem.
- Distinguish manual instructions for Lelit/Cosori/TM6 from actual connected device control.
- Snapshot current app and localStorage schema; put migration under tests, not ad hoc.
- All concept mockups: no invented cooking automation that doesn't exist in code. Label speculative behavior "concept".
