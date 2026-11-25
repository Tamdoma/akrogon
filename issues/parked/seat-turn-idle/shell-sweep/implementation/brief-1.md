# Brief 1 — repair the sweep's three concurrency defects (check.fix, handoff from review-B)

## 1. Goal

Repair the three Fixes review-B handed to A (review-B.md `## 2026-11-25 check.repair`, `Handed to A` list) in `src/seat.ts` and `src/phase.ts` of the shell-sweep leaf, so the committed reproduction tests turn green:

- **B F1 / A F1**: a looping shell's child forked in the kill window is reparented out of the tree and survives because it is not a shell — the leaked orphan stays in the seat scope.
- **B F2**: the spare set of run-writer pids is snapshotted once before collecting, so a writer admitted mid-sweep can be killed, leaving abandoned captures that refuse later moves.
- **B F3**: the membership re-proof is one bulk re-read per pass, so a process migrating out of the seat scope (a `systemd-run --scope` shell entering its run scope) between snapshot and signal is still killed.

## 2. Numbered acceptance criteria

1. `tests/shell-sweep.test.ts` case `committed move sweeps leftover shells…` passes in full, including its new T7/T8 assertions: a non-shell process whose fake parent is pid 1 (reparented leak) and one whose fake parent is a zombie are both dead after the move, while every previously-spared shape still survives.
2. `tests/shell-sweep.test.ts` case `a shell that migrated out of the seat scope before its signal survives the sweep` passes: processes whose per-pid `/proc` cgroup file places them outside the seat scope survive; the in-scope tree dies. The pre-existing per-pid cgroup files the fixture seeds are the proof surface.
3. `tests/sweep-freshness.test.ts` passes: the spare source is a callable re-consulted per target; a spare answer that changes from empty to holding the writer during the sweep leaves the writer's whole shell tree alive.
4. Every pre-existing case in `tests/shell-sweep.test.ts` and `tests/seat-recovery.test.ts` passes unchanged (no expectation edits).
5. The sweep never signals a process that is spared under a fresh read of the writer records at the moment its signal is evaluated.

## 3. Read-first list

- `src/seat.ts` (the whole sweep section: `sweepSeatShells`, `sweepOneSeat`, `procStat`, `argv0Name`, `isShell`, `scopeMembers`, `cgroupOf`)
- `src/phase.ts` `sweepCommittedMove` (spare-set computation and call site)
- `src/admission.ts` `leafRunWriterPids`
- `tests/shell-sweep.test.ts` and `tests/sweep-freshness.test.ts` (the reproductions — read-only for you)
- `review-B.md` F1/F2/F3 in `/home/ivan/Work/infra/akrogon/issues/open/seat-turn-idle/shell-sweep/`
- this skill folder's `ponytail.md` — shortest correct diff, reuse helpers, deletion over addition

## 4. Change list and needed interfaces

Owner paths: `src/seat.ts`, `src/phase.ts`. No other source file needs changes. Commit A created the worker worktree at: `e194228d` (reproduction commit, red tests present).

Required mechanism shape (the reproduction tests are written against exactly this; deviating from it leaves them red, which is a mismatch to return, not a test to edit):

1. **Orphan rule widened**: a member whose parent is neither the harness nor another in-scope member is a root even when it is not a shell, and is ended with its tree. Shells parented at the harness stay shell-only roots exactly as today — the widened rule covers only the parent-outside-the-scope case. Non-shell harness children (helpers) and their subtrees remain spared because they are never roots. `tests/shell-sweep.test.ts` T7/T8 are the proof: a zombie parent (stat state `Z`) counts as dead — extend the proc stat parse with the state character and treat zombie members as absent in collection.
2. **Fresh per-pid membership at signal time**: replace the per-pass bulk `cgroup.procs` re-read with a read of `/proc/<pid>/cgroup` (through `procRoot()`) immediately before each signal. The process stays in scope only when its cgroup path equals the seat scope path or is a descendant of it (`<scopePath>` or `<scopePath>/…`). A vanished or unreadable cgroup file at that point means the process is gone or leaving — skip it silently like the existing ENOENT stat case. Drop the bulk re-read error path it replaces.
3. **Spare freshness**: the writer set is re-consulted per target at signal evaluation, never snapshotted once per sweep. Change `sweepSeatShells(repo, leaf, seats, spare)` so `spare` is a callable `() => ReadonlySet<number>`; `sweepCommittedMove` passes `() => leafRunWriterPids(repo.name, leaf.state.slug)`. The caller-chain members are static within one pass and may still be computed once per pass; only the writer records are re-read per target. Whether a target is spared is evaluated immediately before its signal: the target or any in-scope ancestor of it inside a shell subtree holding a writer pid, or in the caller chain. Keep the tree-expansion semantics exactly as they are (whole trees of a seed's tree root); only the consultation timing changes.
4. Keep: parents-before-children kill order, pre-signal start-time re-proof, one re-collect pass, per-seat error capture, the slice check, never-throws behavior, the `shell_sweep` row shape.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file. A red reproduction after correct code is a mismatch: return it with evidence. Reason: A owns the tests; the exception is a revised brief from A.
- Do not change the `shell_sweep` timing row schema or `src/timing.ts`. Reason: the row contract is reviewed behavior; exception: none without a mismatch return.
- Do not add abstractions, configurability or guards beyond the three repairs. Reason: the leaf's design values fewest moving parts; exception: none.
- Never run any `git stash` subcommand — worktrees share one stash. To set work aside: commit as WIP and before returning `git reset --soft e194228d`, then make the unit's single returned commit.
- Do not stop processes by command-line pattern. Reason: the pattern hits other leaves' runs; exception: none.
- Restated: return a mismatch with evidence instead of changing scope, tests or interfaces; the only exception is a revised brief from A authorizing the change.

## 6. Ordered steps

1. Read the read-first list. Run the three red proofs once to see current failure output: `bun test --timeout=120000 ./tests/shell-sweep.test.ts` and `bun test --timeout=60000 ./tests/sweep-freshness.test.ts` (install dependencies first per section 7).
2. Implement the zombie-aware stat parse and the orphan-root widening in `src/seat.ts` (criterion 1).
3. Replace the bulk membership re-read with per-pid cgroup reads at signal time (criterion 2).
4. Convert the spare parameter to a callable and re-evaluate writer spares per target; update `src/phase.ts` (criteria 3, 5).
5. Run the targeted commands until green.

Advisory size: 2 files, under 40 turns.

## 7. Commands

Install dependencies first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

Targeted tests (run both, in the worker worktree):
- `bun test --timeout=120000 ./tests/shell-sweep.test.ts`
- `bun test --timeout=60000 ./tests/sweep-freshness.test.ts`
- `bun test --timeout=120000 ./tests/seat-recovery.test.ts` (regression guard for the predicate half)

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` line.

## 8. Done-when, evidence and report

All three targeted test files green, pre-existing expectations unedited, one commit on top of `e194228d` with the repair. A commit changing a `src/test-files.ts`-matched path needs the `Test-Change:` trailer — you change no test file, so none applies unless that changes.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
