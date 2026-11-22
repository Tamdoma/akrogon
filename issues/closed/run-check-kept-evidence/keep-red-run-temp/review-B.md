# Review B · check.review · 2026-11-20

Base `5daa962e1c4ef03a80f0209a5c5520145f57ab61`. Reviewed head `96589baf0a7cf4fa82826b11947dc4b71d2afbf7`. Verdict `fix`.

## Fixes

- **F1. Document the TMPDIR lifetime for publish refusals.** [checks.md](../../../../docs/reference/checks.md) at line 50 and `src/AREA.md:5` say publish refusals remove TMPDIR. When a leaf owner moves before the check acquires its lock, `refusePublish` keeps `out.log` and `refusal.json` in the run root, and the CLI names the evidence path. The C1 refusal case in `tests/run-check.test.ts:104` exercises that owner move. A reader following the new sentence gets the wrong lifetime for the evidence they need to inspect. Both sentences also promise a marker for any nonzero exit, including a command that deleted its TMPDIR. Describe marking a surviving TMPDIR on a completed red run and preserve the documented refusal behavior. This affects C1, C5 and C6.
- **F2. Make the C5 run-check test detect a leftover run root.** `tests/run-check.test.ts:316` uses `scratchRuns` at line 91, which looks for `<leaf-temp>/<entry>/run-*`. The real path is `<leaf-temp>/<repo-hash>/<leaf-hash>/run-*` from `leafTemp` in `src/config.ts:368`. The C1 fixture log `implementation/check-c1-run-check-proofs-1795174089253-3793748.log` already records this mismatch. In a detached copy of the reviewed head, a deliberate break recreated the deleted directory while preserving exit 7. The C5 run-check case passed, while the verify case caught the extra directory with its depth-correct glob. Fix the run-check assertion and show that the same break makes it fail. This closes the missing proof for C5 at the run-check boundary. The product passed both C5 cases on the reviewed head.

## Verification

- Verify receipt `8264c4d8-3fbe-4cb4-884d-21cceb2667bb` matches the reviewed head. Format, typecheck and the full configured test command passed, with 1,230 tests passing in `implementation/check-test-1795174359560-3870405.log`. That run includes each planned case after the test corrections and last format commit.
- C1/C2 before and after logs show a missing marker on base and readable marked evidence with green-run cleanup on the current implementation. The C1 refusal check and the C4 dead/live owner check passed. `run in progress` is a literal reason consumed by `src/leftovers.ts:15`.
- C3 fails before the change at dead-root retention and passes on head. The focused probe in `implementation/check-review-b-proof-sensitivity-1795174496415-46994.log` removed only the `ownerKeeps` marker check in a detached worktree and reproduced failure at leaf temp release. With the guard present, the focused case passes. The same log records the C5 test gap above. The detached worktree was removed.
- C6 lifetime lines are present at `docs/reference/checks.md:50` and `src/AREA.md:5,22`. The live path listing for `src/AREA.md` found all named code and documentation files. Its `issues/` paths, including `issues/closed`, `issues/timings.jsonl` and `issues/verify-runs.jsonl`, resolve in the registered checkout, where the lifecycle writes them.
- All 25 check starts have matching timing ends and kept logs. No grant-covered activity was planned or launched.

## Test-Change trailers

All six trailers in `5daa962e..96589baf` match old test files under `src/test-files.ts`. The cited changes are authorized as follows.

| Commit | File | Source and judgment |
| --- | --- | --- |
| `0702dc70` | `tests/run-check.test.ts` | C1 and the locked design replace red-run deletion with retention, preserve green cleanup and keep refusals unmarked. |
| `0702dc70` | `tests/verify.test.ts` | C2 and C5 replace the red-run deletion expectation, preserve green cleanup and add the deleted-TMPDIR case. |
| `0702dc70` | `tests/reconcile.test.ts` | C3 adds marked-root retention and release. C4 names the kept reason that the leftovers reader consumes. |
| `5c983c83` | `tests/run-check.test.ts` | `implementation/check-c1-run-check-proofs-1795174089253-3793748.log` shows the actual root was one level deeper than the old helper searched. This supports correcting the red-retention assertion. The C5 use of the old helper still needs F2. |
| `5c983c83` | `tests/reconcile.test.ts` | `implementation/check-c3-c4-reconcile-proofs-1795174112799-3798921.log` shows the earlier release assertion failed after `next --all`. Targeted dispatch excludes the closed-tab leaf, so reconcile can exercise release without reopening it. The current C3 pass and single-guard deliberate break confirm the observed behavior. |
| `96589baf` | `tests/verify.test.ts` | The diff and format result show a Prettier reflow of the same map expression. Every assertion is unchanged and the full check reran afterward. |

## check.repair · 2026-11-20

- **F1 repaired** in `ad90984f9adffaa4934a94144bbf3f327da12436`. Both initial reviews identified the same documentation defect. Before, both lines claimed that “zero exits, publish refusals and thrown errors remove it.” Both now say that a publish refusal after run root creation keeps `refusal.json` and `out.log`, and that a published nonzero exit marks a surviving TMPDIR until leaf temp release or the holder idle sweep. The reconciliation lifetime at `src/AREA.md:22` agrees.
- Ran the planned C6 grep and read both lines against `checkedRun`. `check repair-b-c6-docs: 0 implementation/check-repair-b-c6-docs-1795174681524-101196.log`. `git diff --check 96589baf..ad90984f` passed. The diff contains only the two documentation lines, so the code and test inputs for C1–C5 still match the reviewed head. C5's run-check proof remains open as F2.

## Handed to A

- **F2** is a correction to an existing test assertion. Use the existing `bun test` run-check proof for C5 in `tests/run-check.test.ts` to observe that the command's actual run root is gone. The current helper skips the repo-hash/leaf-hash depth proved by the C1 fixture and the verify case. Show the corrected case fails when a deliberate break recreates the root while preserving exit 7, then passes with the break removed. See `implementation/check-review-b-proof-sensitivity-1795174496415-46994.log`.

## Re-check after check.fix · 2026-11-20

Base `5daa962e1c4ef03a80f0209a5c5520145f57ab61`. Prior reviewed head `96589baf0a7cf4fa82826b11947dc4b71d2afbf7`. Reviewed head `4defba1e7d8ef20df3b2ce6b039fd598b33ea0fc`. Verdict `ready`.

- The range-diff after A's refresh shows the original four commits unchanged and only `ad90984f` and `4defba1e` added. `check review-b-repair-range: 0 implementation/check-review-b-repair-range-1795174843540-400861.log`.
- **F1 closed.** Both docs describe a surviving TMPDIR being marked after a published red exit, a publish refusal keeping `refusal.json` and `out.log`, and the leaf and holder lifetimes. The C6 log and live AREA path check agree. The lifecycle paths resolve in the registered checkout.
- **F2 closed.** The C5 assertion now scans `*/*/run-*` under the fixture temp root. With exit 7 preserved, the recreated root caused the corrected assertion to fail in `implementation/check-c5-gone-break-1795174734664-113446.log`. The case passed after the deliberate break was removed in `implementation/check-c5-gone-green-1795174742021-115984.log`. The planned C1/C5 rerun passed all four cases in `implementation/check-c1-run-check-proofs-1795174744959-116576.log`.
- The `4defba1e` trailer for `tests/run-check.test.ts` matches the old test-file rule and cites F2 and the deliberate-break log. The runner and expected exit are unchanged. The test diff corrects only how the absence of the run root is observed.
- Verify receipt `cbccd26b-de3e-48d0-994d-ad24abd36d9f` matches the reviewed head. Format and typecheck passed. The full configured test command passed all 1,230 tests, including the planned cases, in `implementation/check-test-1795174810792-117453.log`. All 34 check starts match timing ends and kept logs. No grant-covered activity was launched.

No new findings.
