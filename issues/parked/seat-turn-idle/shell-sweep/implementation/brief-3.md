# Brief 3 — revert the sweep to the design-exact shape (check.fix round 3, handoff from review-B)

## 1. Goal

Repair review-B's round-2 re-review handoff (`review-B.md`, `## 2026-11-25 check.repair after repair round 2`). The freeze design introduced in round 2 is a regression class of its own and must go: F8 (SIGSTOP signals processes outside the seat scope because membership is never re-proven before that signal), F9 (an interrupted sweep leaves shells frozen indefinitely — a failure mode the SIGKILL-only sweep never had), F10 (the death-confirmation poll waits up to two seconds per seat inside the global lock, violating design Q1's explicit "no wait under the global lock"). The repair deletes the freeze machinery entirely and restores the design's exact mechanism: SIGKILL-only, top-down, re-collect once, no wait. The correct pieces round 2 added stay.

## 2. Numbered acceptance criteria

1. All four cases in `tests/sweep-freshness.test.ts` pass, including `victimFrozen === false` in the migration case: no process is ever stopped by the sweep.
2. `tests/shell-sweep.test.ts` passes in full (T7/T8 detached orphans survive; the trees die).
3. `tests/seat-recovery.test.ts` passes unchanged.
4. The sweep contains no SIGSTOP, no SIGCONT, and no waiting or polling of any kind: it is pure collect → signal → re-collect → signal, synchronous and wait-free, exactly as design Q1 prescribes.
5. The `shell_sweep` row shape, per-seat error capture, slice check, never-throws behavior are unchanged.

## 3. Read-first list

- `src/seat.ts` sweep section in full
- `design.md` in `/home/ivan/Work/infra/akrogon/issues/open/seat-turn-idle/shell-sweep/` — Q1, Q2 and the `Final-shape corrections` Q1 kill-order entry are the binding contract
- `tests/sweep-freshness.test.ts` and `tests/shell-sweep.test.ts` — read-only for you
- `review-B.md` sections F8/F9/F10 in the leaf folder
- this skill folder's `ponytail.md` — deletion over addition; this repair is mostly deletion

## 4. Change list and needed interfaces

Owner path: `src/seat.ts` only. Commit A created the worker worktree at: `9e4541c3` (corrected reproductions present).

The target shape — delete and restore:

1. **Delete**: the freeze loop, the `frozen` set, all SIGSTOP/SIGCONT, the death-confirmation polling loop with its 2000 ms budget, the 8-round convergence machinery. Nothing replaces them.
2. **Restore the design's two-pass structure**: collect the snapshot; signal condemned targets **parents before children** (the depth ordering round 2 deleted — restore it); re-collect once with the same rule; signal anything new, skipping pids already recorded ended. That is the whole structure. There is no decision pass distinct from the passes, no waiting anywhere.
3. **Keep from round 2** (these are correct and their tests lock them):
   - condemnation by exact shell-tree descent: a member is condemned exactly when its tree root (first ancestor whose parent is the harness or outside the membership) is a shell; detached non-shell orphans and helper trees are never condemned;
   - the zombie filter in collection;
   - spare proof by live parentage walk (`walkReaches`/`reaches`): caller chain from `process.pid` plus the fresh spare-set seeds, consulted per target;
   - strict per-target proof order immediately before each signal: fresh stat (gone or changed start time → silent skip), then spare consultation, then the per-pid `/proc/<pid>/cgroup` read strictly last before SIGKILL.
4. The per-target evaluation described in 3 applies inside each pass's signal loop, unchanged in shape from round 2 — only the surrounding freeze/decision scaffolding is deleted.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a red reproduction after correct code is a mismatch returned with evidence.
- Do not change the `shell_sweep` row schema or `src/timing.ts`.
- Do not add any waiting, retrying, freezing or confirmation machinery — Q1 forbids the wait and F8–F10 are the evidence that the freeze class is harmful. Exception: none.
- Never run `git stash`; WIP commits then `git reset --soft 9e4541c3` before the single returned commit.
- Do not stop processes by command-line pattern.
- Return a mismatch with evidence instead of changing scope, tests or interfaces.

## 6. Ordered steps

1. Read the read-first list; run `bun test --timeout=60000 ./tests/sweep-freshness.test.ts` once to see the migration case red on the freeze head (it fails on `victimFrozen`).
2. Delete the freeze machinery and restore the two-pass parents-first structure per section 4.
3. Run all three targeted test files plus typecheck until green.

Advisory size: 1 file, net deletion of roughly 60 lines, under 30 turns.

## 7. Commands

Install dependencies first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

- `bun test --timeout=120000 ./tests/shell-sweep.test.ts`
- `bun test --timeout=60000 ./tests/sweep-freshness.test.ts`
- `bun test --timeout=120000 ./tests/seat-recovery.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All three targeted test files green, typecheck clean, one commit on top of `9e4541c3`. No test files changed, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
