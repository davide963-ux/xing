# XING – Albanian card game

Playable browser game (React + TypeScript + Vite). Modes: 1 vs 1 computer, or 2 vs 2 teams
(you & Arben vs. Drita & Ilir). Rules follow the project ruleset: top-card matches, jack captures,
Xing +10, jack-on-jack Xing +20 (toggle), "Xing on the final card" (toggle, default off),
scoring A/J = 1, 10♦ = 3, 2♣ = 2, most cards = 3, targets 51 / 101.

## Setup

Requires Node 18+.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine unit tests (vitest)
npm run typecheck  # tsc --noEmit
npm run build      # production build in dist/
```

## Layout

- `src/engine/` – pure game logic, no UI: `engine.ts` (deal, play, Xing, scoring, match flow),
  `ai.ts` (computer players), `cards.ts`, `types.ts`, `engine.test.ts`.
- `src/ui/` – React components, animation controller (`useGame.ts`), sound (WebAudio, no assets).

Notes on the implementation choices:

- Seats: 0 = you (bottom); play order is seat+1, drawn counterclockwise. Teams are `seat % 2`.
- The AI gets only a `PublicView` (own hand, table with face-down cards masked, hand sizes, deck
  count, publicly revealed cards). It never receives the game state.
- Cards captured from the table become public (revealed) at the moment of capture.
- If nobody captured anything in a round, leftover table cards go to no one (extremely rare).
- Settings are stored in `localStorage`; changing mode/target/variants mid-match restarts the match.
