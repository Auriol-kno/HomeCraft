# HomeCraft — Claude Code Project Guidance

Read `README.md` and `docs/design-lab/CONCEPTS_2026.md` before editing. Work only in an explicit feature/concept branch, never deploy or merge without approval.

## Product goal
Transform a collection of kitchen utilities into an operational **Kitchen OS**: decide → prep → cook → serve → clean up. Preserve existing coffee, air fryer, house and shopping modules.

## Working method
1. Spawn/use the four review roles defined in `.claude/agents/` (research, UX, architecture, critic) **if Claude Code supports subagents**, otherwise perform equivalent independent reviews sequentially and label them honestly. These files are role definitions, not records of agents already run.
2. Produce ten clearly differentiated static wireframe concepts, including exactly two classical. No ten-color-variant shortcut.
3. Validate competing products against linked sources; mark facts vs product hypotheses.
4. Rank with documented weighting and dissenting critic opinion. User chooses final design before code refactor.
5. Start with isolated prototypes; implement no hardware actuation and no paid AI APIs unless separately approved.
6. Use existing npm scripts and Playwright tests; verify on 320px and 390px mobile layouts, PL/EN and dark/light.
7. Preserve localStorage schema and offline support, and write regression tests for any migrations.

## Safety and integrity
No assertion that an Air Fryer, Lelit or Thermomix is remotely controlled unless a supported API and test proves it. Timers cannot guarantee background sound on iOS. Cooking times are estimates; food thermometers and minimum core temperatures matter. AI may explain, never silently replace safety-critical numbers.

## Acceptance report
Provide changed files, screenshots/mockups, user journeys, WCAG AA checks, Playwright/build results, remaining risks and a non-merging PR link.
