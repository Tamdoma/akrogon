# Fork notes A: notices

## Q1 channel
- Pick: akrogon's own `tasks` mod, which akrogon already installs (`src/install.ts:29-48`) and which already runs `akrogon status --json` and follows folders with `watchFolder` (`herdr-app/tasks/main.js:116,173`). The four notices become pending records akrogon writes; `status --json` lists them; the mod posts each new one with `notify()` and marks it shown. Reason: the toast stays inside herdr-app as today's herdr toast did, no new install path, no new process, no polling. Cost: notices show only while a `tasks` copy runs.
- Rejected: a herdr-setup mod (a second owner for akrogon's own notices; the callers, records and tests live in akrogon); `notify-send` (leaves herdr-app, today's notices are in-app); an hc label on a seat (main red and merge slow have no seat).
- Pitfall: a mod copy runs only while its block is in the current layout (AGENTS.md "Mods": removing a copy ends its tasks). If the operator's layouts do not always hold the `tasks` board, notices wait. Removed by: probe which layouts hold `tasks`; the operator decides whether `tasks` stays in every layout.
- Evidence: better-than-training · AGENTS.md "Mods" (`notify`, `watchFolder`, `exec`), `herdr-app/tasks/main.js`, `src/install.ts` · 2026-11-06.

## Q2 hand-off and shown
- Pick: one notice record per notice in akrogon state (repo `issues/` or `~/.akrogon/`), `pending` until the mod posts it, then the mod runs `akrogon notice shown <id>` through `exec`, setting `shown`. Today's retry rules map directly: `pending` covers "retry until shown" (`src/verify.ts:351`), `busy_notified` stays the once-per-episode marker. With the window closed nothing shows; the record stays `pending` and posts when the window opens. Reason: same records as today, the mod is the only new reader. Cost: one small verb.
- Rejected: akrogon calling the mod directly (no command reaches a mod from outside except key commands; AGENTS.md).

## Q3 sound and action
- Pick: keep. `notify({level, action: {name, args}})` carries the click action; sound by `playSound("blocked")` for `request` and none for `none` (AGENTS.md "Machine"). Low confidence that `level` maps to today's sound semantics; probe.
