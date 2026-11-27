# Review A: setup-before-seat

Initial review, slot A, 2026-11-25. Base `64681915`, reviewed head `cc92e145` (branch tip; tree `1ddd092d`). Diff `64681915...HEAD` read in full: `src/next.ts`, `src/config.ts`, `src/guard.ts`, `src/batch.ts`, docs, learnings, tests.

## Verdict: nits

No Fix found. Three Nits below.

## Verification evidence

- `akrogon verify` on `cc92e145`: green receipt `5fd551e7-88cc-4878-b697-00094ae0681e` — read from `issues/verify-runs.jsonl`: format exit 0, typecheck exit 0, test exit 0, end timestamp present. The earlier red verify (prettier only) is explained by `d091d8ee`, a formatting-only commit carrying the required `Test-Change:` trailers; no expectation changed, correct use.
- Criterion proofs rerun after the last input change: `check fix1-dispatch: 0` (implementation/check-fix1-dispatch-1795612913251-2953643.log, 7 pass) and `check fix1-busy: 0` (implementation/check-fix1-busy-1795612934257-2965698.log, 5 pass) — both cover the setup files on the final content; the whole-file runs inside the green verify confirm them on the committed head itself. Report cites commands, commits and results per proof.
- The in-pass incident (`tests/next.test.ts` changed-repo-root red) is documented in the report with red evidence (implementation/check-nextroot-repro-1795612350308-2797060.log) and the `cc92e145` repair; I independently re-verified the causal chain reading: `ensureLeafTemp` before the mismatch refusal creates a sweepable directory, reconcile's deletion triggers `git worktree prune`, prune drops the stale registration. The repair restores base ordering for non-setup passes and creates the temp inside the setup step, where the design requires it. Sound, and the leaf's own tests stayed green on both sides of the move.
- Marker semantics verified live: `git rev-parse --git-path akrogon-setup` inside a linked worktree resolves to the worktree-private `<common>/.git/worktrees/<name>/akrogon-setup` (tested in a scratch repo), so the marker is per checkout state as the design requires; same for `akrogon-install.lock`, matching the check-side composition.
- AREA.md path check: `src/next.ts`, `src/reconcile.ts`, `src/batch.ts`, `src/config.ts` all exist; `src/AREA.md` is 39 lines with the four required sections.

## Judgments against the contract

- D1-D8 implemented as decided: due detection on missing/differing marker, differing marker deleted before the run, `flock` + `constructedEnv` + in-process own-modules + marker write only on success, busy outcome before `writeLeafEnv`, created/recreated-worktree removal on failure under `worktreeLock` with existing/adopted kept, `move` marker deletion before `git reset --keep` only on the path that reaches the reset (the dirty-ref early return runs no reset, so no deletion belongs there — consistent with criterion 3's wording). Locked Q3a/Q4a/Q6a respected. Design exclusions untouched (`createSparseWorktree` unchanged, verify/buildStack untouched).
- `preexisting` is computed after the first-allocation removal/adoption block and before creation, so a commit-free leftover that this call removes and recreates is treated as created (removed on setup failure), while an adopted or long-standing worktree is kept. This matches the brief's removal split exactly.
- The busy gate's inputs are correct: `liveSeat` filters finished terminals, null status counts, `error`/`idle`/`done` do not; `liveRuns` matches repo+leaf. The `'busy' in worktree` narrowing cannot collide with parsed state because `stateSchema` is `strictObject` — checked.
- Criterion 4's "no capacity wait" is honored: `end('none')` records a `wait` row with reason `none`, never `capacity`; the test asserts exactly this. `end` dedupes repeated reasons, so a leaf held across passes leaves one row.
- Criterion 8: the history file ends with the `Applied` line naming `src/next.ts:ensureWorktree:478`; at head, line 478 is the `try {` opening the setup step — the first line of the step's executable code. Within tolerance; the report honestly notes line-shift fragility. The retire rule is satisfied: the stop lands before the harm on every reachable path (dispatch, re-prompt, `akrogon seat`, broadcast all pass `allocate`), keyed on success so a partial install retries.
- Docs claims match the implementation. Lesson line removal accepted.
- Criterion 5's report path: `CommandError` propagates through `dispatchLeaf`'s per-leaf catch, so the report names the leaf, exit code and captured output; tests assert leaf/exit/output in stderr.
- No model-choice gates, no paid operations, no credentials. No `merge_checks` run (correct — land-run only).

## Nits

- **N1 `tests/AREA.md` at 47 lines.** implement-issue holds affected AREA.md files at most 40 lines; this file was already 46 lines at base and the leaf added its required line to it. Deferred because the violation predates the leaf and compressing it means compressing entries unrelated to this leaf's diff; evidence to promote: a reading that the 40-line budget must be enforced at any touch, in which case the compression is a small docs pass on `tests/AREA.md`.
- **N2 Removal failure masks the setup failure.** In `ensureWorktree`'s catch, if `git worktree remove --force` itself fails after a setup failure, its `CommandError` replaces the original setup error as what propagates, so the per-leaf report would show the removal failure rather than the setup's exit code and output that criterion 5 wants reported. Realistic source requires both a setup failure and a removal failure in the same pass; I could not construct one without hand-crafting git internals, so no realistic source today. Evidence to promote: any real occurrence, or a simple fix (chain the original error as the removal error's cause).
- **N3 Docs say "actively working" while the gate also holds blocked/null seats.** `docs/reference/checks.md` and `src/AREA.md` describe the busy gate as "while a seat of the leaf is actively working"; the design and implementation also hold `blocked` and null-status seats. The prose's edge-case imprecision is the only gap; no user decision depends on the missing words. Evidence to promote: any operator confusion traceable to the wording.

## Notes

- No contact with the peer; this review is blind.
- No reusable lesson recorded from this pass: the leaf-temp/prune incident is already captured by the leaf's own repair and report, and its mechanism (a side effect before a refusal being swept mid-pass) is specific enough that no general line is warranted from A's seat.
- Nothing under `Operator actions`; no missing credentials.
