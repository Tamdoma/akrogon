# Review B: folder-pack

Verdict: fix.
Base: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307.
Reviewed head: d938256978a64074876a1ee8a953dcbedba92de1.
Initial blind review. Debate is off, so no positions/rebuttal artifacts apply. No code edits or commits made.

## Findings

### F1 — Fix: status advertises a single-chart pack that cannot succeed

Source: the existing single-chart layout, `issues/chart/CHART.md` with `issues/chart/direct/*.log`. `chartFolders` recognizes this layout, `unpackedLines` prints `akrogon pack issues/chart`, and `classify` expressly accepts it (plan D1).

Trace: `packFolder` receives `issues/chart/direct`, then calls `locate` for `issues/chart/direct/check-one.log`. The resolver interprets `direct` as the chart name and `check-one.log` as the direct-directory segment, so returns null. Every nonempty pack in this accepted layout fails with `Packed member fails to resolve`, leaving the plain log and `.closing`. Repeating cannot finish. This breaks D1, C1's accepted-chart pack/retry outcome and C5's actionable recovery instruction.

Concrete CLI proof, after the configured locked setup: `check review-B-single-chart: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-review-B-single-chart-1792103176125-4164250.log`, read back with `akrogon log`. Output: status names `Unpacked: issues/chart: run akrogon pack issues/chart`; pack exits 1 with `Packed member fails to resolve: check-one.log`; both marker and plain file remain. The fixture and temporary probe script were removed. This is the real supported status-to-command flow, not an arbitrary resolver input. Resolve the command/resolver contract for this accepted layout and prove the advertised command succeeds.

### F2 — Fix: C3's wrong-bytes refusal has no test

C3 explicitly requires a missing tracked log to be accepted only when its archived bytes equal the indexed bytes, otherwise refused, including newline and binary content. The tracked-log test covers an absent member and matching members, but never an existing member with different bytes. Removing the blob-oid comparison while retaining member-presence checking would pass every added test. The green C3 log therefore does not establish its byte-equality refusal outcome.

Add the missing existing-member/wrong-bytes CLI case for the criterion's newline and non-UTF-8 content, and record a current run plus the required deliberate-break evidence. This is a criterion-named verification gap, not a speculative product bug. Existing fixture/archive helpers can run it. Source: brief C3 and plan D3/C3; current test: tests/folder-pack.test.ts:119–165.

### F3 — Fix: the C6 test mechanically gates prose wording

The added tests/docs-links.test.ts case discovers instructions through the English words `append` and `then` and requires the command to appear in the same blank-line-delimited paragraph. Equivalent instructions such as “write the marker after packing” or a separate numbered packing step fail despite satisfying C6. Those words and paragraph boundaries do not execute.

This is the precise prose-format gate forbidden by check-issue's test-proof rule and the operator's Function over form rule. Review the instruction's meaning directly and remove the prose-shape assertion. Preserve command/marker literal contracts where useful without requiring an English phrasing or paragraph layout. C6's instruction is present at all three changed sites and is correct on this head. The concrete consequence today is an added required-suite constraint on valid skill instructions unrelated to the required behavior.

## Verification evidence

The recorded criterion commands match plan.md, with the planned filters and no disabled runner configuration. Read back all six final criterion logs with `akrogon log`: criterion-1 (1792102832346-2554092), criterion-2 (1792102834349-2556166), criterion-3 (1792102834611-2556353), criterion-4 (1792102836279-2559487), criterion-5 (1792102836524-2559664), criterion-6 (1792102836603-2559924), all exit 0 in this leaf's implementation directory. These runs follow the latest test/helper/fixture edits.

Receipt 0277b428-8a7e-4e47-bf16-e16608663ade verifies 311f32b3e504cebaf5ccaa4a9ffe6c918ff8f515: format 0, test 0 (897 pass, 0 fail), typecheck 0. Read back each receipt log. The reviewed head has exactly the same tree as that verified commit, confirmed by git diff --quiet 311f32b HEAD, so no full-suite rerun was needed. No merge checks ran.

Inspection evidence: `check review-B-inspect: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-review-B-inspect-1792103126076-4060324.log`; records/tree comparison: `check review-B-helper: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-review-B-helper-1792103160649-4123134.log`.

## Documentation and area pointers

Opened the behavior documentation in docs/guide/files.md, README's command table, changed chart skill instructions, docs/reference-index.md and both changed AREA.md files. The command row, chart-only direct scope and pack-before-marker instructions match the intended behavior. The single-chart recovery failure is F1.

Listed named paths from both changed AREA.md files from the worktree root in one command: `check review-B-area-list: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-review-B-area-list-1792103155214-4093584.log`. All named source/test/doc files exist, including the new pack module and test. Absent issues/timings.jsonl, issues/verify-runs.jsonl, issues/config.yaml and issues/merge-attempts.jsonl are authoritative/generated issue records omitted from this sparse code worktree, not newly broken pointers. No AREA.md deletion or lesson removal is in the diff.

## Test-Change trailers

- 37465ac: tests/status.test.ts — adds unpacked cases; tests/docs-links.test.ts — adds pack-ordering case; tests/command-reference.test.ts — adds pack argument contract. Each corresponds to C5, C6 or the new command. Existing expectations were unchanged in that commit. The C6 addition still violates the prose-test rule (F3).
- 311f32b: tests/status.test.ts — marker moved to the owner and count corrected to five. Accepted against brief C5's owner marker location and the fixture's five eligible folders. tests/docs-links.test.ts — matching changed from marker mentions to append instructions. C6 supports the semantic distinction, but the remaining prose gate is F3.
- d938256: tests/AREA.md — trailer-only acknowledgment of the added test-file pointer, matched by src/test-files.ts's tests path segment rule. Accepted; no assertion changed.

No operator-only actions. No Nits retained.

## 2026-10-16 check.repair

Repair start: d938256978a64074876a1ee8a953dcbedba92de1. Repaired head: f1dd0eaba1526a7af9ed15765a58dc2594e8a1a5. Read both initial reviews; identifiers below use their seat prefix to distinguish the two F1 findings.

### Repaired A-F1

Moved tracked-log checks and `.closing` creation inside packOne's existing per-folder error boundary. Both git-check failures and marker-write errors now report the argument and become that folder's failure, allowing later arguments to proceed. Marker diagnostics only claim a kept marker when it exists. Tracked-content refusals still happen before marker creation. No new handler, fallback or shared-pack change.

- Reproduction commit: 891d4e01650496a6924f647843f007e5a58e51e5, with Test-Change citing A-F1, brief C4 and the migration's git-index read failures.
- Fix commit: f1dd0eaba1526a7af9ed15765a58dc2594e8a1a5.
- New CLI regression creates a tracked closed-owner log, makes the temporary repo's index unreadable to git by corrupting it, then submits that owner, a healthy chart and an invalid folder. It checks nonzero exit, both failed folder names, successful chart packing and marker/plain-file state. Cleanup removes the fixture even on failure.
- `check repair-B-AF1-red: 1 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-repair-B-AF1-red-1792103298508-270070.log` on the pre-fix product: uncaught git ls-files failure, no batch summary.
- `check repair-B-AF1-green: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-repair-B-AF1-green-1792103310241-275741.log` after the fix: 1 pass, 8 assertions.

Read back both logs with akrogon log. Existing planned proofs, authored before this repair and not by B, pass on the repaired head: C1 chart packing/retry, C2 counts, C3 tracked refusals, C4 independent folder outcomes and C5 status/cleanup. C6's inputs are unchanged, so its previous run remains evidence pending A's F3 correction.

Current proof logs (all read back):

- `check criterion-1: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-1-1792103320990-281462.log`
- `check criterion-2: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-2-1792103320899-281459.log`
- `check criterion-3: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-3-1792103320970-281460.log`
- `check criterion-4: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-4-1792103320899-281461.log`
- `check criterion-5: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-criterion-5-1792103320970-281458.log`

### Handed to A

- B-F1: resolving the accepted single-chart form needs reconciliation with the locked design: its entry contract permits only issues/chart/<chart> and explicitly excludes the log resolver, while plan D1 additionally accepts issues/chart itself. Supporting that addition requires changing the excluded resolver contract. B does not change a locked design decision. A must resolve this mismatch and the broken status recovery instruction, retaining the existing concrete CLI failure as evidence.
- B-F2: C3 lacks only the existing-member/wrong-bytes case. Existing bun CLI fixture, writeArchive and commitAll helpers already provide the machinery. A adds the newline and non-UTF-8 mismatch refusal cases and current proof/deliberate-break evidence under the missing-case exception.
- B-F3: removing or correcting the prose-shape assertion is a test-expectation correction, reserved for A. C6's skill instructions remain correct; A records the semantic check while removing the invalid wording/paragraph gate.

No operator-only actions, live grants or retained resources apply. No Nits from B remain. A's four initial Nits are unchanged and were not repaired as part of this pass.

### Final verification

`akrogon verify` on committed f1dd0eaba1526a7af9ed15765a58dc2594e8a1a5 returned green: format 0, test 0 (898 pass, 0 fail), typecheck 0. Receipt/run d1addfa8-8b3a-4e1b-9dfc-bd8de4e40669. Read back the three logs:

- `verify format: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-format-1792103325029-283577.log`
- `verify test: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-test-1792103431631-283577.log`
- `verify typecheck: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-typecheck-1792103433505-283577.log`

The code worktree is clean. No merge checks ran. A-F1 is repaired; B-F1, B-F2 and B-F3 remain handed to A, so this pass requests check.fix.

## 2026-10-16 check.review re-check

Verdict: ready.
Prior reviewed base: fb60ccdceba56e8c0b28fd9c2d7eae74f2387307.
Prior reviewed head: d938256978a64074876a1ee8a953dcbedba92de1.
B's subsequent repair handoff: f1dd0eaba1526a7af9ed15765a58dc2594e8a1a5.
Refreshed base: 310c23c. Reviewed head: 88216a7589f22f7d5fcd4d7c167b59c687cee126.

Computed `git range-diff fb60ccdceba56e8c0b28fd9c2d7eae74f2387307..d938256978a64074876a1ee8a953dcbedba92de1 310c23c..88216a7` myself. Reviewed added/changed commits and the chart skill conflict resolution, not main's commits. Earlier tests, expectation corrections and trailer-only commit replay unchanged. The changed product commit preserves both main's worktree-unlock instructions and this leaf's pack-before-marker instructions. B's precheck-error repair replays identically, confirmed by comparing its old and refreshed diffs.

Evidence: `check recheck-B-diff: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-recheck-B-diff-1792103791960-1140038.log`; `check recheck-B-evidence: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-recheck-B-evidence-1792103799568-1143782.log`.

### Finding dispositions

- A-F1: resolved. dbe1a0f/f1a8da2 preserve the tested per-folder error boundary. The refreshed criterion-2 run includes the regression and passes.
- B-F1: resolved as the design/plan mismatch identified at handoff. c5aaa4f removes the plan-only issues/chart-root acceptance and its impossible recovery advertisement. The locked entry contract accepts issues/chart/<chart>, not issues/chart itself; the excluded resolver remains unchanged. Single-chart-root packing is explicitly recorded as unsupported in the report and plan. This does not establish support for that layout, and no such claim is made in this verdict.
- B-F2: resolved. 494e590 adds existing-member/different-byte refusals for newline and binary archive content, then verifies acceptance after restoring indexed bytes. Read back `check-fix-BF2-red-1792103609934-743446.log`: removing oid equality makes the new refusal fail. Read back `check-fix-BF2-green-1792103612189-744722.log` and the later criterion-3 log: restored product passes with 15 assertions. The added cases use existing CLI/archive helpers and do not change earlier assertions.
- B-F3: resolved. 88216a7 removes append/then/paragraph matching. The remaining checks cover command and marker literals and a numeric site count. Opened the current chart skill and judged all three pack-before-marker instructions directly, including the rebase conflict sites. The instructions satisfy C6.

No new blocking defect introduced by the repair. No Nits retained by B. No operator action is open.

### Current proof and checks

Read back all six current planned proof logs through akrogon log; all exit 0 and postdate the final code/test changes:

- criterion-1: check-criterion-1-1792103655942-773363.log
- criterion-2: check-criterion-2-1792103656100-773674.log
- criterion-3: check-criterion-3-1792103656388-773901.log
- criterion-4: check-criterion-4-1792103659633-775744.log
- criterion-5: check-criterion-5-1792103659858-775951.log
- criterion-6: check-criterion-6-1792103659936-776188.log

All paths above are under this leaf's implementation directory. The commands retain the planned test files and filters; no runner or configuration is disabled. Receipt 27b66a67-7132-4866-b6d1-52cf7b7b0554 verifies exactly 88216a7589f22f7d5fcd4d7c167b59c687cee126 with the current checks: format 0, test 0 (901 pass, 0 fail across 55 files), typecheck 0. Read back check-format-1792103663050-776815.log, check-test-1792103770912-776815.log and check-typecheck-1792103772872-776815.log. No further rerun was needed: there are no code edits, missing current runs or unresolved check concerns in this re-check. This pass did not follow a rejected merge, so rejected-merge rerun evidence does not apply.

### Trailers and documentation

New/replayed repair Test-Change trailers: dbe1a0f names tests/folder-pack.test.ts and A-F1/C4, accepted for the reproduction addition; 494e590 names the same file and B-F2/C3, accepted for the missing mismatch cases; 88216a7 names tests/docs-links.test.ts and B-F3, accepted for deleting the invalid prose expectation while preserving literal contracts. Earlier trailers remain accepted as recorded above.

Opened docs/guide/files.md and the live chart skill for the changed behavior. The repair adds no new documented command form; its removal of the unsupported root form follows the locked design. No AREA.md or lesson change appears in the repair, so the earlier area-pointer review remains applicable. The code worktree is clean; no review code edits or commits were made. All previous Fixes are closed and this pass requests merge.

Phase result: moved merge, exit 0. Subsequent automatic dispatch reported Herdr server_not_running at /home/ivan/.config/herdr/herdr.sock. The phase move succeeded; no merge pass was started by this dispatch. Evidence read back: `check recheck-B-submit: 0 /home/ivan/Work/infra/akrogon/issues/open/check-evidence/folder-pack/implementation/check-recheck-B-submit-1792103847478-1168493.log`.

## 2026-10-16 merge

Attempt: 0a4a49e3-8253-47e6-b36c-559eef226044. Memberless applied top: 88216a7589f22f7d5fcd4d7c167b59c687cee126, built on 310c23c233a95a9f0c54362027047b1c0d3091f8. HEAD matches and the worktree is clean. No fetch, rebase or code change by B on this applied attempt.

`akrogon verify --attempt 0a4a49e3-8253-47e6-b36c-559eef226044` returned 0 and reused receipt 27b66a67-7132-4866-b6d1-52cf7b7b0554 for identical tree 6c29886d3dd90df88867ed983275ec7df2d45208. Its format/test/typecheck logs were read back in the preceding re-check: all green, 901 tests passed. No merge_checks or advisory commands are configured and merge_covers is empty. `akrogon phase folder-pack merged --slot B --check --attempt 0a4a49e3-8253-47e6-b36c-559eef226044` returned `ok`.

Gathered all four completion-owner briefs (log-reader, close-pack, folder-pack, check-path-print) and ISSUE.md. The three sibling leaves are merged; this leaf can complete check-evidence. The merge slot will broadcast once if the command prints issue complete. No live fixtures or operator actions apply.
