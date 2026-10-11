---
name: quick-design
description: Turn a feature idea for XING into a short design note (player goal, rules, edge cases, data/privacy, acceptance checks) before any code is written.
---

Idea: $ARGUMENTS

1. Read `CLAUDE.md` and `docs/rules.md`. Look at the code areas the idea touches.
2. Write `docs/design/<kebab-name>.md` from `docs/templates/design-note.md`. Keep it under one page.
3. Cover 2-player and 4-player modes, online vs offline, mobile, and what is stored where. State anything that would reveal hidden cards.
4. List what you would cut to ship a first version, and any decision you need from the user.
5. Do not write code. End with a short summary and the open questions.
