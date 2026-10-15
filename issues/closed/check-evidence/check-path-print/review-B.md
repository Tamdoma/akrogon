# Review B

Base: f3557d8dc8a74459eefcc63dacb419332df1659e
Reviewed head: e6350fc544616d8f39ceb7c117a8e5460c2c1bda
Phase: check.review
Verdict: fix

## Findings

F1 (Fix): Direct implementation omits the absolute chart log holder.

Source: the real `implement-issue direct chart=<chart-folder> worktree=<path>` workflow described at skills/implement-issue/SKILL.md:98-100. The added Shared context rule at line 27 prescribes `akrogon run-check --name <label> -- <cmd>`, but neither it nor Direct form supplies `--holder <absolute chart>/direct`. Direct form delegates behavior to Standalone, which is expressly outside the rule, so it also fails to establish the direct-route exception.

Consequence today: A following these instructions in a chart worktree without a matching leaf cannot keep criterion-test output using the prescribed invocation. src/run-check.ts:105-125 traces worktree lookup, worker lookup, and then throws `No leaf worktree matches cwd; pass --leaf or --holder` when the omitted holder is undefined. B's standalone review paragraph includes the holder, but is not A's implementation instruction.

Contract: brief done-criterion 2 explicitly requires the absolute `<chart>/direct` holder on the direct route. Design item 8 and plan D3 assign that requirement to implement-issue as well as check-issue. Add the holder instruction and make clear that direct implementation follows the keeping rule. The existing skills test checks the holder only in check-issue, so its green result misses this required implementation outcome. The existing text-file reader in tests/run-units.test.ts can exercise the missing implement-issue command reference without new machinery.

## Verification evidence

Reviewed the complete diff, runCheck/checkedRun and both verify call sites, the plan, brief, design and report. No debate artifacts exist, as expected for debate: no. No AREA.md changed. Opened docs/reference-index.md, the linked source/test/skill areas, and docs/guide/setup.md describing run-check's admission/output surface. Its existing admission claim remains true. The six skill files are the documentation changed by this leaf.

Criterion 1 is implemented at the CLI wrapper, preserves the command exit code, emits the absolute saved path after output and separates unterminated stderr. checkedRun's verify callers ignore the added field. Empty stderr gets a blank line, consistent with the locked design's last-byte rule.

Existing current-head evidence is sufficient, so no checks were repeated:

- `akrogon run-check --name check-path-print -- bun test tests/run-check.test.ts` is reported with check-names included; implementation/check-check-path-print-1792097814341-348978.log confirms 20 pass, 0 fail and the new boundary case passing.
- The planned skills proof was run filtered to the new case on 6e07fdc, before the source-only formatting commit. implementation/check-check-path-print-skills-1792097505126-2683084.log confirms 1 pass, 0 fail. The current-head full test run also includes this case, so no current-test evidence is missing.
- Receipt c1cae20b-619d-4d29-992c-50a28519d7e7 in issues/verify-runs.jsonl records e6350fc and tree 55bf626a16fd15275f8a0e20b3e9cfebd1252d09: setup, format, test and typecheck exit 0. implementation/check-test-1792097936335-365849.log confirms 847 pass, 0 fail, including both added cases. The earlier format failure was corrected and rerun green.
- Planning red logs implementation/check-check-path-print-1792097348964-2049735.log and implementation/check-check-path-print-skills-1792097350843-2055571.log show each added test red for missing behavior before implementation. This supplies red-before/green-after evidence.

All log paths above are relative to this leaf.

## Test-Change trailers

- a998331: `Test-Change: tests/run-check.test.ts added run-check prints check name, exit and kept path on its own stderr line; no existing expectation changed`
- a998331: `Test-Change: tests/run-units.test.ts added skills name the run-check keeping rule, its log reader and its exemptions; no existing expectation changed`
- 3830dda: `Test-Change: tests/check-names.test.ts stderr expectation gained the check line, real output showed 'check two words: 0 <path>'`
- 3830dda: `Test-Change: tests/run-check.test.ts stderr expectation gained the check line, real output showed 'check probe: 0 <path>'`

All three paths match src/test-files.ts. The additions change no existing expectations. The two anchor changes match brief criterion 1's required new stderr line and preserve the admission-line assertions. Their cited outputs are consistent with the product diff and retained failure/pass evidence. No planned tests or runner configuration were skipped or disabled by the diff.

## Operator actions

None.

## 2026-10-15 check.repair

Starting head: e6350fc544616d8f39ceb7c117a8e5460c2c1bda.
Repair head: 1408815875eb9a9bbca258402227bcb2ed49f25e.

F1 documentation repaired in commit 1408815 (`docs: specify the direct implementation log holder`). Before: Direct form specified only `<chart-folder>/direct/plan.md` and `<chart-folder>/direct/report.md`, then delegated to Standalone, with no run-check holder. After: `Direct implementation follows the Shared context command-output keeping rule with the absolute <chart>/direct path as holder: akrogon run-check --holder <chart>/direct --name <label> -- <cmd> keeps logs there.` This supplies the missing invocation and establishes the direct-route exception to standalone's exclusion. No code or test changed.

The existing planned proof, written before this repair by A, passes on the repaired head: `akrogon run-check --name check-path-print-skills -- sh -c 'flock "$(git rev-parse --git-path akrogon-install.lock)" sh -c "bun install --frozen-lockfile" && bun test tests/run-units.test.ts'`, exit 0, 12 pass, 0 fail. Log: implementation/check-check-path-print-skills-1792098051809-1431697.log. This reruns the full planned test file with the mandatory setup. Criterion 1 inputs are unchanged, so its earlier green evidence remains applicable.

### Handed to A

F1, criterion 2 proof: add the missing implement-issue direct-holder command-reference case using the existing skills test and readFileSync in tests/run-units.test.ts. Currently only check-issue's holder is checked. Show that case red with the holder instruction deliberately removed and green with it restored. This is a missing criterion case on existing tools, assigned to A by the check.repair split, rather than a product-bug reproduction B may write. No new proof machinery is needed.

No operator actions. No reusable Nits held by B. A's sibling log-reader note remains within the design's explicitly separate leaf and requires no repair here.

`akrogon verify` on committed repair head 1408815875eb9a9bbca258402227bcb2ed49f25e: green. Setup, format, test (847 pass, 0 fail) and typecheck all exit 0. Current logs: implementation/check-format-1792098053615-1486410.log and implementation/check-typecheck-1792098172972-1486410.log, with the test log recorded in issues/verify-runs.jsonl for this head. No merge_checks run. Worktree clean after the documentation commit. Outcome: documentation repaired, criterion 2's missing case handed to A; request check.fix.

## 2026-10-15 check.review after check.fix

Prior reviewed base: f3557d8dc8a74459eefcc63dacb419332df1659e.
Prior reviewed head: e6350fc544616d8f39ceb7c117a8e5460c2c1bda.
Handed-off base: dace0f7ae802db734890e43e2860a46a80d1653d.
Reviewed head: 0a80ab91e9388e60ce148f500fa92eb9859e1aeb.
Verdict: ready.

Computed `git range-diff f3557d8dc8a74459eefcc63dacb419332df1659e..e6350fc544616d8f39ceb7c117a8e5460c2c1bda dace0f7ae802db734890e43e2860a46a80d1653d..0a80ab91e9388e60ce148f500fa92eb9859e1aeb`. All four original commits are unchanged across the refresh. Only 8c65522 (B's holder instruction, rebased from 1408815) and 0a80ab9 (A's missing assertion) are added. Reviewed those two commits as repair, excluding main's commits.

F1 resolved: the live Direct form section explicitly applies the keeping rule and supplies `akrogon run-check --holder <chart>/direct --name <label> -- <cmd>`, with the holder required to be absolute. A's added assertion checks the literal command option and fixed holder reference in implement-issue. It changes no prior expectation. This completes the missing criterion 2 case on existing machinery and introduces no defect. No AREA.md or other documentation changed in this repair.

New Test-Change trailer in 0a80ab9: `Test-Change: tests/run-units.test.ts added 'implement-issue names the direct-route holder' case shown red against a deliberate break of the holder line, per brief done-criterion 2's <chart>/direct holder requirement`. Accepted: the path matches src/test-files.ts, the added command-reference assertion matches criterion 2 and the handed-off case, and the cited deliberate-break evidence exists. Earlier trailers remain as reviewed, with unchanged commits confirmed by range-diff.

Evidence, relative to this leaf:

- implementation/check-check-path-print-skills-1792098229900-2359377.log: 1 fail, specifically `implement-issue names the direct-route holder`, expecting `--holder <chart>/direct`, with the holder instruction deliberately removed.
- implementation/check-check-path-print-skills-1792098246832-2455879.log: restored instruction, 1 pass, 0 fail, 39 assertions in the targeted skill case after the test change.
- Current-head receipt e00a48e8-fbed-479f-9030-73d83ba52410 in issues/verify-runs.jsonl records tree 88e61c62c936c0e12a00115a3a613c083e57e6be and setup, format, test and typecheck exit 0. implementation/check-test-1792098375618-2477433.log confirms 850 pass, 0 fail. This full run includes the updated test after its final change and retains the planned unfiltered suite coverage.

No checks rerun: current evidence covers the repair and no unresolved concern requires another run. Working tree clean and diff whitespace check passes. No open Fixes, Handed-to-A items, operator actions or reusable Nits held by B. Request merge.

## 2026-10-15 merge

Attempt: 4937ec4c-56e9-4a90-aeb2-7cd737646822. Recorded and tested top: 0a80ab91e9388e60ce148f500fa92eb9859e1aeb. Worktree clean; no fetch, rebase or code change needed.

`akrogon verify --attempt 4937ec4c-56e9-4a90-aeb2-7cd737646822` exited 0 and printed `reuse receipt e00a48e8-fbed-479f-9030-73d83ba52410 tree=88e61c62c936c0e12a00115a3a613c083e57e6be`. The identical-tree receipt covers setup, format, test (850 pass, 0 fail) and typecheck, all exit 0; merge_checks and advisory are empty. Proceed to merged --check and the command-owned push.

`akrogon phase check-path-print merged --slot B --check --attempt 4937ec4c-56e9-4a90-aeb2-7cd737646822` exited 0 (`ok`). The final `merged` call with the same attempt exited 0 and printed `moved merged` and `deployed dace0f7ae802..0a80ab91e938`. No issue/epic completion line was printed, so no completion broadcast is due. Final result: merged and deployed.
