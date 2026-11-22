# Final-shape check: waiting-seats (slot C)

None. Checked `slots/waiting-seats-final-shape.md` items 1–5 against `src/`, `forks/signposts.md ## Taken`, and `forks/red-exit.md ## Taken` (2026-11-21): sound, buildable, consistent with all locks, and no misstatements of slot C's positions.

(Minor plan-time note, no shape change needed: `sliceKeepReason` at `src/reconcile.ts:200` is synchronous and `leaf.state.batch !== undefined` with existing reason `'state.batch'` already covers item 5 without a per-leaf `landAlive` call; `src/config.ts:25` carries only the schema line, while the `max_active` prose lives in `docs/reference/config.md`, `skills/init-akrogon/` and `src/next.ts:1171`.)
