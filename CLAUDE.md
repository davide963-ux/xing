# XING – project guide for Claude

Browser card game (React + TypeScript + Vite). Albanian "Xing", 2 or 4 players, vs computer or online.
Deployed on Vercel from `main` of github.com/davide963-ux/xing. Auth + online play use Supabase.

## Commands
- `npm run dev` – dev server (http://localhost:5173)
- `npm test` – engine tests (vitest) · `npm run typecheck` · `npm run build`
- Always run typecheck + tests + build before saying something works.

## Architecture rules
- `src/engine/` is pure game logic. No React, no DOM, no network, no `Math.random` (take an `Rng`).
  State is JSON-serializable; functions return new state. Every rule change needs a test in `engine.test.ts`.
- `src/ui/` renders state and animates; it never decides rules. Rules text in `Panels.tsx` must match
  `docs/rules.md`.
- `src/online/` is transport only. Hidden information (other hands, deck, face-down cards) must never be
  sent to a client that is not allowed to see it – see `maskMatch`.
- The computer player (`engine/ai.ts`) only receives a `PublicView`, never `RoundState`.
- Rules are fixed by `docs/rules.md` (project ruleset). Do not "fix" them to a different local variant.

## Language
- The game is Albanian-only (audience: Albania). All user-facing text lives in `src/i18n/sq.ts`; never hard-code UI strings in components.
- Headline on the landing page is fixed by the owner: "LUAJ XING ME NACUT DHE COGAT".
- Owner-confirmed terms: Jack = Jani, King = Derri, Queen = Qupa. Other terms (asi, pako, pirg, ...) were chosen by Claude and are unreviewed by a native speaker.

## Working agreements
- Do not push to GitHub, change Supabase data/schema, or send anything outward without asking first.
  The Supabase project is shared with another app ("news cms"): never alter its database.
- Keep changes small; match surrounding style; no new dependencies without a reason.

## Project helpers (in `.claude/`)
- Skills: `/brainstorm`, `/quick-design`, `/scope-check`, `/dev-story`, `/balance-check`, `/ux-review`, `/perf-profile`, `/security-audit`, `/xing-review`, `/playtest-report`
- Agents: `systems-designer`, `ux-reviewer`, `code-reviewer`, `qa-tester`
- Templates, canonical rules and product pillars: `docs/` (`rules.md`, `pillars.md`)
