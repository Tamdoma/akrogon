# Brief: reset-name-restore

## What

The chart door's handover reset helper (`skills/chart-issues/scripts/door-reset.ts`) gains one stage, `name`, between `input-check` and `reset-keys`. For a claude door it reads the session's own name from the pre-reset transcript. When the session has none, it reads the name of the tab that holds A and sends `/rename <tab name>` as text to the old idle session, waits for that rename turn to end, and only then types the reset. Every handover logs one `name` line: `kept`, `sent` or `skipped` with the reason. Codex, pi and agy doors log `skipped`. `skills/chart-issues/assets/handover.md` and the helper's header comment describe the stage and its limits.

## Why

The operator names door sessions (for example `c-akrogon`, usually the tab's name) to find them quickly. A claude session that has a name keeps it across `/clear`, but a door whose session has no name of its own (the framework door since a new process on 2026-11-12) gets a new auto title after every handover, and the operator renames it by hand each time.

## Done-criteria

1. A claude door whose session has its own name: the helper sends no rename, the reset and start prompt arrive as they do today, and the reset log's `name` line says `kept` with the name. When the transcript holds several names, the last one is the one logged. (C)
2. A claude door whose session has no name, sitting in a named tab: the helper sends `/rename <tab name>` to the old session, the reset arrives only after that rename turn has ended, the new session's transcript carries the tab name exactly (a name with a capital letter, a space and `_` included), and the log's `name` line says `sent` with the name.
3. When no name can be set, the handover still completes as it does today and the log's `name` line says `skipped` with the reason, with no rename input received: the door's harness is codex, pi or agy; no tab lists A or its name is blank; or the name holds a control character or line break. These three reasons are the only skips. (C)
4. When the rename turn is still open at the helper's bound, the helper types no reset and no start prompt, logs the stop and exits non-zero.
5. An operator input recorded after the helper started still cancels the handover with neither a rename nor a reset sent.
6. `skills/chart-issues/assets/handover.md` states the name stage, the order of the two name sources, that nothing is stored, the three skip reasons, the stop at the bound, that an error thrown in the name stage ends the helper before anything more is typed, (C) and that only claude doors are named.

Each of criteria 1 to 5 is proven by the leaf's own tests at the real boundary: the helper started as A starts it, on a real hc test core, against the stand-in agent. Criterion 2's test turns red under one deliberate break (the reset typed without waiting for the rename turn).
