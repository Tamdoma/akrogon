# Test Writer 3 Report: direct-timing, direct-runs, direct-phases

Branch `direct-leaf`, worktree `/home/ivan/.akrogon/worktrees/akrogon/direct-leaf`. Three new test files written, nothing else modified, nothing committed.

## Files

### tests/direct-timing.test.ts (3 tests, criterion 5)

1. `a direct leaf shows TIME from its creation and first_prompt in json, with waits_on for its phase` — full-ISO `created`, text TIME column via column slicing, JSON `first_prompt === Date.parse(created)`, implement waits_on `['A']`, check.review round-0 waits_on `['B']` alone, lifecycle control TIME `-`.
   Red at base: `status` exits 1, unreadable state (`Unrecognized key: "direct"`).
2. `a merged direct leaf totals its merge time from creation, not null` — log row merge→merged at the close timestamp, `total_ms === close - created`.
   Red at base: `status --json` exits 1, unreadable state.
3. `a direct leaf shows no prompt or seat_done gaps, its run pair counts, and an unpaired check start is still flagged` — real run pair `leaf:unit` lines `    check leaf:unit 5m`; direct leaf has no `incomplete prompt`/`seat_done` lines while the same-journey lifecycle control shows both; unmatched `check_start lint` yields exactly `['  incomplete check_end lint']`.
   Red at base: report prints `incomplete prompt` lines because direct suppression does not exist. Notably the `check leaf:unit 5m` pair line already passes at base, since run pairing is attribution-independent.

### tests/direct-runs.test.ts (3 tests, criterion 6)

1. `run-check from the direct leaf worktree attributes the run, the timings rows and the log to the leaf` — exit 0, stderr `check dcrun: 0`, check_start/check_end rows carry slug, one `check-dcrun-*.log` under `implementation/`; plus a live admission record proof: a slow check held by `spawnFiles`, one `$AKROGON_HOME/runs/*.yaml` with `leaf: dc-run`, repo name, check name, `state: live`.
   Red at base: `run-check` exits non-zero with `Invalid state` (leafTarget cannot read the direct leaf's state).
2. `verify from the direct leaf worktree records the leaf slug and publishes logs under its implementation folder` — leaf/scope/sha/commands assertions on the verify-runs.jsonl record, log file in the implementation folder, check_end timings row carries the slug.
   Red at base: same unreadable-state failure at verifyCaller's attribution read.
3. `the same run from the repo root attributes no leaf` — refusal without `--holder` names `--holder`, success with `--holder`, timings rows carry no leaf slug, log lands in the holder directory, leaf implementation folder absent.
   Passes at base by design: it is the regression control pinning existing non-direct behavior, not new behavior.

### tests/direct-phases.test.ts (6 tests, criterion 7 routing/citations)

1. `the legal direct sequence implement -> check.review -> check.repair -> check.fix -> check.review -> merge is green end to end with correct waits_on per round` — every move `--slot`-correct with exit 0 and `moved <phase>`, fix_rounds increment, waits_on `['B']` after every check.review entry (rounds 0, 1, 2) and `['A']` elsewhere; closes with a merged-phase probe asserting `A seat cannot make merged calls`.
2. `illegal direct moves are refused: implement to merge, implement to check.fix, and wrong-seat moves` — stderr `Illegal move implement -> merge` / `Illegal move implement -> check.fix`, wrong-seat refusals name `required --slot`, phase unchanged after each.
3. `implement to failed refuses without --reason and commits with one` — bare move stderr `Failed requires --reason`; the accepted move is asserted on stdout `moved failed` and committed state rather than exit code, because the committed move's post-commit announce throws `MoveCommittedError` in a pure fixture (no hc session) — the state change itself commits before that throw, verified by probe.
4. `check.repair to merge is refused without merge_exit, on a conflict exit, and after the head moved past the red top; accepted unedited on a red exit` — four sub-cases. The refusal assertions pin non-zero exit, unchanged phase, and stderr free of `Invalid state` (no vacuous pass while the state is unreadable), but do not pin refusal text because the direct repair-to-merge refusal message shape is not fixed anywhere in plan/design.
5. `merge moves anywhere else by hand are refused for a direct leaf` — implement/check.review name `Illegal move merge -> <target>`; check.fix is covered by the pre-graph interception `Merge moves to check.repair itself` (no `--slot`, since that refusal precedes slot validation).
6. `a commit adding a test file without a Test-Change trailer refuses the review move naming the citation, and carrying it moves` — refusal stderr contains `x.test.ts` and the `Test-Change: x.test.ts <source and reason>` line; after a `--allow-empty` citation commit and fresh green receipt the move succeeds.

All six red at base with `ZodError ... Unrecognized key: "direct"` (schema rejection of the direct state) except where assertions fire earlier on the same root cause.

## Shared construction

Both files use a local `directLeaf` helper: state written through the existing `leaf()` test helper with `frozen: {}` and `frozen_cited: []`, then rewritten schema-free with `writeYaml` adding `direct: true`, a full-ISO `created`, and seat refs `A`/`B` — the create-verb record shape from design.md. `directWorktree` builds the real sparse worktree with the product `createSparseWorktree` helper on branch = slug at `worktree_store/<slug>`, matching what `leafTarget`/`verifyCaller` derive by basename. JSON envelopes are parsed with zod looseObject schemas and find-by-slug, never by index.

## Validation

- `bun run typecheck` — zero errors.
- `bun test tests/direct-timing.test.ts tests/direct-runs.test.ts tests/direct-phases.test.ts --timeout=120000` — 11 fail / 1 pass (the intentional control) in 327ms. Every failure traces to the missing `direct` schema key or missing direct suppression/routing; no vacuous passes, no infra flakes.
- Construction validation by shim: copies of the phase and runs files with the `direct: true` line removed (plain lifecycle leaves, everything else identical). Result: both runs attribution tests pass at base, the citations test passes at base, the failed-move and merge-by-hand refusal tests pass at base, and the legal sequence passes every move/exit-code/stdout assertion at base — diverging only where direct behavior intentionally differs (waits_on round-0 pair vs B-alone, slot tables, verdict interception). This confirms the git, worktree, receipt and move plumbing is correct; the tests are not accidentally red for the wrong reason.
- The timing tests cannot be shim-validated (their core assertions are direct-only behavior), but their row construction copies `timing-report.test.ts` exactly and their control assertions on the lifecycle leaf pass.

## Open questions resolved, no deviations

1. Citations guard: `requireTestChangeCitations` filters changed paths by status letters `M`/`D`/`T` *or* nothing (untracked/added). An added test file `x.test.ts` has status `''` in a merge-tree diff, so the guard fires for added test files. With `frozen: {}` this is exactly lifecycle-exact behavior — every added test file needs a `Test-Change:` trailer regardless of the reviewer's frozen list, matching design item 12. No deviation; the test is written as planned and shim-verified passing at base.
2. `frozen: {}` writes without issue and the strictObject schema accepts it — only the `direct` key is rejected at base, so red is honest.
3. implement→failed exit code: the accepted move commits state then throws `MoveCommittedError` in a pure fixture (post-commit announce needs hc). The test asserts stdout `moved failed` and committed state instead of exit code. The plan allows exit 0 "when no hc call is possible"; the harness yields non-zero after commit, so asserting exit 0 would be wrong in either world — stdout + state is the robust assertion.
4. A seat-cannot-make-merge-calls probe for `merged` closes the legal sequence, pinning the refusal ordering that precedes the transition graph.

## Notes

- Other writers' untracked test files (`direct-create`, `direct-seats`, `direct-drop`, `direct-active`, `scratch-check`) exist in the shared worktree; untouched. Typecheck is clean across all of them.
- No src/ or helper edits, no commits.
