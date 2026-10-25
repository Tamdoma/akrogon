# Review A: session-reads

- Base: `842c85cf` (origin/main at review time)
- Reviewed head: `416d2d89`
- Report: `implementation/report.md` — consistent with the diff; `akrogon verify` green on `fb1dc3d` (1142 tests); criterion proofs cited at `check-session-reads-proof-plain-1792876332075-142234.log` (7 pass, head `2a3a6ba1`; subsequent commits are docs/format/empty only, so proofs remain valid for the reviewed head).

## Fix

- **`activeCount` no longer consults the cross-session union when no repo leaf is seated** — src/next.ts:447-467. The `needs` gate (`inventory.leaves.some(seated)`) skips both the `sessionPanes()` read and the `inventory.unknown` guard for a resolved repo whose unfinished leaves all lack a recorded tab and worktree. Realistic source: a second `herdr` session running akrogon on the same repo dies with its socket still listed, or wedges mid-pane-read, while no local leaf is seated; an operator or cron runs `akrogon next`/`continues`/`dispatch` in the repo. Old code: `resolution !== null` → read the union → `all === null` → `return global.max_active` (launch blocked). New code: `needs` false → `total += unreadable + 0` → a new seat allocates while a foreign pane may sit in the same leaf worktree — exactly the overcapacity case the leaf exists to close. Same line also drops the old `inventory.unknown.length > 0 → max_active` guard for unseated repos, letting launches proceed past unknowable leaf state. Consequence today: a launch proceeds in the two states the criterion forbids. Hits criterion 1 ("when a running session is unreadable, that repo launches no new seat"; "never knows less than the old local check did"). Fix direction: drop `needs` from the union-read condition so a resolved repo always reads `union()` (already memoized per call site), restoring the `all === null → max_active` and `unknown → max_active` guards; keep `needs` only for the refused-repo else-branch counting.

## Nits

- None recorded beyond the Fix above.

## Checks

- `git diff 842c85cf..416d2d8` inspected in full (12 files, +733/-190).
- AREA paths listed from repo root: `src/shell.ts`, `src/next.ts`, `src/reconcile.ts`, `src/log.ts`, `tests/session-reads.test.ts`, `tests/session-routing.test.ts`, `tests/fake-herdr.ts` — all exist. Documented behavior changed (new cross-session read + hook gating); the new AREA lines match the shipped behavior, except they do not mention the `needs` laziness, which the Fix removes anyway.
- `HERDR_PANE_ID` no longer read anywhere in `src/` (grep: only comments/tests). Criterion 6 behavior verified: `rawEvent` is read only when `input === undefined`, so explicit input and manual no-input runs bypass the origin gate entirely.
- `hookScope` correctly gates per repo on emitting-session name AND event `workspace_id`; `tab_closed` and pane-event paths both pass through it; ids come from `event.data`; `emitting` requires `session.running`.
- `reconcile` signature `(repo, leaves, live, union = live, failures?)`: `live` drives tab judgements, `union` drives all cwd vetoes; both `next.ts` callers pass `live` + `hostPanesOnce()` under `reconcileNeedsPanes`. `reconcileRepos` wires `panesForRepo`/`hostPanesOnce` per plan D4.
- `sessionPanes` skips `server_not_running` sessions, maps any other read failure or `DISCOVERY_DEADLINE_MS` hit to `null`; the liveness probe added by the worker is bounded by the deadline (fixed at `2a3a6ba1`).
- No rerun of checks: verify receipt green on the reviewed tree; the one red-run retry rule is not triggered.

## Verdict

fix
