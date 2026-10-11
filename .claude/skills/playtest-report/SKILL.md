---
name: playtest-report
description: Play XING in the browser (offline, and online with several tabs when accounts are available) and write a playtest report with bugs, confusing moments and what was and was not tested.
---

Focus (optional): $ARGUMENTS

1. Use the `qa-tester` agent. Run the dev server if needed (port 5173), and stop it afterwards.
2. Play full rounds in 2-player and 4-player mode; deliberately try: clicking out of turn, double clicks, the final card, a lone-card Xing, a jack-on-jack Xing, a 26–26 split if one appears, reaching the target score, mobile width.
3. For online play only use accounts the user gives you; do not create accounts or enter passwords.
4. Write `docs/playtests/<date>-<topic>.md`: what was tested, what was not, bugs (steps to reproduce, expected vs actual), UX friction, ideas. Be explicit about anything you could not verify.
