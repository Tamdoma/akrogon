# Fork notes A: start-and-pane

## Q1 lifetime
- Pick: leaf seats `--no-parent` (closest to old herdr, where panes belong to the server and outlive any engine process); consultants and direct-route reviewers stay children of their door and die with it (intake tests 2026-10-30, kill-and-restart reset). Cost: nobody receives hc's child notes for leaf seats; the listener is their only watcher (engine-shape).
- Rejected: leaf seats as children of the listener (listener restart on deploy would kill every running leaf); everything `--outlive-parent` (orphaned consultants keep spending after a door dies).
- Evidence: `hc run --help` (`--parent`, `--no-parent`, `--outlive-parent`); intake test 4 · 2026-11-06.

## Q2 leaf tab
- Pick: (a) labels with a tab id akrogon mints per leaf: core-side, no window needed at start, no focus change, B lands beside A (the old A|B layout). Name the tab with the slug: `tab.rename` when the window is open, else at the next pass that finds the window (low confidence; probe whether the app writes the new tab into the core document while closed, and whether `doc.set` can carry the name). Cost: an unnamed tab may show briefly as a number.
- Rejected: (b) `tab.new`: needs the window, leaves a shell under the agent, and an engine pass at night would fail.
- Pitfall: with the window closed nothing is visible anyway; the pane must exist when the window opens (probe: start labelled seat with window closed, open window, see the tab).

## Q3 consultant column
- Pick: the start command places consultants in balanced order (proven equal for 2 and 4). For other counts, a small herdr-setup helper sets equal weights through the core's `doc.set` with a version check (signpost 3: gaps patched in herdr-setup), probed in a throwaway session first; if `doc.set` weights are not honored by the app, accept halving and report the gap upstream. Restart of one consultant: kill, start under the same name, keep it below the seat above it, then re-equalize.
- Rejected: writing `docs.json` directly (private file); dragging by hand.
- Evidence: INTAKE agent findings 2026-11-06; `hc schema` doc.set ("Write an opaque JSON document if its version still matches ... emits a doc event") · 2026-11-06.

## Q4 start command
- Pick: one `akrogon start` (CLI verb plus the function the engine calls) taking repo, role (leaf seat, consultant, direct reviewer), seat letter, harness kind, first task file, parent; it builds name and labels, argv from config `harnesses:` (codex adds the sandbox network flag), runs `hc run --bg` with the first task, checks `first_message.sent`, places the pane, prints address and name. Skills call it as a command (signpost 1a).
- Pitfall: placement race: retry until the pane shows, then fail loud (a start without a pane is a failed start).
