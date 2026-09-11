# Review B: pull-close

Verdict: fix.

Base: `ab36dd0e424b5b5041dd251c189639498c72b4a8`.
Reviewed head: `e58c2445cb38c74a5d5abe253dae555b5754035c`.
The worktree was clean at review start. Read the authoritative plan and implementation brief, skill ponytail guidance, changed implementation/tests/plugin files, and affected completion/recovery callers. No peer review was read.

## Findings

F1. Fix: partial gh close success duplicates the merged comment. `src/pull.ts:132–146` retries the same commented close whenever the issue still reads OPEN. In GitHub CLI 2.100.0, [close.go lines 137–154](https://github.com/cli/cli/blob/v2.100.0/pkg/cmd/issue/close/close.go#L137-L154) posts the comment first and performs the close mutation second. If the comment succeeds but the close mutation fails, a fresh state check still returns OPEN and the retry posts the comment again. This violates the locked repeat-safety requirement and reveals an incomplete assumption in plan D6, not a deviation from that plan.

Reproduction: actual `bun src/akrogon.ts phase demo merged --slot A` in a temporary registered repo, with a sourced leaf/worktree and a stateful fake gh at the process boundary. View returns stored state. First close appends its comment then fails before changing OPEN. Second close appends its comment and changes state to CLOSED. Observed exit 0, owner moved, two identical `merged <commit>` comments, and two close attempts. See `review-B-evidence.txt`. No real GitHub issue was touched.

Required repair: make the one retry account for the already-posted comment as well as issue state. Preserve the required initial commented close, one retry, existing lock, and committed local move. For example, establish whether the exact merged comment already exists before the retry and avoid reposting it while completing closure. Do not add a durable local queue. Add this partial-comment-success scenario alongside the existing fully-closed/lost-response scenario. Correct D6's assumption during the repair rather than treating the duplicate as a permitted external race.

F2. Fix: new tests depend on serialization order and prose. `tests/phase.test.ts:273` identifies warnings with `line.startsWith('{"warning":')`, making the warning key's position a test contract. In an isolated copy, changing only the structured warning object from warning-first to source-first made the phase suite fail with 0 warnings detected instead of 4, while command behavior and warning fields were unchanged. `tests/pull.test.ts:176` also requires the prose word `GitHub` rather than the structured repo/origin evidence. These violate the design's Command Tests constraint and the user's function-over-format rule.

Required repair: parse warning JSON at the test boundary without requiring key order or whitespace and assert semantic warning/source/status fields. Assert invalid-origin failure and its structured repo/origin context rather than the explanatory sentence. Keep existing behavioral assertions and retry counts. The isolated warning-order reproduction is recorded in `review-B-evidence.txt`.

## Verification

Existing same-head evidence in `implementation/checks.txt` records format and typecheck exits 0 plus 40 passing tests / 436 assertions. No code changed since those checks, so the full suite was not repeated. Review ran two targeted concern reproductions: a phase test in an isolated source copy with only warning key order changed, and an actual CLI transition with a stateful substituted gh reproducing comment success followed by close failure. Temporary copies and fixture repositories were cleaned up. Production code was not edited.

The remaining plan contracts are supported by code and existing executable evidence: literal origin, complete validated pagination, failed-listing preservation, numbered reconciliation, per-repo all-mode failures, under-lock owner closure, triggering commit, awaited recovery, and startup wrapper order. Existing pagination/crash/lock-duration limitations remain. No additional nit or unrelated scope is proposed.
