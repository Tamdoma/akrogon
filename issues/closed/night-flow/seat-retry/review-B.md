# Review B: seat-retry

Date: 2026-10-11
Phase: check.review (initial, blind)
Base: `c53f6196533289555518577f08907ec9c713721c`
Reviewed head: `eea52234d9de019599969b8bf1b3e0aae3a17f62`
Verdict: **ready**

## Findings

No Fixes, Nits, or operator actions.

Read the brief, plan, design, implementation report, reference index, affected guide pages, and live dispatch, state, status, session-file, Herdr boundary and fixture code. Debate is off, so no B position or rebuttal exists. Reviewed all six changed files. No AREA.md changed or was deleted. No peer review was read.

## Criteria and verification

1. Retryable start and prompt faults: both failure call sites now use the same recordFailure path, which saves the error and increments the slot count without moving phase. CLI tests exercise three failing passes followed by successful delivery, including the merge holder and idle-hook paths.
2. Non-retryable faults: start and prompt no longer branch on retryable. The existing error parser still preserves structured codes and maps malformed/non-JSON stderr to exit codes. CLI tests verify recording, another failing retry, and continued sibling dispatch.
3. Recovery: recordDelivery is unchanged and clears delivery_error and resets attempts. Successful retries and late delivery in the same session pass their existing tests.
4. Status and documentation: the status boundary test verifies the slot, code and attempt count while preserving the existing busy-seat display rule. next.md explicitly says faults retry on the next pass and never fail the leaf. limits.md and problems.md remove the old automatic-failure claims. state.md distinguishes delivery errors from seat blockers without claiming an automatic failed move; in-practice.md concerns recovery of other failures. The unchanged reference and area descriptions still match the live behavior.
5. Session binding: pending-offset reconciliation requires a present current session whose value equals the error's recorded session. Missing or different sessions skip the old-offset read. The replacement-session CLI test puts matching prompt text in the new file, observes a second prompt attempt, and retains the second timeout error at attempts 2. Same-session late-delivery reconciliation remains green.

The tests invoke the real CLI and replace Herdr at its external boundary, rather than mocking dispatchSlot. The plan records fail-before output on the base implementation for the changed outcomes and session binding. Restoring the removed cap/unreachable paths or omitting the session equality restores those failures. Existing test expectations were changed only where the brief directly replaces the old failed-move outcome. No planned test or runner was skipped, filtered or disabled by the diff.

Implementation report evidence: full `bun test --timeout=30000` (794 pass, 0 fail), changed tests (389 pass, 0 fail), typecheck clean, formatting applied and committed, and docs-links (4 pass, 0 fail). The final commit only reflows the already-reviewed test changes.

B closed the missing explicit targeted-command evidence:

- Setup: `flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c 'bun install --frozen-lockfile'` exited 0, no dependency changes.
- `bun test tests/next.test.ts tests/status.test.ts` exited 0: **266 pass, 0 fail, 2489 assertions**, 35.58 s. Full output: `implementation/review-B-targeted.log`.
- Final HEAD still equals the reviewed head and `git status --short` is empty.

No red checks or comparison records. No live mutations or credentials were needed. No reusable Nit remains to record as a lesson.

## Test-Change trailers

All trailers in `c53f6196533289555518577f08907ec9c713721c..HEAD`:

- `f2fba96`: `Test-Change: tests/next.test.ts brief: delivery faults never move the leaf to failed; rewritten five cases from failed expectations, added session-mismatch resend and start-failure cases`
- `f2fba96`: `Test-Change: tests/status.test.ts added attempt counts to the delivery-error note case, no existing expectation changed`
- `e928b94`: `Test-Change: tests/next.test.ts brief: delivery faults never move the leaf to failed; corrected three merge-order expectations the planning sweep missed, same scenario new outcome`
- `eea5223`: `Test-Change: tests/next.test.ts formatting-only reflow of e928b94's lines, no expectation changed`

Both paths match src/test-files.ts. The brief's retry-without-failure criteria justify the next.test.ts expectation changes, including keeping a faulted merge holder ahead of its waiter. The status diff adds count assertions and preserves its previous expectations. The final formatting trailer matches its formatting-only diff. Accepted.

## check.repair — 2026-10-11

Read both reviews for head `eea52234d9de019599969b8bf1b3e0aae3a17f62`. A's F1 was the only Fix. B's initial documentation review missed the remaining prompt sentence in the failed-leaf recovery example.

F1 repaired in its own commit `1b5d68a197bcc3bbac067038abb571f66c7fb792` (`docs: remove prompt delivery from failed-leaf recovery causes`). The real operator recovery example under “Failure is a recorded stop” no longer suggests diagnosing a prompt fault as the cause of a failed leaf. No product code or tests changed.

Before at docs/guide/problems.md:78:

> For CSV export, missing permission may need an operator action. Broken quoting needs code repair. A failed prompt needs delivery diagnosis. Repeating the same recovery without new evidence does not resolve any of those causes.

After:

> For CSV export, missing permission may need an operator action. Broken quoting needs code repair. Repeating the same recovery without new evidence does not resolve any of those causes.

The repair diff contains only this deletion. next.md:133 still explicitly states retry on the next pass and no failed move, and limits.md:36 describes recording and retry. No handoff to A or operator action remains. A's N1/N2 describe the accepted design and existing display behavior, and N3 has no unsafe runtime path. B holds no reusable Nit requiring a lesson entry.

All configured checks ran from the leaf worktree on repaired head `1b5d68a197bcc3bbac067038abb571f66c7fb792`, with `AKROGON_BASE=c53f6196533289555518577f08907ec9c713721c` for test/test_changed/typecheck. Every wrapper ran frozen dependency setup under akrogon-install.lock and `akrogon guard own-modules` before its inner command:

| Configured check | Inner command | Exit / result | Log |
| --- | --- | --- | --- |
| format | `bun run format` | 0, all files unchanged | implementation/repair-B-format.log |
| typecheck | `bun run typecheck` | 0, no diagnostics | implementation/repair-B-typecheck.log |
| test_changed | `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` | 0, 389 pass / 0 fail | implementation/repair-B-test_changed.log |
| test | `bun test --timeout=30000` | 0, 794 pass / 0 fail, 8142 assertions | implementation/repair-B-test.log |

The full suite re-ran all five criteria's boundary proofs in next.test.ts and status.test.ts, including repeated start/prompt faults, non-retryable faults, successful reset, same-session late delivery, replacement-session resend and status slot/code/count. It also ran all four docs-links cases successfully. No skipped or filtered planned tests. No red checks or comparison records, and no merge_checks were run. Final worktree status is clean and HEAD equals the repair commit.

All Fixes are resolved. Destination: merge.

## merge — 2026-10-11, solo attempt 9a7a6dbe-b3c8-4e3a-9946-89c4ed0e3122

Fetched origin and rebased onto `origin/main` at `9cd0c7ece7ce941fc3ab4cca9aa18c4f4add9e73`. Prior reviewed/repaired head: `1b5d68a197bcc3bbac067038abb571f66c7fb792`, old base: `c53f6196533289555518577f08907ec9c713721c`. Resolved head: `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`.

One conflict in the three-consecutive-prompt-failures test: main allowed reconciliation pane-list calls after the old failed move, while this leaf expects successful fourth-pass retry and error/count reset. Kept the leaf assertions because brief criteria 1 and 3 explicitly replace the failed outcome. Main's per-pass reconciler code and all other tests remain intact. The replayed test commit retains its Test-Change trailer citing the brief.

Recorded `git range-diff c53f6196533289555518577f08907ec9c713721c..1b5d68a197bcc3bbac067038abb571f66c7fb792 9cd0c7ece7ce941fc3ab4cca9aa18c4f4add9e73..22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192` in `implementation/merge-B-range-diff.log` before checking. The installed retired-lesson removal helper returned `none`. Refreshed AKROGON_BASE from config to the rebase target. No grants or env values needed.

All four configured checks passed on the resolved head with the refreshed base. Each ran its configured `akrogon run-check --name <name> -- sh -c <body>` wrapper, with frozen setup under akrogon-install.lock and own-modules guard, then the inner command below. No merge_covers, merge_checks or advisory commands are configured.

| Check | Inner command | Result | Log |
| --- | --- | --- | --- |
| format | `bun run format` | exit 0, unchanged files | implementation/merge-B-format.log |
| typecheck | `bun run typecheck` | exit 0, no diagnostics | implementation/merge-B-typecheck.log |
| test_changed | `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000` | exit 0, 390 pass / 0 fail | implementation/merge-B-test_changed.log |
| test | `bun test --timeout=30000` | exit 0, 816 pass / 0 fail, 8257 assertions | implementation/merge-B-test.log |

Final status is clean and HEAD remains `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`. Read night-flow/ISSUE.md and all eight leaf briefs for completion context. Other night-flow leaves remain open, so this solo landing is not expected to complete the issue. No red comparisons or repair handoff required.

### Merge finalization defect and handoff

`akrogon phase seat-retry merged --slot B --check --attempt 9a7a6dbe-b3c8-4e3a-9946-89c4ed0e3122` returned `ok`. The subsequent `akrogon phase seat-retry merged --slot B --attempt 9a7a6dbe-b3c8-4e3a-9946-89c4ed0e3122` exited 1 after pushing the tested head, with:

```text
error: Changed test files need a citation:
Test-Change: tests/next.test.ts <source and reason>
Add each line to the final trailer block of a commit on this branch; a later empty commit may carry it.
at requireFrozenCitations (src/phase.ts:529)
at transition (src/phase.ts:326)
at batchPush (src/phase.ts:661)
```

Read-back `git ls-remote origin refs/heads/main` confirmed main at `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`; leaf state remained merge, with batch candidate/tested_top at that head and recorded true. No completion line was printed.

Added trailer-only empty commit `bd61382` as the error requested, citing brief criteria 1 and 3 and the replacement of the old failed-leaf assertions. No file content changed. Before repeating any push, traced the post-push validation and found why another empty commit cannot solve finalization.

**F2 — batchPush validates frozen citations after advancing their comparison base.** Realistic source: this actual solo merge with a planned test file changed during implementation. `batchPush` pushes first (src/phase.ts:650-654), updating the shared origin/main ref, then calls `transition` (:661). `transition` calls `requireFrozenCitations` (:326) with its default base `target(repo)` (origin/main). With origin/main now equal to the pushed head, `lastTouch` and the empty-commit trailer range are empty even though tests/next.test.ts differs from the frozen planning blob. The validator therefore rejects this already-pushed, green-tested branch. Another trailer-only push advances that base again and repeats the same defect.

Consequence today: tested code is on main, but the leaf stays in merge and retains the merge turn. This is a live merge-finalization contract failure introduced/exposed by integrating the reviewed test changes, not a red check or an operator blocker. Fix forward in A's merge-origin check.fix: preserve a valid pre-push citation range or validated citation evidence through finalization, with a boundary regression reproducing a changed frozen test file's successful push and merged phase. The regression must cover actual post-push ref advancement. Do not remove the citation protection or manually edit state/refs.

Repair head to hand off: trailer-only `bd61382` on tested product head `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`. The preceding green commands and logs remain listed above. No second push or test rerun occurred after the empty commit because tracing proved the finalization defect. No broadcast was due.

## Re-check after check.fix — 2026-10-11

Repair baseline: `bd613821b4325d54d89205da5420121e1a0d9466`, on integration base `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`.
Reviewed repair head: `9dd392435b99cf16b244becfb86b68d14a09c111`.
Verdict: **ready**.

Reviewed only `bd61382..9dd3924`: new boundary reproduction in tests/phase.test.ts and the phase.ts fix. Computed `git range-diff 22ede6c..bd61382 22ede6c..9dd3924`: the existing trailer-only commit is unchanged, with only the reproduction and repair added. No rebase or unrelated main changes in this repair.

F2 resolved. transition threads an explicit comparison base through the existing issue-file, test-trailer and frozen-test validators. batchPush and finishPush both supply the saved batch built_on rather than the origin/main ref advanced by the push. Other phase moves retain their existing default base. The repair retains all citation guards and covers successful push and landed-push verification paths. The new test drives real CLI check/push/finalization against the fixture Git remote, freezes a test blob, cites its subsequent change, and asserts both closed/merged state and origin/main at the pushed head. It does not mock the unit under test.

The report records red-before output matching this leaf's actual F2, green-after boundary proof, and the original rejected command with its arguments and replay result. The exact replay from check.fix is correctly reported as routing-refused (`Illegal move check.fix -> merged`), with the green boundary test driving the merge-state path instead. For precision, the actual rejected integration run used base `9cd0c7ece7ce941fc3ab4cca9aa18c4f4add9e73` and head `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`, as this review's merge entry records; the report also lists the earlier pre-rebase c53f619/1b5d68a references. Repair proof uses base 22ede6c and head 9dd3924. The evidence is complete enough to trace and reproduce the defect.

Report proof: phase suite 67/0, changed tests 803/0, full suite 817/0, typecheck and format clean. B independently ran frozen setup under the install lock, then `bun test tests/phase.test.ts -t 'a solo merge push keeps citations valid when the remote ref advanced' --timeout=30000`: exit 0, 1 pass, 0 fail, 4 assertions (`implementation/recheck-B-F2.log`). The 66 filtered tests are from this focused B probe, not A's full proof. `git diff --check bd61382..HEAD` passes, HEAD is unchanged and worktree clean.

Repair Test-Change trailer: `c995d48` names tests/phase.test.ts and cites this review's F2 live post-push error. This path matches src/test-files.ts. The diff adds a regression without changing existing expectations. Accepted.

Opened docs/guide/merge.md: no documented behavior changed, because the fix restores the documented push-and-move contract. No AREA.md or lesson removal in the repair. F1 remains resolved. No new Fixes, Nits or operator actions.

Merge execution note: the installed akrogon currently runs the registered checkout's CLI. If that checkout still lacks 9dd3924, execute the repaired worktree CLI (`bun src/akrogon.ts phase ...` with the same slot/check/attempt arguments) to finalize through the repaired guards. This runs the actual command with its checks intact and avoids repeating F2 before self-update deploys the fix.

## merge — 2026-10-11, attempt 36b72089-136e-46e2-9f21-22186bc3b0e8

Applied top and tested HEAD: `9dd392435b99cf16b244becfb86b68d14a09c111`. Batch built_on and refreshed AKROGON_BASE: `22ede6c12f7d3b3beb2c7dadeb1bc4aea81d6192`. No carried members. No fetch, rebase or code commits performed on the recorded top.

Ran all configured checks, each through its run-check wrapper with frozen dependency setup under akrogon-install.lock and own-modules guard:

- format (`bun run format`): exit 0, files unchanged; implementation/merge2-B-format.log.
- typecheck (`bun run typecheck`): exit 0, no diagnostics; implementation/merge2-B-typecheck.log.
- test_changed (`: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`): exit 0, 191 pass / 0 fail; implementation/merge2-B-test_changed.log.
- test (`bun test --timeout=30000`): exit 0, 817 pass / 0 fail, 8261 assertions; implementation/merge2-B-test.log.

No merge_covers, merge_checks or advisory commands configured. Worktree clean and HEAD unchanged after checks. Completion context remains night-flow/ISSUE.md and the eight leaf briefs previously gathered; other leaves remain open. Finalization uses this tested worktree's actual entry point, `bun src/akrogon.ts`, so F2's repaired validator executes before deployment of the fix.

`bun src/akrogon.ts phase seat-retry merged --slot B --check --attempt 36b72089-136e-46e2-9f21-22186bc3b0e8` returned `ok`. The corresponding final call without --check exited 0 and printed `moved merged`. Remote read-back confirmed main at `9dd392435b99cf16b244becfb86b68d14a09c111`; leaf state reads merged. No issue/epic completion line printed, so no broadcast was due.
