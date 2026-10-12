---
name: perf-profile
description: Measure XING's speed on a phone-like setup - bundle size, load time, rendering during play, animation smoothness, memory and Realtime message size - and recommend fixes. Read-only unless asked to fix.
argument-hint: "[focus: load | gameplay | online | all]"
---

Focus: $ARGUMENTS (default: all)

The audience plays on phones over mobile data (see `docs/pillars.md`), so measure that, not a fast desktop.

## 1. Build weight
Run `npm run build`; report each file in `dist/assets` raw and gzip size (the build output prints both). Note the largest dependencies (`react-dom`, `@supabase/supabase-js`). Flag: total JS gzip over ~150 kB, any unused import, and whether the landing page loads Supabase eagerly (could be lazy-loaded). Target: first screen usable in a few seconds on 4G.

## 2. Load
Start the production preview (`npm run preview -- --port 4173`) in the background and stop it when done. In the Browser pane use `resize_window` preset `mobile`, then with `javascript_tool` read `performance.getEntriesByType('navigation')[0]` and `performance.getEntriesByType('paint')` (FCP), plus transferred bytes from `performance.getEntriesByType('resource')`. Repeat for the landing page and the game screen (use a dev-only bypass only if the user provides one; never type credentials). Reset the viewport to `desktop` afterwards.

## 3. Gameplay smoothness (offline vs computer)
Auto-play a round (click `.hand button.card:not(:disabled)` in a loop). Meanwhile sample `performance.now()` frame gaps with a `requestAnimationFrame` loop and `PerformanceObserver({type:'longtask'})` to count dropped frames and long tasks; read `performance.memory?.usedJSHeapSize` at the start and end of the round to spot leaks (growth after a round should be small). Check that animations use `transform`/`opacity` (see `src/styles.css`) and that `prefers-reduced-motion` is honoured.

## 4. Online
Estimate Realtime payload size: `JSON.stringify` a masked snapshot from `maskMatch` at the start and end of a round (the `events` array grows every move – flag if snapshots exceed a few kB and suggest sending only the latest event). Count messages per move (should be ~1 per seat). Check timer/channel cleanup in `src/online/useOnline.ts` so leaving a match leaves no open channels.

## 5. Report
A short table of numbers (what, value, target, status), the top 3–5 fixes ordered by player impact vs effort, and a "not measured" list (e.g. real devices, real mobile networks, Safari). Do not edit code unless the user asks for the fixes.
