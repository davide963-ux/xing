---
name: xing-review
description: Pre-commit review of the current XING changes for rule correctness, hidden-information leaks, online-sync bugs and quality, plus typecheck, tests and build.
---

Scope (optional): $ARGUMENTS

1. Run `git status` and `git diff` (and `git diff --staged`).
2. Use the `code-reviewer` agent on those changes.
3. Run `npm run typecheck`, `npm test` and `npm run build`; report the real results.
4. Summarize: blocking problems, non-blocking suggestions, and whether the change looks safe to commit. Never commit or push as part of this skill.
