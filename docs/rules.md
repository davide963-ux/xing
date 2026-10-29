# XING – canonical ruleset

This is the project's source of truth. Code (`src/engine`), tests and the in-game rules text must agree with it.

1. **Players:** 2 (one each), 3 (everyone plays alone, three sides) or 4 (seats 0&2 vs 1&3, partners opposite, shared captures and points). 52 cards, no jokers; only rank matters.
2. **Deal:** random first dealer, rotating. Middle stack of 4 (3 face down, top face up and never a jack – swap with a non-jack from the deck). 4 cards each (48 cards divide evenly for 2, 3 and 4 players: 6, 4 and 3 deals); player to the dealer's right starts; counterclockwise. Re-deal 4 each when all hands are empty; the middle is never topped up.
3. **Play one card:** empty table → starts a stack (a jack stays). Same rank as top card → capture the whole stack (including the played card). Jack → captures any non-empty stack. Otherwise the card becomes the new top. Only the top card matters.
4. **Xing:** exactly one card on the table, captured by the same rank, capturing card not a jack → +10. Lone jack captured by a jack → +20 (setting, default on). The opening 4-card stack never qualifies. Final card of the round cannot Xing unless "Allow Xing on the final card" is on (default off). Bonuses are separate from card points.
5. **End of round:** leftover table cards go to the last capturer (no bonus). Points: ace 1, jack 1, 10♦ 3, 2♣ 2, most cards 3 (strictly the most cards; if two or more sides tie for the most, e.g. 26–26, nobody), Xing 10 / jack Xing 20. 16 ordinary points per round (13 on a 26–26 tie).
6. **Match:** target 51 or 101 (default 101), decided only after a completed round; more than one side reaches it → the highest total wins; equal highest totals → another round.
