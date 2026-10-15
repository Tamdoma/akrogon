# Implementation report — scratch-copy-removal

## Outcome
Done. `akrogon next` reconcile now removes the three scratch copy kinds by
owner state, `buildStack` writes a `<copy>.owner` record before creating its
copy, and docs describe the new rule. Full `akrogon verify` green on
8e296df: 856 tests, typecheck clean.

## Changes (leaf branch scratch-copy-removal)
- `src/reconcile.ts` — verify-* (ended/dead-owner run), batch-* (dead or
  absent `batch-<id>.owner` record, orphan records swept) and `<slug>-u<N>`
  (owner leaf `merged` only; `failed` keeps the guarded path) are
  force-removed behind pane-list-null, live-pane, live-verify and
  `processesInside` vetoes. `removeWorktree(path, force)` skips the
  reachability/dirty guards under force. Exports `ownerSchema`, `Owner`,
  `readOwner`, `writeOwner`, `processesInside`.
- `src/batch.ts` — `checkLocation` then `writeOwner(<dir>.owner)` before
  `createSparseWorktree`, `rmSync` in `finally`. Removed the
  `state.batch` name guard and the `readOwner`-failure throw.
- `README.md`, `src/AREA.md` — reconcile paragraph and buildStack line
  updated to the owner-state rule.

## Tests
30/30 reconcile cases and 14/14 batch cases green under `akrogon run-check`.
Two planned-test corrections landed as seat fixes with `Test-Change`
trailers: the worker-copy case reads state at the closed owner path, and
the owner-record case runs `buildStack` in a spawned driver child with a
shimmed `PATH` (in-process `process.env.PATH` mutation does not reliably
reach later `Bun.spawn` calls — recorded as a new lesson in the registered
checkout's `learnings/`, uncommitted per the lesson rule). Batch fixtures
now set `worktree_root` since `os.homedir()` ignores runtime `HOME` in Bun.

## Verify
`akrogon verify` on 8e296df: `verify leaf 8e296df...: green`.

## Follow-ups
None — limitation is documented: a `<slug>-u<N>` copy keeps its real
branch so its commits stay reachable, matching the leaf-name behavior.
