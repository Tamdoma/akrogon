# green-merge implementation report

Mode: serial-solo (every wave holds one unit). A implemented U1–U4 itself. There were no workers.

Base `abfee125b4ab68bec34bd73325c077c12c74fc47` (origin/main, unchanged at the final refresh). Committed head `4ab37054` (a trailer-only empty commit on `d697d6dd`, same tree, so the verify receipt matches). No refresh moved the branch.

## Commits

- `a4124cce` test: criterion tests (plan.synthesis).
- `3991772c` U1: `src/state.ts` batch `owner`/`wake`/`red`/`refusal`, `broadcast`, `broadcastPending`. `src/phase.ts` `ownerCompletion`, `commandMerged`, `moveGuards`, `landGates`, `landClaim`/`StaleLandError`, `batchPush` takes a `move`, `restack`/`finishPush` return values, `landPush`.
- `eb9ea718` U2: `src/land.ts` (launch, liveness, land loop, handoffs). `src/akrogon.ts` `land` verb. `src/next.ts` claim plus launch in the apply lock, wait/relaunch, `broadcastPass`, `landedWake`, `mergeContext` wake fields, `dispatchSlot` prompt from the caller.
- `c8743945` test correction: advancer commits get unique content (`Test-Change` trailer). An empty second advance made case 5b go red through the verify, not through the push.
- `d5111239` U3: `src/reconcile.ts`, `src/stop.ts`, `src/status.ts` and `src/timing-report.ts` handle command owner and pending broadcast (D9, D11–D13).
- `bca332c8` U2 fix: `broadcastPass` scans through `discover` (per-leaf report, not a whole-pass throw on a foreign or unreadable leaf) and allocates B only when its pane is not live (D7).
- `812c4ed2` U4 D14: existing tests moved to the command claim. One `Test-Change` trailer per file: helpers, batch-dispatch, next, hold-retired, leaf-stop, pause-next, timing, merge-attempts, command-reference.
- `4ab37054` trailer-only: `Test-Change: tests/AREA.md` (the test-file rule matches it).
- `d697d6dd` U4 docs: `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md`, `src/AREA.md`, `tests/AREA.md` (both 40 lines, four sections), `README.md` `land` row.

## Test corrections (D14)

Applied tops are now command-owned, so tests that expected a B merge prompt right after the claim seed `owner: seat` with `seatOwned` (as a land handoff does) and run `next` again. Wake cases assert `batch.owner === 'command'`. Other corrections:

- `timing.test.ts` waits case: a command-owned holder records `merge_turn` while its unit runs (plan D4.3), and the later prompt closes it.
- `merge-attempts.test.ts`: `spawn` puts the fake `systemd-run` on PATH as `cli` does. Two reconciled-landed cases keep the worktree at the store path, so the criterion-6 broadcast can allocate B.
- `command-reference.test.ts`: added the `land` contract. No existing expectation changed.

## Proofs

| Criterion | Command | Commit | Result |
|---|---|---|---|
| 1–9 | `akrogon run-check --name green-merge-2 -- bun test --timeout=30000 tests/green-merge.test.ts` | d697d6dd | `check green-merge-2: 0 …/implementation/check-green-merge-2-1792425109478-2969788.log` |
| 10 | `git --no-pager diff --stat abfee125..HEAD` | d697d6dd | `skills/merge-issue/SKILL.md`, `skills/broadcast-issue/SKILL.md` and `src/AREA.md` all changed. Content is for review to judge. |
| checks | `akrogon verify` | d697d6dd | `verify leaf d697d6dd…: green`. test `check-test-1792425279540-2983992.log` (1062 pass, 0 fail), typecheck `check-typecheck-1792425282095-2983992.log`. Run `c4a3b3a0-1bb2-4177-9b1a-0f4ae2e5daca`. Wall time 169 s. |

Intermediate runs, all under `implementation/`:

- `check-next-4-…2162910.log`: 0.
- `check-rest-2-…2463002.log`: 1. Only timing waits failed, fixed in `check-timing-1-…2502314.log`: 0.
- `check-cmdref-2-…2517273.log`: 0.
- `check-docs-1-…2966742.log`: 0.
- Full suite `check-full-1-1792425027086-2518368.log`: 0. Wall time 153 s.
- `check-typecheck-1-…2959943.log`: 0.
- `check-format-1-…2960418.log`: 0.

No retry or known-red run was needed.

## Limitations

- The fake `systemd-run` logs launches and runs nothing. Tests invoke `akrogon land` directly, as the unit would. No proof here exercises a real `akrogon-land-*` unit on the host. The launch argv is asserted from the fake's log (criterion 1).
- A land-run wake failure is printed and not retried (D10). The next `next` pass picks up the queue.
