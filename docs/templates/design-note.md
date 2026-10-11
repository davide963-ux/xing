# <Feature name>

**Status:** draft | accepted | built   **Date:** YYYY-MM-DD

## Player goal
One or two sentences: what the player can now do, and why they would want to.

## Rules / behaviour
Numbered, testable statements. If this touches game rules, update `docs/rules.md` first.

## Edge cases
Disconnects, ties, final card, 2 vs 4 players, mobile, no network, logged-out, etc.

## Data & privacy
What is stored, where (browser / Supabase), who can see it. Hidden card information must not leak.

## Acceptance checks
- [ ] Test(s) added in `src/engine/engine.test.ts` (engine changes)
- [ ] Verified in the browser at desktop and 375 px width
- [ ] typecheck, tests and build pass
