---
name: dev-story
description: Break a XING feature into small stories, then implement one story at a time with tests, review and a clear done-check. Does not commit or push without asking.
---

Feature or story: $ARGUMENTS

1. If no design note exists in `docs/design/`, run `/quick-design` logic first and confirm scope with the user.
2. Split the work into stories that each leave the app working (engine → UI → online/storage), each with acceptance checks.
3. Implement the first story only: engine changes with tests first, keep `src/engine` pure, honour `CLAUDE.md`.
4. Done-check: `npm run typecheck`, `npm test`, `npm run build`, and a real run in the browser for UI work. Then run `/xing-review`.
5. Report what was done and verified, what was not, and propose the next story. Ask before committing or pushing.
