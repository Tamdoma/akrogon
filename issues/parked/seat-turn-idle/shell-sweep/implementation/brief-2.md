# Brief 2 — freeze-based sweep redesign (check.fix round 2, handoff from review-B)

## 1. Goal

Repair the four items review-B's re-review handed to A (`review-B.md`, `## 2026-11-25 check.repair after repair round 1`, `Handed to A`): B F1/A F1 (looping shell's kill-window child), B F2 (mid-sweep writer absent from the ancestry snapshot), B F3 (migration inside the spare consultation), B F6 (detached non-shell processes wrongly killed). The round-1 repair approach — kill pass then re-collect — is conceptually unable to fix F1 without F6's overkill, because once the parent shell is dead the child's ancestry is unprovable. The replacement design makes the process tree static before deciding anything: freeze condemned candidates with SIGSTOP, collect under the freeze, decide with fresh per-target proofs, then SIGKILL, then SIGCONT everything spared.

## 2. Numbered acceptance criteria

1. All four cases in `tests/sweep-freshness.test.ts` pass unchanged, including: the forked-in-the-kill-window child dies with its frozen parent (`stoppedAtConsult === true`), the mid-sweep writer's whole shell tree survives, the shell migrating during the spare consultation survives, and the pre-existing freshness case still passes.
2. `tests/shell-sweep.test.ts` passes in full, including T7/T8 survival: detached non-shell processes parented outside the scope since before the move are never targeted (F6).
3. `tests/seat-recovery.test.ts` passes unchanged.
4. Every pre-existing sweep behavior is preserved: `shell_sweep` row shape, per-seat error capture, slice check, never-throws, run-writer states, caller-chain sparing.
5. No process outside the leaf seat scopes is ever stopped or killed; nothing the sweep spares stays frozen after it returns (no leaked SIGSTOPs).

## 3. Read-first list

- `src/seat.ts` sweep section in full, `src/phase.ts` `sweepCommittedMove`, `src/admission.ts` `leafRunWriterPids`
- `tests/sweep-freshness.test.ts` and `tests/shell-sweep.test.ts` — the reproductions, read-only for you
- `review-B.md` F1/F2/F3/F6 in `/home/ivan/Work/infra/akrogon/issues/open/seat-turn-idle/shell-sweep/`
- this skill folder's `ponytail.md`

## 4. Change list and needed interfaces

Owner paths: `src/seat.ts` (and `src/phase.ts` only if the sweep call needs it — it should not). Commit A created the worker worktree at: `6179ddae` (red reproductions present).

The mechanism the reproductions are written against:

1. **Condemnation rule restored to shell trees** (fixes F6): a member's *tree root* is the first ancestor whose parent is the harness or outside the membership. A member is condemned exactly when its tree root is a shell (comm or argv0 basename in `shellCommNames`). Non-shell orphan members — detached daemons — have themselves as non-shell tree roots and are never condemned. Harness children that are shells stay roots exactly as today; shells under non-shell harness children are never condemned because their chain passes the helper first.
2. **Freeze loop before any kill** (fixes F1): collect the scope membership snapshot; SIGSTOP every condemned member except harness pid and any caller-chain member (chain walked live from `process.pid`, only in-scope links matter); re-collect; repeat until a collect adds no new condemned members, bounded at 8 iterations (beyond that, record a per-seat error and decide from what is frozen). Because stopped processes cannot fork, convergence is guaranteed in practice: any child forked before its parent's stop appears in a later collect with its parent link intact. Track every pid actually stopped.
3. **Decision pass**: after convergence, one final collect is the decision snapshot. Recompute condemned membership on it (same tree-root rule). Condemned members include shell-tree members whether or not they were stopped (a shell forked by the harness mid-sweep is still a shell root's tree).
4. **Per-target proof order, strict** (fixes F2/F3), immediately before each SIGKILL:
   a. re-read the target's stat: gone or changed start time → skip silently;
   b. consult the spare callable fresh: the target is spared if it is in the caller chain, or if walking **live** `/proc` parentage from any spare seed reaches the target or the target's tree root before leaving the scope — the live walk matters because a writer forked mid-sweep is absent from every snapshot but its real parent chain leads through its condemned shell;
   c. re-read the target's own `/proc/<pid>/cgroup`: null, or a path equal to the seat scope or below it, or skip — this read must be the last proof before the signal, strictly after the spare consultation;
   d. SIGKILL; record `{pid, comm}` in `ended`. On any failure: SIGCONT the target if it was stopped, record the error (ESRCH stays silent).
   A spared target that was stopped gets SIGCONT and lives.
5. **Final continuation**: every stopped pid not killed receives SIGCONT — no frozen survivors, ever, including shell trees spared by a writer.
6. Delete: the pass-1/pass-2 kill structure, the per-pass bulk membership re-read, the broad orphan-root rule from round 1, the depth ordering (frozen parents cannot fork). Keep: zombie members count as absent in collection (a zombie cannot fork and parents nothing living), the comm/argv0 shell detection, the tree-expansion spare semantics for the caller chain, the `SeatSweep` result shape.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a red reproduction after correct code is a mismatch returned with evidence. Exception: none — A owns the tests.
- Do not change the `shell_sweep` row schema or `src/timing.ts`.
- Do not freeze the harness pid or any caller-chain member — a frozen CLI deadlocks the sweep itself.
- Never run `git stash`; WIP commits then `git reset --soft 6179ddae` before the single returned commit.
- Do not stop processes by command-line pattern.
- Return a mismatch with evidence instead of changing scope, tests or interfaces.

## 6. Ordered steps

1. Read the read-first list; run the red proofs once (`bun test --timeout=60000 ./tests/sweep-freshness.test.ts`, `bun test --timeout=120000 ./tests/shell-sweep.test.ts`) to see failure shapes.
2. Rewrite the sweep core per section 4. Expect to replace most of `sweepOneSeat`'s inner machinery; keep the outer structure (slice check, result capture) and helpers that still apply.
3. Run all three targeted files until green.
4. Verify no frozen survivors: the freshness tests assert victim survival after sparing — a leaked SIGSTOP shows as a stuck process in the test's own cleanup.

Advisory size: 1–2 files, under 50 turns.

## 7. Commands

Install dependencies first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

- `bun test --timeout=120000 ./tests/shell-sweep.test.ts`
- `bun test --timeout=60000 ./tests/sweep-freshness.test.ts`
- `bun test --timeout=120000 ./tests/seat-recovery.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All three targeted test files green, expectations unedited, one commit on top of `6179ddae`. No test files changed, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
