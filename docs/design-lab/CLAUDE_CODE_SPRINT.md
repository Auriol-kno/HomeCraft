# Claude Code — Kitchen OS Design Sprint

## Start here
`git switch concept/homecraft-kitchen-os-2026` then read `CLAUDE.md` and `docs/design-lab/CONCEPTS_2026.md`.

## Four independent perspectives
Use `product-researcher`, `kitchen-ux-designer`, `technical-architect`, `critical-reviewer` from `.claude/agents/` (when supported by Claude Code). These are role definitions, not automatically executed or certified reviews.

## Task for design execution
Produce 10 genuinely distinct mobile-first prototypes, one per concept 01–10. Exactly concepts 09 and 10 are classical. Each concept should include Home and Active Cooking views, with 320px and 390px iPhone widths, PL copy, large timer, ingredient checklist, manual Air Fryer presets and a clear entry to Coffee and Shopping.

## Deliberate design variety
01 graphite/acid-lime data cockpit; 02 ivory/navy connected timeline; 03 sage/terracotta inventory-first cards; 04 cobalt/white high-contrast speech/giant step; 05 graphite/amber precision dial; 06 coral/indigo household planner; 07 white/vermilion disciplined chef prep grid; 08 plum/cream decision assistant; 09 parchment/burgundy classic bound cookbook; 10 marble/brass restrained culinary atelier.

## Choice-first workflow
1. Deliver static visuals and critique, without changing functional app.
2. Evaluate home/active cooking/empty/error and edge states. No claims of real IoT control.
3. Compare against actual current HomeCraft; list reusable components and removed UI.
4. Independent critical reviewer must identify at least one drawback per design; don't force universal approval.
5. User selects 1–3 candidates. Only then prototype actual interaction on a separate preview URL and run CI.
6. Record measured usability later; do not label subjective scores as user test results.

## Suggested first functional concept to prototype
Combination of 02 Timeline + 07 Mise en Place + 01 at-a-glance status, styled as a restrained modern utility. Add small-scope milestones: one meal workflow; dependency scheduling; task stepper; shared timers; manual appliance presets. Not broad AI chat, pantry OCR or sync at first.

## Definition of Done
- each concept has functional rationale and legible iPhone visuals
- no loss of Coffee/Air Fryer/Dom/Shopping feature access
- task and timer semantics verified by tests where implemented
- no auto merge, no production deployment, no changes to GitHub Pages main
