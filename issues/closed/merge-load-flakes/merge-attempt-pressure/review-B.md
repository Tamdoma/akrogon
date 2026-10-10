# Slot B review

Date: 2026-10-10
Phase: check.review
Base: `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`
Reviewed head: `333f6453a07cec3dc659a1b44c565cde833dd4ed`
Verdict: **fix**

## Findings

### F1 — Fix: criterion 1 lacks proof of creation and rerun preservation

Source and criterion: brief done-criterion 1 requires stall increases **from batch creation**, including a restack with decision `rerun` then `reuse`. The real source is a new batch made by `next`/`mergePass`, followed by remote code movement requiring another gate run and later record-only movement allowing reuse.

Every pressure outcome test manually saves `withStart(record, ...)` into an already-created batch (`tests/merge-attempts.test.ts:201`, `:491`, `:524`). The only injected creation test uses malformed PSI and expects refusal. The reuse test at `:520` advances only issue/lesson records and immediately asserts `reuse` at `:541`. It never reaches `rerun`. Existing rerun tests in `tests/batch-merge.test.ts` do not assert pressure or original counters.

Consequence today: the acceptance proof passes even when the command never stores start counters, which makes every normally-created attempt omit pressure. It also does not prove the expressly required rerun-to-reuse preservation outcome. This is a missing-test Fix under criterion 1, not a claim that the present storage/spread code is broken.

Verification: in a temporary detached checkout of the reviewed head, replace only `pressure_start: start,` in `src/next.ts` with `pressure_start: undefined,`. Run `bun test tests/merge-attempts.test.ts --timeout=30000`: exit 0, **20 pass, 0 fail, 131 assertions**, 3.72 seconds. Repository search finds no pressure assertions in another test file. The same command on the unchanged review worktree also passed all 20 tests.

Required repair: add a real successful creation-to-ending test through the injected directory, letting the command save the original snapshot. Exercise remote code movement yielding `rerun`, rerun the gate, then record-only movement yielding `reuse`, and assert the final deltas still use the original creation counters. Show disabling creation storage turns that proof red. Keep existing regression expectations.

### F2 — Fix: malformed numeric totals are accepted

Source and criterion: brief done-criterion 3 explicitly requires a present malformed pressure file to stop creation or the ending call before push/state change, naming the path and error. Plan D2 requires an integer `total=`. The injected pressure-directory boundary is the design's designated proof surface for that outcome. No claim is made that Linux normally emits decimals.

`src/attempts.ts:19` matches a digit prefix rather than the complete total token. A `some ... total=12.5` line becomes integer 12 at `:21`. The line is malformed under D2, but creation proceeds and a checked ending can push and append pressure using the truncated number.

Verification: in the detached checkout, restore unchanged `src/next.ts`; change the three `cpu: 'abc'` fixture inputs in `tests/merge-attempts.test.ts` to `cpu: '12.5'`. In the malformed ending test, first perform the ordinary successful `--check` call so the push is eligible. Run `bun test tests/merge-attempts.test.ts --timeout=30000 -t 'malformed pressure file'`: exit 1, **0 pass, 2 fail, 18 filtered**. Both fail at `expect(merged.code).not.toBe(0)` because creation and ending return 0. Without the added check, ending instead fails later with `Untested top`, without naming the pressure path, which also violates the required error contract.

Required repair: parse the whole integer total token and reject a malformed suffix before returning a snapshot. Add a regression at the actual creation/eligible-ending boundary proving the path-naming refusal and unchanged batch/remote/attempt log.

## Other verification

- Read brief, design, plan, implementation report, changed code/tests and the affected files/state guide pages. Debate is off, so positions/rebuttal artifacts are absent as expected. No peer review read.
- Reviewed all seven changed paths. No AREA.md changed, so the changed-AREA path-listing rule does not apply.
- Linux PSI documentation confirms `some` totals are cumulative stall microseconds: https://cdn.kernel.org/doc/html/latest/accounting/psi.html. Live source threading covers all append sites, lazy reads for old batches, reboot omission and batch spreads. The field documentation matches those behaviors.
- Unchanged head: `bun test tests/merge-attempts.test.ts --timeout=30000` exited 0: 20 pass, 0 fail, 131 assertions, 3.72 seconds.
- Blocking checks reuse report evidence: format and typecheck passed, full test run 658 pass/0 fail, changed test run 533 pass/0 fail. No production code changed during review. The specific concerns above justified the focused proof runs only.
- Installed detached-checkout dependencies with `bun install --frozen-lockfile`, exit 0. Both probes were confined to that checkout. Removed it with `git worktree remove --force`; the review worktree is clean and remains at the reviewed head. No review commits.
- No operator actions or Nits.

## Test-Change trailers

Target at review: base `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`.

`333f6453a07cec3dc659a1b44c565cde833dd4ed`:

> Test-Change: tests/merge-attempts.test.ts added PSI criterion cases; no existing expectation changed

`src/test-files.ts` matches the path. The diff adds helpers and cases without changing or deleting existing assertions, fixtures or recorded output. The trailer accurately describes that additive change. No other test trailers or old test-file changes occur in the reviewed range.

## 2026-10-10 check.repair

Repair head: `f511ca791ce599ace39e694e4e68191b8b9def83`.
Read both initial reviews for `333f645`. All doable Fixes repaired. No operator actions, Handed to A items or retained B Nits.

### F2 repaired

- Test commit `7f768d6`: adds decimal-total regressions at actual creation and eligible-ending boundaries. Existing regression expectations remain untouched. Trailer cites F2 and brief criterion 3.
- Before fix: `bun test tests/merge-attempts.test.ts --timeout=30000 -t 'decimal pressure total'` exited 1, 0 pass/2 fail/20 filtered. Both tests failed at `expect(merged.code).not.toBe(0)` because the malformed total was accepted and both commands returned 0.
- Fix commit `724e3f8`: require token boundaries around the entire integer total. Decimal suffixes cannot be partially parsed. This changes one expression in `src/attempts.ts`.
- After fix: same command exited 0, 2 pass/0 fail/20 filtered, 13 assertions, 217 milliseconds. Both regressions assert the path and parse error, unchanged state, unchanged remote tip and no attempt line.

### F1 repaired

- Test-only repair commit `f511ca7`: adds a successful command-created batch with a carried member, asserts the saved original PSI snapshot, checks it, advances remote code to force `rerun`, checks again, then advances record-only content to force `reuse`. Original counters are asserted after both restacks. Final landing produces exactly one reuse line with deltas `{ cpu: 10, memory: 20, io: 40 }`. Trailer cites F1 and brief criterion 1.
- Existing creation/storage implementation was correct. This missing-test Fix needs no production-code repair commit.
- Deliberate failure: temporarily changed only `pressure_start: start,` in `src/next.ts` to `pressure_start: undefined,`. `bun test tests/merge-attempts.test.ts --timeout=30000 -t 'a created batch preserves PSI'` exited 1, 0 pass/1 fail/22 filtered. The saved-snapshot assertion received `undefined` instead of the original counters and boot id.
- Restored the original expression before committing. Same command exited 0, 1 pass/0 fail/22 filtered, 17 assertions, 487 milliseconds.

### Final criterion proof and blocking checks

All final runs completed with exit 0 on the repair head:

- C1: full suite includes all six ending outcomes, reconciliation and the new creation → rerun → reuse case with original counters and exact final deltas.
- C2: existing old-batch/malformed-directory, absent-directory and reboot tests pass, each retaining the no-pressure permitted behavior.
- C3: existing malformed-file cases and new decimal-total creation/eligible-ending regressions pass. Native read errors still propagate before mutation.
- C4: manually checked `docs/guide/files.md` pressure unit/absence description and `src/attempts.ts` optional non-negative integer line schema. Full suite's docs-links test passed. No documentation behavior changed in repair.
- C5: `bun run format` exited 0. It rewrote pre-existing formatting drift in `src/status.ts`; only that formatter-created unrelated change was restored. Both repair files were unchanged by the format run.
- `bun run typecheck` exited 0.
- `bun test --timeout=30000` exited 0: **661 pass, 0 fail**, 7132 assertions, 33 files, 76.36 seconds.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` exited 0: **536 pass, 0 fail**, 4958 assertions, 18 files, 71.50 seconds. Base remains `1d7d536100aebc183bd22f63b7c3ba31d5d07ea5`.
- `git diff --check 333f645..HEAD` exited 0. Worktree clean. Temporary deliberate break removed. No temporary scripts/helpers added outside the existing test-fixture cleanup. No merge checks run.

No Handed to A items. Requesting merge.

## 2026-10-10 merge

Attempt: `cd0f94e9-286a-489c-984d-ec83aa34a58c`.
Applied top: `5356df31d46384164b0900afcd70720f6de59b31`.
Refreshed base: `2d9becac4365ec4a1079853364d561d90e356b5e`.
Holder-only batch, no carried members. HEAD equals the requested recorded top.

`git range-diff 1d7d536..f511ca7 2d9beca..5356df3` shows all five commits unchanged in content: b3d77fe→36eb9ff, 333f645→7ae11ee, 7f768d6→9dcbf7e, 724e3f8→251628f, f511ca7→5356df3. No fetch, rebase or commits performed by this merge seat.

Blocking checks, all exit 0 on the applied top:

- `bun run format`: passed. Restored only the command-created pre-existing src/status.ts formatting drift. Scoped code/tests were unchanged.
- `bun run typecheck`: passed.
- `bun test --timeout=30000`: 662 pass, 0 fail, 7133 assertions, 33 files, 65.70 seconds. Log: `/tmp/akrogon-1000/merge-attempt-pressu-38a2bebb42f3/tmp.FBcggDTMBA`.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`, with refreshed base above: 536 pass, 0 fail, 4958 assertions, 18 files, 61.37 seconds. Log: `/tmp/akrogon-1000/merge-attempt-pressu-38a2bebb42f3/tmp.EjG7eTcKhq`.

merge_covers, merge_checks and advisory are empty. Worktree clean. Completion owner is standalone issue `merge-load-flakes`; read its ISSUE.md and its only leaf brief. Its shipped outcome is host-wide processor, memory and disk stall measurement across every new merge attempt, preserved through restacks, with safe omission on old batches/absent support/reboot and refusal on malformed readings.

Merge result: `akrogon phase merge-attempt-pressure merged --slot B --check --attempt cd0f94e9-286a-489c-984d-ec83aa34a58c` exited 0, `ok`. Final phase call exited 0 and printed `moved merged` then `issue complete merge-load-flakes`. `git ls-remote origin refs/heads/main` confirms the remote head is `5356df31d46384164b0900afcd70720f6de59b31`. Owner records moved to `issues/closed/merge-load-flakes`. No push refusal or restack occurred.
