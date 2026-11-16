# Review A: refuse-failed-runs

Base `7cee541d9d9aedabd3c00e069d5c890ec2f2e6a3`, reviewed head `00712483` (tree identical to verified head `7caad67d` — `00712483` is a trailer-only empty commit).

## Evidence reviewed

- Diff `7cee541d..HEAD`: `src/run-check.ts`, `src/timing.ts`, `src/AREA.md`, three docs files, `tests/run-check.test.ts`, `tests/verify.test.ts`, `tests/state-inventory.test.ts`.
- `implementation/report.md`: criterion proofs (`impl-run-check-tests2` 31 pass, `impl-verify-tests2` 71 pass), typecheck and format green, verify receipt `check-test-1794845511438` green on `7caad67d` (1199 tests). The one leaf-caused red (state-inventory's stale `failed`-leaf expectation) is corrected and cited; the door-exchange red is recorded `inconsistent` with a green rerun — consistent with the lifecycle rule.
- `plan.md` deliberate-break evidence: seven breaks each shown red and reverted, including the brief's named break (late read removed).

## Judgment

- C1: `failedRefusal` re-reads `state.yaml` at `dirname(target)` both before admission (after early `ownerRefusal`, before `runRoot`) and inside `withAdmission` after the fenced `ownerRefusal`, before capture files. Exit non-zero via `PublishRefusedError`, brief text reproduced including `(failure record unavailable)` and the recovery clause naming no phase when `failure` is absent. T1/T1b/T2/T7 cover worktree cwd, `--leaf`, worker scope, missing record and the verify setup stage.
- C2: the only admission queue is the `full` line; T3 drives a real held run + waiter through `spawnFiles`, waits on the `waiting for` line, fails the leaf mid-wait and asserts the refusal after promotion with no child. The named deliberate break is recorded red.
- C3: exactly one `check_refused` row per refusal; schema member matches the design's literal interface; row carries the fresh `phase: 'failed'`, scope, unit and attempt.
- C4: holder/checkout callers skip via `caller.phase === undefined`; mid-run failure finishes (late read is the acceptance point); verify green-receipt reuse and live-pass join unchanged and covered by T8a/T8b.
- `checkedRun` signature unchanged, so all three callers (`runCheck`, verify sequential, verify members) get both reads; `passCaller`'s snapshot phase is correctly never consulted for the decision.
- `tests/state-inventory.test.ts` reorder preserves the bad-sibling isolation property; the old ordering contradicted criterion 1 and the correction is cited.
- AREA.md path listing: runtime `issues/` paths named in prose do not exist in the repo tree by design (they live in the registered checkout); not defects. Changed doc text verified against code and is accurate.

## Fixes

None.

## Nits

- N1: `docs/reference/checks.md` and `commands.md` say "`--holder` targets carry no phase and are never refused". The precise rule is the resolved caller: `--holder` from inside a leaf worktree resolves to the leaf (holder is only the no-leaf fallback) and is refused on a failed leaf. The sentence can mislead a reader relying on `--holder` as an escape hatch. Deferred: the common checkout usage is correctly described and the code is right; promoted if a user or seat is observed misreading it.
- N2: plan N1 divergence — design's literal missing-record tail drops `<slug>` (`akrogon phase`); the implementation keeps `akrogon phase <slug>` per the criterion's template. Brief-compliant either way; recorded for B's confirmation, no consequence today.

## Count audit

No grants and no paid or covered launches on this leaf; artifacts show only free local `run-check`/`verify` runs. `issues/timings.jsonl` and kept `check-*` logs match.

## Verdict

`nits` — all done-criteria proven at the CLI boundary, evidence complete, two non-blocking documentation/interpretation notes.
