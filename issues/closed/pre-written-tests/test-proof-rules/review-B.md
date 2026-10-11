# Review B: test-proof-rules

Date: 2026-10-10
Phase: check.review
Base: 354c80e14aca6483c430312c61ae5c1397bb548e
Reviewed head: 667712df23607f4523b53698fae3ded94c2dc586
Verdict: fix

## F1: The reproduction exception excludes implement-time product fixes

Location: `skills/implement-issue/SKILL.md:57`, with `:76` as its referenced exception.

The new rule expressly forbids implement A from writing any test and lists only the expectation correction and “the check.fix reproduction below” as exceptions. That referenced reproduction requires a review finding and belongs to check.fix. It does not authorize a reproduction during implement.

Realistic source and trace: a slow/live criterion runs the actual product and reveals another leaf's product bug during implement. This is an explicitly supported execution path, not a speculative input: `skills/chart-issues/assets/standing-design.md:15` requires an in-branch fix with a fail-first test, and `skills/implement-issue/SKILL.md:36` still names that in-branch fix among implement's permitted repairs. The live invocation supplies the real output establishing the bug. A must add its reproduction before fixing it, but the new implement rule prohibits that addition until check.fix. Implement cannot hand off its still-red criterion to obtain a review finding (`implement-issue/SKILL.md:36,63`).

Consequence today: that supported implement pass must either stop instead of performing the permitted product fix, or violate the new test-authorship rule to produce its required fail-first proof.

Contract: brief What permits the fixing seat's red-first proven-bug reproduction, and done-criterion 9 explicitly preserves in-branch fixes of another leaf's product bug. Plan D4 describes the two exceptions generally and D8 preserves this repair path.

Repair: authorize A's one red-first reproduction for a proven product bug during implement as well as check.fix, with a trailer citing the real source and a test commit before the fix. Keep workers unable to author tests and keep the prohibition on building proof machinery. Verify the implement live-run path by reading its applicable rules together. No wording test is required for this prose defect.

## Verification

- Read brief, design, plan, report, sibling frozen-test-guard design, installed check-issue skill and ponytail reference before reviewing. Debate is no, so positions/rebuttal artifacts are absent as expected. Did not read or contact the peer's review.
- Reviewed all 11 changed files, the affected operator pages `docs/guide/phases.md` and `docs/guide/idea.md`, and grounding pointers in `docs/reference-index.md` and `skills/AREA.md`. No AREA.md file changed, so the changed-AREA path listing requirement does not apply.
- Criteria 1–2: synthesis contains criterion-test creation, recorded red output, pre-product commit and existing-base proof-command restrictions.
- Criteria 3–5: worker/A ownership, mismatch handling, expectation correction, mode split and test-count rule are present. The reproduction exception's implement scope is the F1 gap.
- Criteria 6–8: missing-test paragraph removed, no-source Nit disposition and planned-command/config review added, repair reproduction trailers and machinery prerequisite audit present.
- Criterion 9: machinery/environment stop and preserved tools/recordings are present, but the preserved implement-time product repair conflicts with F1.
- Criterion 10: independently swept skills/docs/README by test-writing and machinery-building terms. Kept trailer mechanics in implement:64 and merge:51 are excluded by design. Recorded session fixtures are not rule instructions. No lesson removal or guard change is in this diff.
- Criterion 11: inspected the actual fresh classifier's user prompt in `/home/ivan/.pi/agent/sessions/--home-ivan-Work-infra-akrogon-issues-worktrees-test-proof-rules--/2026-10-10T21-41-44-596Z_01a127c3-c814-7450-b56c-8a3a1539a379.jsonl` and its returned classification in A's implementation transcript. It was given only the nine rules and seven cases. This evidence does not exercise the implement-time product-bug path in F1.
- Reused report evidence for the unchanged prose-only head: format and typecheck passed, full suite 691 pass / 0 fail, changed-test command reported no affected test files. No code change or specific executable-check concern justifies repeating these commands.
- Independently ran `git diff --check 354c80e...HEAD`: exit 0. `git status --short`: empty. Reviewed head matches the report.

## Test-Change trailers

Inspected all four commits in `354c80e14aca6483c430312c61ae5c1397bb548e..HEAD`: no Test-Change trailers. No changed path matches `src/test-files.ts`, so none is required for this rule-text diff.

## Operator actions

None.

## check.repair — 2026-10-10

Reviewed repair input: both initial reviews at `667712df23607f4523b53698fae3ded94c2dc586`. A has no Fixes. B's F1 is repaired in its own rule-text commit `b8826604744a37152eba9769f065beab42cba4ad`; no test file changed and no Test-Change trailer is owed.

Before: implement:57 named only “the check.fix reproduction below” as the bug-test exception.
After: it permits “A's one reproduction test for a proven product bug during implement or check.fix, shown red on the head before the fix and committed first with a `Test-Change:` trailer citing the bug's realistic source.” It also requires A to commit the reproduction before delegating the fix and keeps workers unable to write it.

Proof for F1: read implement:36,55,57,76 with standing-design:15. During implement a real invocation can now establish a product bug, A commits its reproduction shown red with its source cited, and then the product fix can proceed inline or through a worker. Machinery creation remains forbidden. This is a docs/rule Fix, so before/after text and classification are its proof rather than a test of wording.

### Done-criteria proof

Read all rule surfaces named in the plan's proof table at repair head. Criteria 1–2 remain in plan.synthesis: existing-base command, criterion tests, recorded red and tests-before-code commit. Criteria 3–5 preserve worker prohibition, A correction, modes and purpose-only test count; the bug exception now covers implement too. Criteria 6–7 preserve planned-command/config review and red-first repair trailers. Criteria 8–9 preserve prerequisite machinery, tools, recordings, required stop and live product repairs, with F1's authorship conflict removed. No planned test or runner configuration changed.

Criterion 10: reran meaning-oriented `rg -n -i '(write|add|derive|creat|repair|extend|build).{0,75}(test|machinery|runner|rig)|test.{0,55}(write|add|derive|creat)' skills docs README.md -g '*.md'` and read each rule hit. No additional authorship or proof-machinery permission was found. Out-of-scope old trailer language at implement:64 and merge:51 remains owned by frozen-test-guard. The markdown scope excludes recorded JSONL session fixtures and executable test code, which are not skill rules.

Criterion 11: launched fresh subagent `/root/rule_classifier` with `fork_turns=none`, only the nine rule-file paths, the seven required case descriptions and one additional F1 scenario. No issue artifacts or diff were supplied. Its decisions:
- (a) Refused: worker runs planned tests and writes none (implement test rule, worker mismatch rule).
- (b) A corrects formKeys to form_keys in its own commit with source-citing trailer (A expectation exception).
- (c) Nit, no test and no issue (review Fix/Nit bar).
- (d) Fix, reproduction committed red first, then fix and passing proof; required live rerun handed to A (check.repair rules).
- (e) Prerequisite machinery leaf with known-good green/deliberate-break red and blocked-by, otherwise narrow with operator (chart audit).
- (f) Allowed: existing bun test and temporary-repo fixture helper are not machinery; planner commits first (machinery definition and synthesis).
- (g) Failed with criterion and daemon startup cause, never machinery workaround (implement Shared context).
- (h, F1) A writes the source-cited reproduction, shows red on the pre-fix head and commits it before delegating the product fix. Then pass-after, affected-stage/consumer reruns and final criterion/check proof (implement exception plus standing-design live repair).

All seven required classifications and F1's additional scenario passed. No further Fix, operator action or Handed-to-A item remains. B holds no reusable Nit requiring a lesson entry; A's two Nits are unchanged and received no repair work.

### Checks

- `bun run format`: exit 0. It reformatted only two untouched files, src/status.ts and skills/chart-issues/scripts/peer-wait.ts; inspected and restored those formatter-only changes to keep the repair scoped.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, 11 changed files and no affected test files, 0 pass / 0 fail.
- `git diff --check 354c80e...HEAD`: exit 0. Committed repair changes one rule line only; worktree clean.
- `bun test --timeout=30000`: exit 0, 691 pass / 0 fail, 7352 assertions, 34 files, 83.54 seconds runner time / 84 seconds wall time. Full output retained at `implementation/check-repair-tests.log`.

Repair result: F1 resolved. All done-criteria proof and configured checks passed at `b8826604744a37152eba9769f065beab42cba4ad`. No merge_checks run in this pass. Request merge with no handed repairs or open operator actions.

## Merge — 2026-10-10

Attempt: d22f6437-7a57-49b6-8df8-a2c7e25ef760. Applied top and tested HEAD: b8826604744a37152eba9769f065beab42cba4ad. Base: 354c80e14aca6483c430312c61ae5c1397bb548e. No carried members; no fetch, rebase or commit performed.

Configured checks (merge_covers empty, merge_checks/advisory empty):
- `bun run format`: exit 0. Inspected and restored formatter-only drift on untouched src/status.ts and skills/chart-issues/scripts/peer-wait.ts so the recorded top stays unchanged.
- `bun test --timeout=30000`: exit 0, 691 pass / 0 fail, 7352 assertions, 34 files, 81.95 seconds runner / 82 seconds wall time. Log: implementation/merge-tests.log.
- `bun run typecheck`: exit 0.
- `: "${AKROGON_BASE:?AKROGON_BASE is required}" && bun test --changed="$AKROGON_BASE" --timeout=30000`: exit 0, no affected test files, 0 pass / 0 fail.
- `git diff --check 354c80e...HEAD`: exit 0; working tree clean and HEAD matches supplied top.

Completion-owner check: pre-written-tests/ISSUE.md names two leaves. frozen-test-guard is still open in implement; this attempt contains only test-proof-rules, so it cannot complete the owner and owes no completion broadcast unless the command reports one.

`akrogon phase test-proof-rules merged --slot B --check --attempt d22f6437-7a57-49b6-8df8-a2c7e25ef760`: exit 0, `ok`.
`akrogon phase test-proof-rules merged --slot B --attempt d22f6437-7a57-49b6-8df8-a2c7e25ef760`: exit 0, `moved merged`. No issue/epic completion line, so no broadcast was due. Command also reported `self-update skipped: diverged from origin/main; 5 behind origin/main; run akrogon sync`; leaf merge is complete, installed-checkout update was skipped.
