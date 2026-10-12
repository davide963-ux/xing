---
name: scope-check
description: Sanity-check the size and fit of a planned XING feature (or the current uncommitted work) against the pillars and a solo builder's time. Gives a GO / TRIM / SPLIT verdict with what to cut.
argument-hint: "[feature idea, design-note path, or empty to check current git changes]"
---

Target: $ARGUMENTS

1. **Find the plan.** If an idea or a `docs/design/*.md` / `docs/brainstorms/*.md` path was given, read it. If empty, use `git status` and `git diff --stat` as the "plan in progress".
2. **Read context:** `CLAUDE.md`, `docs/pillars.md`, `docs/rules.md`. Skim the code areas the feature would touch (`src/engine`, `src/ui`, `src/online`, `src/auth`, `src/i18n/sq.ts`).
3. **Size it honestly.** List the concrete work items (engine, UI, Albanian text, online/Supabase, tests, marketing/docs) and give each S / M / L. Count the files it would touch. Flag anything that adds: new Supabase tables or functions, a new dependency, a new server, a change to `docs/rules.md`, or hidden-information risk.
4. **Check fit:** each pillar ✓/✗, any anti-pillar violated, and whether a simpler version would deliver 80% of the value.
5. **Verdict:**
   - **GO** – fits; state the first small step.
   - **TRIM** – list what to cut to make it fit.
   - **SPLIT** – propose 2–3 shippable slices, each leaving the game working, in order.
   - **STOP** – conflicts with a pillar or needs a decision from the owner first (say which).
6. Keep the answer to one screen: verdict, size table, cuts, risks, next step. Do not write code or files unless asked.
