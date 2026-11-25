# Brief 4 — process-group lineage and admission-lock atomicity (check.fix round 4, handoff from review-B)

## 1. Goal

Repair the two items review-B's round-3 re-review handed to A (`review-B.md`, `## 2026-11-25 check.repair after repair round 3`, `Handed to A`):

- **B F1/A F1**: a non-shell child forked by a looping shell in the kill window is orphaned when the parent dies in the first pass, and the second pass drops it as a non-shell root — the incident's actual `sleep`/`git` children leak in the seat scope. The repair evidence is process-group lineage: the tool shell leads its own process group (chart proof P1), its children inherit that group across reparenting, while a detached daemon calls setsid and leads its own.
- **B F2**: admission publishes writer records under the shared admission lock (`src/admission.ts:54`), but nothing serializes that publication against the sweep's scan-to-signal sequence — a record published in that interval is missed and the writer's shell tree is killed.

## 2. Numbered acceptance criteria

1. The lineage case in `tests/sweep-freshness.test.ts` passes: the sleep child injected as an orphan carrying the victim shell's process group dies; the detached orphan leading its own process group survives; victim and control die.
2. The lock case in `tests/shell-sweep.test.ts` passes: while the admission lock is held shared externally, no `shell_sweep` row can appear; after release the move completes and rows exist.
3. All pre-existing cases in `tests/sweep-freshness.test.ts`, `tests/shell-sweep.test.ts` and `tests/seat-recovery.test.ts` pass unchanged.
4. Design Q1 is untouched: no waiting, no freezing, two passes parents-first. Q2's boundary is untouched: detached non-shell processes in the inherited cgroup survive.
5. No deadlock is introduced: the global leaf lock `.lock` must remain the outer lock everywhere — nothing holding the admission lock may wait on `.lock` (the sweep is inside `.lock` already, so this ordering is natural).

## 3. Read-first list

- `src/seat.ts` sweep section in full; `src/phase.ts` `sweepCommittedMove` and its call site in `commitMove`; `src/admission.ts` `withAdmissionLock`, `leafRunWriterPids`
- `src/state.ts` `withLock` (the flock wrapper: exclusive default, shared mode)
- `tests/sweep-freshness.test.ts` lineage case and `tests/shell-sweep.test.ts` lock case — read-only for you
- `review-B.md` round-3 re-review sections F1/F2 in the leaf folder; the kernel trace `implementation/check-recheck-round3-order-1795585404774-2994899.log`
- this skill folder's `ponytail.md`

## 4. Change list and needed interfaces

Owner paths: `src/seat.ts`, `src/phase.ts`. Commit A created the worker worktree at: `c44ba55d` — run `git log --oneline -1` to confirm; if it differs use the actual head of the reproduction commit.

The mechanism the reproductions are written against:

1. **Process-group lineage in the re-collect pass** (F1). Extend the proc stat parse with field 5 (process group id; the fields after the last `)` are positional: state, ppid, pgrp — currently parsed indices shift by one insertion). In a re-collect pass, a member that is not condemned by the ordinary shell-tree rule is additionally condemned when it is not a shell root itself and its process group id equals the pid of a shell the sweep already signalled in an earlier pass. Track the shells signalled per pass; only shells (never non-shell descendants) seed lineage. Do not broaden further: a member whose group leader was a spared or never-condemned shell is unaffected; a member leading its own group (the setsid detached-daemon shape) is never condemned by lineage. Passes beyond the second do not exist — lineage applies to the one re-collect pass the design prescribes.
2. **Admission-lock atomicity** (F2). `sweepCommittedMove` in `src/phase.ts` wraps the `sweepSeatShells` invocation in the admission lock **exclusive** (the same `admission.lock` file publishers take shared in `withAdmissionLock`), so no record publication can interleave between any writer scan and any signal inside the sweep. The flock helper is async; `sweepCommittedMove` is already async. Read `src/state.ts:389` for the exact `withLock` signature and use the same lock path as `withAdmissionLock` (`resolve(globalHome(), 'admission.lock')`). The resolution-failure path (seats unreadable) is unchanged and stays outside or inside the lock — your judgment, but keep it simple. Do not change `sweepSeatShells`'s signature or make it async: the lock wraps at the phase layer. Publication ordering consequence to preserve: a writer whose publication completes after the signals is reparented but alive — that is correct and untestable here.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a red reproduction after correct code is a mismatch returned with evidence.
- Do not change `withAdmissionLock`'s shared mode or any admission internals — the atomicity comes from the sweep taking the exclusive side, not from changing publishers. Reason: admission serialization is out of this leaf's scope; exception: none.
- Do not reintroduce waiting, freezing, or extra passes — design Q1 forbids them.
- Do not change the `shell_sweep` row schema or `src/timing.ts`.
- Never run `git stash`; WIP commits then `git reset --soft` to the reproduction commit before the single returned commit.
- Do not stop processes by command-line pattern.
- Return a mismatch with evidence instead of changing scope, tests or interfaces.

## 6. Ordered steps

1. Read the read-first list; run the two red cases once to see the failure shapes.
2. Implement the pgrp parse and lineage condemnation in `src/seat.ts`.
3. Implement the lock wrapping in `src/phase.ts`.
4. Run all three targeted test files plus typecheck until green; run the freshness file at least three consecutive times (its death assertions poll, but the rest must be deterministic).

Advisory size: 2 files, under 40 turns.

## 7. Commands

Install dependencies first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

- `bun test --timeout=120000 ./tests/shell-sweep.test.ts`
- `bun test --timeout=60000 ./tests/sweep-freshness.test.ts`
- `bun test --timeout=120000 ./tests/seat-recovery.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All three targeted files green, typecheck clean, one commit on top of the reproduction commit. No test files changed, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
