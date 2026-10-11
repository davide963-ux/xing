---
name: balance-check
description: Measure XING's balance and computer-player strength by simulating many seeded games, then report numbers and recommendations.
---

Focus (optional): $ARGUMENTS

1. Read `src/engine/engine.ts`, `src/engine/ai.ts`, `docs/rules.md`.
2. Write a temporary test file (e.g. `src/engine/sim.tmp.test.ts`) that plays at least 2,000 seeded rounds per mode using `createRound`, `playCard`, `chooseCard(getPublicView(...))`, `scoreRound`. Measure, as relevant: average points per team, Xing rate per round (10 and 20), share of rounds with a 26–26 card tie, average captures per round, first-seat vs second-seat win rate, `normal` vs `easy` AI win rate (and vs a random player).
3. Run it with `npx vitest run <file>`; then **delete the temporary file**.
4. Report a small table of results with the sample size, what looks unbalanced, and concrete suggestions (rule-neutral AI tweaks first; rule changes only as options for the user, since the ruleset is fixed).
