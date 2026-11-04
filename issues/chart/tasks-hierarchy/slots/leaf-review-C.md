# Leaf review C

## status-attention-facts

- Interface that does not match the code: the design owns "the text view's red marker" and the brief's What says the text view reports the predicate. The text view has no red marker: `cells()` in `src/status.ts` returns slug, phase, time, blocked-by, the `note()` string and the queue turn, and `note()` already prints failed and prompt facts as text. Either name what the text view gains (the two new facts and `waits_on` as `note()` entries, which is where failed and prompt live today) or drop the text view from What. As written the implementer has nothing to change and criterion 3's "still each give red" cannot be observed in the text view.

- Consumer claim that is wrong, and the open question it raises is moot: the design says the watch skill reads `akrogon status` text and asks whether `observe.ts` parsing survives. `skills/watch-issues/scripts/observe.ts` runs `akrogon config` and `herdr agent list` and reads the leaves' own state (its line uses `s['blocked-by']`, a state.yaml key), never `akrogon status`. No watch consumer exists for this leaf's output; the plan can skip that question.

- Otherwise no disagreement: `requiredSlots(phase, rounds)` and `done: Slot[]` match criterion 4; `handOff` in `src/land.ts` sets `owner: 'seat'` before the land process exits, so "attempt present and not alive" is the recorded-stop condition sections Taken 3 asks for; `tests/status-json.test.ts`, `tests/status.test.ts` and `tests/status-fixture.ts` exist.

## tasks-sections-board

- Consumer of a changed state the design misses: the row click writes the leaf's issue folder into `worktree.pin`, and that key is read by two herdr-setup views, not one. `mods/changes-view/main.js` (`pins()` at its top, and it writes the key too) diffs the pinned folder; after a row click the Changes view for that space shows the registered checkout's diff rooted at the issue folder until the expansion's Changes button repins the worktree. The design names only Files. Either the click pins into a Tasks-owned key the Files view also reads (a herdr-setup change with an owner), or criterion 6 states that a row click also moves Changes, or the click opens Files without touching the shared pin.

- Interface naming: the design's consumer "Files view (herdr-setup `mods/files`)" is `mods/files-view/main.js` in herdr-setup; herdr-app's shipped `mods/files` reads no pin. The open question "confirm Files shows a pinned folder that is not a git worktree root" is answered by the code: `files-view` lists `pin.folder` with a plain directory listing (its `location()` and the listing script), no git requirement.

- Cross-leaf promise without an owner: criterion 8 draws seat icons with the sidebar's one-color treatment, which for picture icons means `image("mono/<name>.png")` from the app home (`mods/agents-by-tab/main.js` `icon()`). Those files come from herdr-setup's `mono/` folder, copied by herdr-setup's `install` and `bin/herdrapp`. The Tasks mod is deployed by akrogon's release into the same app home, so the criterion depends on another repo's install step that no leaf in this handoff owns, and the design leaves "what it shows when the file is absent" open. Give it an owner: the leaf ships the mono files it needs under `herdr-app/tasks/` and references them by its own mod path, or the brief names the herdr-setup install as a human prerequisite complete on this machine and the criterion covers the absent-file case.

- No disagreement on the rest: `leafRows()` is used only by `tests/tasks-mod.test.ts`, so the "confirm every caller" question closes; `land.alive` and `busy_since` exist for the Working rule; criteria name no test files or counts.

## tasks-side-open

- Interface that does not match the code: the owned surface "`mods/panel-bar/main.js` only where it records `full` after a request" names a setter that does not exist. `main.js` derives `full` from the layout on every render (`full: Boolean(main?.hidden)` in its render state) and never stores it, so `shrink` and `grow` read the live layout after a side opening with no main.js change. Drop main.js from the owned surfaces, or the implementer hunts for a recorder to change.

- No disagreement on the rest: `request()` from closed is the one place that emits FULL for every view; `tests/panel-bar.test.js` already calls `request` with tasks and files views; criterion 3's "switching views keeps the width" is today's `state.view !== req.view` branch.
