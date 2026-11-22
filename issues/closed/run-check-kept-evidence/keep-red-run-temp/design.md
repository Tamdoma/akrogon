# Design: keep-red-run-temp

## Binding decisions, verbatim

### Signposts (issues/chart/run-check-kept-evidence/forks/signposts.md, Taken)

A's picks under full autopilot (signposts: A), 2026-11-20, not operator words:

1. 1a. The operator asked for "the simplest, most elegant solution"; the reported loss was a red exit.
2. 2a. The operator asked to resolve it "without destroying the other parts or ruining them"; a refusal-style keep pins leaf temp (B Q9).
3. 3a. "From the system's perspective" points at removing the class in the wrapper; a driver opt-in leaves every other `os.tmpdir()` driver broken.
4. 4a. The seat follows the printed line; a move breaks that path and can cross devices (`/var/tmp` to `/home`, lesson 2026-10-22 EXDEV).
5. 5a. The behavior is mechanical and reproducible with a failing local command.

Account: the session prioritizes one small rule in akrogon that keeps a red run's temp folder in place until the leaf's temp is released anyway, and gives up covering a killed wrapper or verify members unless that comes free. Chart order: one chart, nothing dropped.

### Kept run root (issues/chart/run-check-kept-evidence/forks/kept-run-root.md, Taken)

A's pick under full autopilot, 2026-11-20, not operator words: 1a 2a 3a 4a 5a, built as slots/kept-run-root-final-shape.md:

1. `checkedRun` (src/run-check.ts): when the command exits nonzero and the run was not refused, write an empty `.akrogon-kept` file in the run root and skip the final `rmSync(runRoot)`. `.owner` stays as written. A thrown error, a refusal and a zero exit behave as today.
2. `reconcile` (src/reconcile.ts) run-root loop: after the `refusal.json` check, a root holding `.akrogon-kept` is skipped with no `keep` and no `drop`, before any `.owner` read. `ownerKeeps`: a `run-*` directory holding `.akrogon-kept` returns no entry and is not recursed into, checked before its `.owner`.
3. Every `checkedRun` caller (run-check and verify), no parameter.
4. Lifetime: the leaf temp's existing release; `checkout`/`self-update` holder runs until the existing idle `dropUnowned` sweep, no timer.
5. Silent: no new stderr, status or leftovers output.
6. Docs: docs/reference/checks.md (private TMPDIR sentence) and src/AREA.md run-check and reconcile lines state that a red run's TMPDIR is kept until the leaf temp is released, a holder run's until the idle sweep.
7. Lessons: both LESSONS.md lines stay, because a killed wrapper and the holder idle sweep still lose evidence (lesson rule Retire clause); rewording is /learn-issues work after landing.

Reasons: signpost 1 (fewest parts) decides 2a, 3a, 5a; signpost 2 (no veto, no timer) decides 4a; the 2026-10-10 operator answer (crashed run roots are removed) decides 1a over 1b. B D1 removed the `.owner` deletion: both readers check the marker first, so a stale pid is never read.

Rejected: 1b (contradicts the 2026-10-10 answer, keeps every killed green run); 2b (one more condition for tidiness only); 3b (a mode flag on a shared function to save tens of MB, B's probe); 4b (a second silent rule with a clock); 5b (the child's printed path is the reader's route); C's chmod guard (today's `rmSync` has the same exposure; not a new failure).

Standing consultant dissent (C): 2b, 3b, 4b and the chmod guard.

### Carried operator answer (from kept-run-root Carries)

- Signposts (forks/signposts.md `## Taken`, A's): 1a fewest parts, 2a green unchanged and no veto or manual cleanup, 3a akrogon owns it with no driver change, 4a printed path stays valid in place, 5a free local proofs.
- Prior operator answer, issues/closed/worktree-isolation/check-env/design.md `### Outputs` Taken 2026-10-10, verbatim: "We need to make sure that all of the leftovers are always cleaned up unless it's logs or something that we will need in the future. So even this is too big. I don't want any gigabytes to be on the disc for no reason. I want the repo to be clean and up to date." Door reading then: run root removed at run end; the reconciler removes run roots whose process is gone.

### Exclusions

- Killed wrapper (SIGKILL, seat timeout): its root has no marker and is removed as a crashed run. Not this leaf.
- Holder (`--holder`, slug `checkout`) temps: kept roots go with the existing idle `dropUnowned` sweep; no timer, no new keep.
- `self-update` never holds a marked root: `checkedRun` is called only from `runCheck` and the three `src/verify.ts` sites, and `src/self-update.ts` uses its temp without it; Taken 4 names it for completeness, and no test or doc clause is owed for it. (B)
- Framework capture drivers: unchanged.
- learnings/LESSONS.md and learnings/history/: not touched by this leaf; the lines stay (lesson rule Retire clause), rewording is a later /learn-issues pass.

## Standing design

Installed path: /home/ivan/.akrogon/releases/5daa962e1c4ef03a80f0209a5c5520145f57ab61/skills/chart-issues/assets/standing-design.md.

Interpretation for this leaf: every done-criterion is mechanical and proven at the real CLI boundary with the repo's own `bun test` check (tests/run-check.test.ts, tests/verify.test.ts, tests/reconcile.test.ts) using the existing fixture helpers; no live or paid run, no new machinery. The behavior change is new behavior plus a fixed bug: the run-check red case shows failing before the change (the existing "removed on success and failure" failure half is the false expectation, deleted with its reason, and the red case's new expectation fails on the base) and passing after; each reconcile rule shows one deliberate break turning its test red (for example, dropping the marker check in `ownerKeeps`). The two existing tests whose failure halves pin the removal on red exit (tests/run-check.test.ts "run-check TMPDIR is a fresh run root under the leaf temp dir and is removed on success and failure", tests/verify.test.ts "verify removes each command TMPDIR on success and failure") change by design; their green halves stay. Tests guarding crashed-run cleanup, young ownerless roots, refusals and durable-capture SIGKILL cases stay unchanged and green.

## Held disagreements

- not a decision, the decision stands: against kept-run-root 2a, C holds that only a non-empty root (anything besides `.owner`) should be kept, because red lint or typecheck runs leave empty `run-*` folders until release; state: unanswered.
- not a decision, the decision stands: against kept-run-root 3a, C holds that verify should be excluded by a parameter on `checkedRun`, because a red verify member's TMPDIR has no reader and suites can be large (B's probe: largest run root 18 MB, 680 GB free); state: unanswered.
- not a decision, the decision stands: against kept-run-root 4a, C holds that marked roots in the `checkout`/`self-update` temps should survive a 60-minute window, because the idle sweep can remove holder-run evidence at the next pass; state: unanswered.
- not a decision, the decision stands: C holds that `checkedRun` should `chmod` the run root to 0700 before writing the marker, in case the child made it read-only; today's `rmSync` has the same exposure; state: unanswered.

## Leaf architecture

Owned surfaces: src/run-check.ts `checkedRun`; src/reconcile.ts `reconcile` (scratch-root run-root loop) and `ownerKeeps`; tests/run-check.test.ts, tests/verify.test.ts, tests/reconcile.test.ts; docs/reference/checks.md; src/AREA.md run-check and reconcile lines.

Literal interface: the marker is an empty file named `.akrogon-kept` directly inside the run root. The keep is decided at the successful return of the inner block of `checkedRun`, after the late `ownerRefusal` check and the `check_end` timing row, when `result.code !== 0`: a local set there is read by the outer `finally`, which then writes the marker and skips `rmSync(runRoot)`; a late refusal, a thrown error and a zero exit never reach that point and behave as today. (A,B) The marker is written only when the run root still exists, so a child that deleted its own `$TMPDIR` still gets its exit code returned and leaves no run root. (B) `.owner` is left as written.

State changes and their consumers:
- Run roots can now outlive their wrapper with a dead `.owner`. Consumers: `reconcile` run-root loop (checks `refusal.json` first, then `.akrogon-kept` -> `continue` with no `keep` and no `drop`, before reading `.owner`); `ownerKeeps` (a `run-*` directory holding `.akrogon-kept` returns `[]` before reading `.owner` and is not recursed into), reached from `dropChecked` and the host sweep; the leaf temp release (`dropChecked(dir)` once the tab and panes are gone and no keep happened) removes marked roots with the leaf temp; the `ownTemps` branch (`checkout`, `self-update`) `dropUnowned(dir)` removes them at the idle sweep, unchanged.
- `src/verify.ts` callers of `checkedRun` (setup, serial members, parallel members) inherit the rule with no parameter.
- `src/status.ts` and `src/leftovers.ts` read only `keep()` entries and are unchanged.
- An older akrogon reconcile meeting a marked root sees a dead `.owner` and drops it; it never pins it.

