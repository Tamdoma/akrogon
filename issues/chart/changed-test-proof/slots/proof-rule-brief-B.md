# Fork notes brief: proof-rule, slot B

You are slot B. Write blind notes for the fork below, your own position, not a review of A. Do not read slots/proof-rule-A.md, slots/proof-rule-merged.md or the Findings section of forks/proof-rule.md. Do not edit any repository file.

Note format: the five-part fork note defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md, section "Blind peer exchange" (the paragraph starting "For the opening map"). One note per question Q1-Q4.

Return path, exactly:
/home/ivan/Work/infra/akrogon/issues/chart/changed-test-proof/slots/proof-rule-B.md

## Intake
/home/ivan/Work/infra/akrogon/issues/chart/changed-test-proof/INTAKE.md (Tamdoma/akrogon#86)

## Questions
Q1. Which added or changed tests need a stability proof: every test the leaf adds or changes; only tests whose pass depends on time, a browser, other processes or shared resources, plus any test the leaf repairs after it failed in an integrated run; or only tests repaired after they failed at merge?
Q2. What runs count as proof: the test run repeatedly inside the smallest command that runs it beside the same stages it runs beside at merge; the test run repeatedly alone under injected CPU load; or the test file alone rerun (`bun test --rerun-each`)?
Q3. How many runs, given that no inspected source sets an adequate count: a fixed floor, or a count the planner sets per test with its stated detection chance and run time?
Q4. When the proof shows the leaf's own changed test failing, does the leaf repair it on its own branch with failure logs kept, never counting `--retry`, quarantine or a later green run as passing, while the existing single retry for unattributed red stays unchanged?

## Carries
- Operator answer on proof-owner, verbatim: `1a |`. Meaning (forks/proof-owner.md Taken): skill steps only, no new command code. The planner names the proof, the implementer runs it and records command, test version and result, slot B rejects proof taken before the latest change to that test or its helper.
- Related fork: /home/ivan/Work/infra/akrogon/issues/chart/changed-test-proof/forks/proof-owner.md
- Locks: check-reruns (issues/chart/check-reruns/forks/check-scheduling.md): checks before review and after repair, merge_checks only at merge, check.fix after a red merge replays the exact rejected command once. agent-test-rules 10a/11a/12a. test-runs and merge-load-flakes: no heavy-run slot, no capacity change.
- Existing red handling: skills/implement-issue/SKILL.md:38, skills/merge-issue/SKILL.md:75, docs/guide/merge.md:31.
- Live surfaces the rule would land in: skills/plan-issue/SKILL.md (proof mapping near :60), skills/implement-issue/SKILL.md (:57, :65, :86), skills/check-issue/SKILL.md (:53-55), skills/merge-issue/SKILL.md. Consumer: /home/ivan/Work/infra/tamdoma/framework (package.json `framework:verify:core`, `test:playback-probe`).

When the file is written, your turn is done.
