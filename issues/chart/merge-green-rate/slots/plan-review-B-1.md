# Plan review B: merge green rate

**Verdict: fix.** Reviewed plan.md including its Amendment. L3 is reviewed as the separate read-only flaky command, not a timing-report change. No peer answers were read.

## Fixes

### F1 — Removing fastBaseline leaves non-test cheap checks unprotected

Plan.md:7–10 claims the retained closure guard catches dropping a cheap step that core does not run. It does not cover all such steps.

Framework `.claude/hooks/tests/verify-aliases.test.ts:145–175` expands only bun test file arguments; therefore hooks:typecheck, hooks:typecheck:state-fixtures and lint have no baseCoverage entry. Their real commands are tsc/biome invocations in package.json. The retained missingFast calculation at :289 compares **current** fast against **current** full verify, so dropping a step from cheap drops it from both sides. The name-preservation loop at :309–317 checks only the base's core steps. These checks are absent from core, as confirmed by the current script closure.

Failure scenario: a package-script edit removes hooks:typecheck from cheap while keeping its script definition. After the planned equality deletion, missingFast, orphaned and missingNames all remain empty. Full verify stops typechecking hooks without this guard refusing the edit. The planned deletion loses a functional guarantee along with the copied-list coupling.

Fix: preserve non-file-backed commands from the base fast closure in the existing full-closure comparison, analogous to the current base-core name check. Permit movement between fast/core rather than pinning the cheap list or order. Make the deliberate-break proof drop hooks:typecheck or lint, not just a bun test lane. Amend “No other edits” to permit this minimal guard change in the same test file.

### F2 — L2b misses instructions that still require the full rejected command

Plan.md:21 lists implement-issue:80,86 but omits `akrogon/skills/implement-issue/SKILL.md:65`. That Shared context instruction applies at implement end and after repair and explicitly says a check.fix pass after a red merge ending replays the exact rejected command. `skills/AREA.md:24` and `skills/init-akrogon/SKILL.md:20` repeat the same exception and are also omitted.

Failure scenario: A follows the revised targeted-reproducer rule at :80, then its final proof at :65 still requires the full merge command. The supposedly removed whole-suite replay remains required, recreating the extra expensive run and its unrelated-red risk.

Fix: include those three sites in the L2b change list. Rewrite all semantic replay requirements inside :80 as well, including its opening replay of recorded commands and its post-repair “every exact command ... verbatim” requirement, rather than replacing only one phrase. Keep command, rejected/repaired base and head, red-before and green-after evidence. The merge's fresh full verification and receipt gate remain unchanged.

## Nits

**N1 — Specify the flaky sensor's record eligibility.** The Amendment at plan.md:31,34 leaves this to implementation. `akrogon/src/verify.ts:164–169` copies a failed setup's exit/log into every configured command even though none executed. A failed install followed by successful verification on the same tree must not list each test command as flaky. Match the exact command string, not just its name: config can change outside the Git tree, and `src/verify.ts:63–74` already distinguishes command sets when reusing receipts. Use completed observations in chronological order and exclude setup-failed records. Add these negative cases alongside the planned pair test. This is a specification clarification, not evidence that the unimplemented command currently misclassifies a run.

## Other assessed changes

- L2a is implementable as proposed. `src/verify.ts:116` selects leaf scope in check.repair; `requireGreenReceipt` checks the current tree and configured command set. Requiring it for check.repair → merge does not run merge_checks. Existing publication guards still require the merge receipt (`src/phase.ts:538–539`).
- Moving the spine to its own suite inside full verify removes the cited pressure to append spine proofs to cheap. The L1 criterion-template change retains independent own-test proofs. Existing cheap placements are deliberately preserved.
- The L3 Amendment keeps the cohort experiment single-purpose and can reuse readVerifyRuns without new persistent fields. Its read-only CLI/intake-candidate route is coherent. Candidates still need operator confirmation and B's causal judgment.

Read-only plan/source/evidence inspection. No checks, code edits, commits, pushes or lifecycle moves. Only this review file was written.
