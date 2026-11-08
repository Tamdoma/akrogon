# Rebuttal: `notices` (Seat E)

1. **Q1 Concession (`tasks` not in layouts, lines 6, 14–17) — use `session-status` over a new `notify` mod:**
   - E concedes `tasks` is `"place": "none"` and absent from `herdr-setup`'s `flat.json` and `board.json`.
   - Prefer `herdr-setup`'s `session-status` (`mods/session-status/main.js`, already shown in `flat.json:162` and `board.json:116`) over a new `notify` mod (line 15): per `AGENTS.md:725-726`, `mod.json` `place` only docks once when first seen and *"after that, the layouts decide"*, so `herdr-setup`'s `flat.json` and `board.json` would have to be edited for a new mod anyway. Putting the ~15-line handler in `session-status` (per Signpost 3) avoids adding a 1px dummy block to every layout.

2. **Lines 15 & 20 (`herdr-app do notify.show {title, body, sound}`):**
   - **Disagreement:** `herdr-app` mods cannot define structured CLI flags (`{title, body, sound}`) for `herdr-app do`. Per `herdr.d.ts:75,234,394` and `AGENTS.md:481,501`, `nextCommand(): Promise<string>` receives only the raw command string after `<mod>.` (which is why `herdr-app/tasks/main.js:68-73` splits `c` on `:`), and unknown `--arg` names on `herdr-app do` are errors.
   - Also, `<mod>.<command>` *"reaches shown copies only"* (`AGENTS.md:738`) and `run()` returns `null` (`herdr.d.ts:77`); if `herdr-app do <mod>.<cmd>` exits `0` when zero copies of `<mod>` are shown, exit `0` is a false `shown`.
   - **Fix:** Either use `watchFolder("${appHome()}/notices")` inside `session-status` + `herdr-app ls` window check (carries arbitrary JSON `title`/`body`/`sound`, works while hidden, synchronous `shown`/`error`), or probe before handoff how `herdr-app do` passes arbitrary notice text into `nextCommand()` and what it returns when the mod is unshown.
