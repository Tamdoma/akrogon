# Brief 5 — first-census lineage boundary and sweep outside the global lock (check.fix round 5, handoff from review-B)

## 1. Goal

Repair the two items review-B's round-4 re-review handed to A (`review-B.md`, `## 2026-11-25 check.repair after repair round 4`, `Handed to A`):

- **F11**: process-group lineage currently condemns any member sharing a signalled shell's group — including a non-shell child of the harness that shared a job-control pipeline group with the shell from the first census, was never the shell's descendant, and had provable non-shell ancestry all along.
- **F12**: the admission fence blocks under the home-wide `.lock`, so any unrelated run admission waiting on its repo line lock (holding the shared admission lock across its polling loop) stalls every lifecycle pass of every repo — the cross-repo stall design Q1 forbids.

## 2. Numbered acceptance criteria

1. The pipeline-sibling case in `tests/sweep-freshness.test.ts` passes: both stages seeded as direct harness children in the victim shell's job group — the shell dies, the non-shell sibling survives.
2. The lineage case keeps passing: the leaked kill-window orphan (absent from the first census) carrying the victim shell's group still dies; the setsid detached control still survives.
3. The stall case in `tests/shell-sweep.test.ts` passes: while the admission lock is held shared externally and the sweep is blocked (no rows), the home-wide phase lock is free; after release the move completes and rows exist.
4. The publication-fence case keeps passing: no `shell_sweep` row can appear while the admission lock is held.
5. All pre-existing cases in the three test files pass unchanged.
6. Design Q1 holds in both directions now: no waiting of any kind inside the home-wide lock region, and the admission fence still covers scan-to-signal.

## 3. Read-first list

- `src/seat.ts` sweep section; `src/phase.ts` `commitMove`, `sweepCommittedMove`, and the call sites of `commitMove` (there are several — read each); the outer `withLock` regions in `phaseCommand` around `transition`
- `tests/sweep-freshness.test.ts` sibling and lineage cases; `tests/shell-sweep.test.ts` stall and fence cases — read-only for you
- `review-B.md` round-4 sections F11/F12 and the chart D rebuttal R4 quoted in `design.md` (the lock-held-wait rejection)
- this skill folder's `ponytail.md`

## 4. Change list and needed interfaces

Owner paths: `src/seat.ts`, `src/phase.ts`. Commit A created the worker worktree at: `2f3566db`.

The mechanism the reproductions are written against:

1. **First-census boundary for lineage** (F11). Lineage condemnation applies only to members absent from the pass-1 census. A member present in the first census is classified by the ordinary shell-tree rule alone: provable ancestry is the first-pass rule's business, and lineage exists exactly for the members that arrive after it. Implementation shape is your choice (the pass-2 condemnation gains the pass-1 pid set, or equivalent); the observable contract is: same-pgrp harness children present from the start survive, late orphans carrying a signalled shell's group die.
2. **Sweep outside the home-wide lock** (F12). The sweep is committed-move follow-up — the move is already saved and logged when it runs — so it must run after the transition's `.lock` region ends, while keeping the admission lock (exclusive) wrapped around scan-and-signal. The structural requirement: inside `commitMove` the sweep must no longer execute, because every `commitMove` call site runs inside `.lock`. How the follow-up reaches the sweep after the lock region is your design within these constraints:
   - the sweep must still be synchronous within the reporting CLI's lifetime: the CLI process must not exit before the sweep completes (the tests and the operator-facing contract both rely on the sweep rows existing when the command exits);
   - every `commitMove` call site must get the sweep — read them all and find the single natural place, or restructure `commitMove` minimally;
   - a crash between commit and sweep losing the sweep is accepted pre-change behavior;
   - do not weaken the admission fence: scan-to-signal stays atomic against publication.

## 5. Do-not, reasons and exceptions

- Do not write or edit any test file; a red reproduction after correct code is a mismatch returned with evidence.
- Do not change admission internals, `withAdmissionLock`'s mode, or `withLock` itself.
- Do not reintroduce waiting, freezing, or extra passes inside the sweep.
- Do not change the `shell_sweep` row schema or `src/timing.ts`.
- Never run `git stash`; WIP commits then `git reset --soft 2f3566db` before the single returned commit.
- Do not stop processes by command-line pattern.
- Return a mismatch with evidence instead of changing scope, tests or interfaces.

## 6. Ordered steps

1. Read the read-first list; run the two red cases once.
2. Implement the first-census lineage boundary in `src/seat.ts`.
3. Restructure the sweep placement in `src/phase.ts` per section 4 item 2 — this is the delicate half; trace every `commitMove` call site before choosing.
4. Run all three targeted test files plus typecheck until green.

Advisory size: 2 files, under 45 turns.

## 7. Commands

Install dependencies first: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile --backend=copyfile'`

- `bun test --timeout=120000 ./tests/shell-sweep.test.ts`
- `bun test --timeout=60000 ./tests/sweep-freshness.test.ts`
- `bun test --timeout=120000 ./tests/seat-recovery.test.ts`
- `bun run typecheck`

Keep output through `akrogon run-check --name <label> -- <cmd>` and cite the `check <label>: <exit> <path>` lines.

## 8. Done-when, evidence and report

All three targeted files green, typecheck clean, one commit on top of `2f3566db`. No test files changed, so no `Test-Change` trailer applies.

Changed files and reasons: <paths and why>
Tests run: <commands and results>
Known limitations: <limitations or none known>
Unverified criteria: <criterion and why, or none>
