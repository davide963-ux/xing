---
name: brainstorm
description: Guided brainstorm for new XING features. Asks a few questions, generates candidate ideas scored against the product pillars, helps pick one, and writes a short brainstorm note. Use before /quick-design when the next step is unclear.
argument-hint: "[topic or 'open'] [--lean]"
---

Topic: $ARGUMENTS   (empty or `open` = anything; `--lean` = skip questions 2–3 and go straight to ideas)

## 1. Ground yourself (no questions yet)
Read `CLAUDE.md`, `docs/pillars.md`, `docs/rules.md` and skim `README.md` plus `src/` structure so you know what already exists (offline vs computer, online matchmaking 2/4 players, Supabase login, Albanian UI, landing page). Check `docs/brainstorms/` for earlier notes so you build on them instead of repeating them.

## 2. Discover (use AskUserQuestion, 1–3 short questions)
- What outcome matters most right now? (more players / players come back / smoother games / trust & fairness / marketing)
- Effort budget for the next step? (an hour / a day / a few days)
- Anything the user already wants or definitely does not want?

## 3. Generate
Produce **exactly three** candidate ideas, each different in kind. Use at least two of these lenses:
- **Player problem first:** what is annoying or missing for an Albanian player on a phone today?
- **Social loop:** what makes people invite friends or rematch?
- **Verb-first:** pick one verb (invite, brag, rematch, learn, climb, share) and design around it.
For each idea give: title · one-line pitch · player value · rough size (S/M/L) · needs new Supabase tables/servers? (yes/no) · main risk · pillar check (✓/✗ per pillar from `docs/pillars.md`) and any anti-pillar it violates.

## 4. Decide
Recommend one with a one-sentence reason, then ask the user to pick one, combine, or ask for more (AskUserQuestion). If an idea needs Supabase tables, say so plainly: the shared "news cms" project must not be changed without explicit approval, and a separate project would be suggested.

## 5. Write the note
After the user approves, write `docs/brainstorms/<yyyy-mm-dd>-<kebab-topic>.md` with: context, the three ideas (short), the decision and why, what was cut, open questions, and the suggested next step (`/quick-design <idea>`). Keep it under one page. Do not create other files and do not write code.

## 6. Wrap up
Summarize the decision in 3 lines and name the next command. Never commit or push.
