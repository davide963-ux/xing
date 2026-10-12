# XING – product pillars

Used by `/brainstorm`, `/quick-design` and `/dev-story` to judge ideas. Edit freely.

## Pillars
1. **Albanian first.** Albanian wording, names, tone and sharing habits (WhatsApp, Instagram). The audience knows the game already – do not over-explain.
2. **Phone first, instant start.** Most players are on phones and mobile data. From opening the link to playing a card should take seconds; keep the app light.
3. **Faithful to the game.** The fixed ruleset in `docs/rules.md` is the product. Variants are toggles, never silent changes.
4. **Better with friends.** Features should help people play together (nacut dhe cogat): invites, teams, rematches, bragging rights.
5. **Fair and trustworthy.** No peeking at hidden cards, no pay-to-win, results that add up.

## Anti-pillars (we will not)
- Add heavy downloads, long onboarding or forced ads between rounds.
- Change the core rules to suit a feature.
- Allow free-text chat before there is a way to moderate it (presets/emotes only).
- Touch the shared "news cms" Supabase project's data or schema without explicit approval.

## Constraints today
- Solo builder, small budget; prefer features that need no new servers.
- Online play is host-run in a browser over Supabase Realtime (see README).
