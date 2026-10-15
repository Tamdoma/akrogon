# Plan: raise merge green rate (operator O1: L1 + L2 + L3, direct route, B reviews as lifecycle)

Operator, verbatim: "o1, do it now. Let slot b be your reviewer as if you were doing an actual lifecycle run."
Analysis and evidence: scratchpad/green-rate/answer-{B,D,E}.md and reds.md. Since 17:46 today, 2 of 3 framework merge reds were verify-aliases.test.ts:276 (cheap body must equal the hand-copied fastBaseline list), and the 3rd had a package.json cheap-line conflict.

## Outcome 1 (framework, direct): delete the copied cheap list
- .claude/hooks/tests/verify-aliases.test.ts: delete `fastBaseline` (lines 13-39) and the `framework:verify:cheap body` equality (lines 273-276). Keep the `framework:verify:fast` body assertion (cheap + hooks:selftest) and every closure test (lines 279+), which already refuse a dropped verify file, a double run and an orphan against AKROGON_BASE.
- No other edits. Existing cheap entries stay where they are: moving them would reopen leaf decisions (promotion-script D12, browser-dies-with-run D8).
- Commit with a `Test-Change:` trailer.
- Proof: `bun test .claude/hooks/tests/verify-aliases.test.ts` green. Break case: a scratch edit dropping a step from framework:verify:cheap that no core step runs is still refused by the closure test (run once, then discard).
- Land via the direct protocol: rebase, `akrogon verify --holder <chart>/direct` (checks + merge_checks), direct-guards.ts, then push the exact SHA.

## Outcome 2 (akrogon, direct): rules and gates
L1 rule, so no future leaf appends its proof to `checks`:
- skills/chart-issues/assets/standing-design.md:14: "The spine runs in the consumer's blocking checks" becomes "The spine runs in the consumer's own suite inside the destination's full verify".
- skills/chart-issues/assets/shapes.md:171: "proof may be a command in the destination's blocking `checks` (never a `merge_checks` command)" becomes "proof may be a command the destination's `checks` already run (never a `merge_checks` command, and never one the leaf adds to `checks`, which holds only repo-wide invariants)".
L2a, the repair edit gate:
- src/phase.ts:285: require the green `leaf` receipt on the move into `merge` from `check.repair`, as it is on the move into `check.review`. Test in tests/phase.test.ts: the move is refused without a receipt and passes with one.
- skills/check-issue/SKILL.md:91: after repairs, B runs `akrogon verify` (leaf scope, `checks` only) on the committed head before `merge`. It still runs no `merge_checks`.
L2b, repair proves the failure, not a whole-suite replay:
- implement-issue SKILL.md:80 and :86, check-issue :69 and :91, plan-issue :63, docs/guide/setup.md:54 and docs/guide/phases.md:94: "replays the exact rejected command" becomes "reruns the reproducing command". That is the narrowest command, using the recorded runner, that is red on the rejected head, so the failing test files, or the whole recorded command when nothing narrower reproduces it. It must be green after the repair. report.md records it red before and green after. check-issue :69 accepts that evidence in place of the full replay.
L3, the sensor reads existing data:
- src/timing-report.ts: `akrogon timing --since <ts>` (the cohort report) also prints one line per verify command that was red then green on the same tree (that is `inconsistent`) since <ts>, from issues/verify-runs.jsonl, with the count, the last time and up to 3 `(fail)` test names parsed from the red log when present. No new writes or fields.
- Test in tests/timing-report.test.ts: one red-then-green pair is listed with its failing test name, and red-then-red or green-only cases are not.
- Not done: a stored cause field (drift or bug). B's judgment stays in review-B.md. Host failures already stopped counting as leaf reds in 6640ab5. attempts.ts outcome values stay, because history records use them and timing-report parses them.

Gates: `bun test` for the touched test files, then the full suite, plus tsc and prettier. Commit without a co-author. Push after B returns ready.

## Amendment (A, before B's verdict): where L3 lives
The cohort report is a single-purpose experiment gate (docs/guide/files.md:94), so the inconsistent list does not go there. Instead:
- New `akrogon flaky` (src/flaky.ts plus a case in src/akrogon.ts) prints one line per verify command that went red then green on the same tree, from issues/verify-runs.jsonl, grouped by command and `(fail)` test name. Each line shows the count and the last time, newest first. It is read-only and takes no options.
- Docs: one paragraph in docs/guide/files.md next to the verify-runs record.
- Loop actuator: skills/chart-issues/SKILL.md Open reads `akrogon flaky` beside LESSONS.md as a resource and shows each listed test as an intake candidate the operator can confirm. That is one sentence.
- Test: tests/flaky.test.ts covers one red-then-green pair listed with its test name, and red-then-red and green-only cases not listed.

## Revision after B plan review (slots/plan-review-B-1.md)
- F1 (framework): handled in the framework chart, which now owns Outcome 1.
- F2: L2b also edits implement-issue :65 and :86, skills/AREA.md:24 and init-akrogon :20, and fully rewrites implement-issue :80, keeping the recorded command, base/head and red-before/green-after evidence.
- N1: `akrogon flaky` skips unfinished and setup-failed runs, pairs by exact command string per tree, orders by run end, and tests those negative cases.
- Operator, later: "Look also at all duplicated test lists across the board." Root-cause rule added to standing-design.md: a test reads the source it checks instead of keeping a hand-copied list of its entries. The framework copies are removed in the framework chart.
