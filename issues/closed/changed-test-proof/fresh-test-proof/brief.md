# Brief: fresh-test-proof

## What
Text rules in the implement and check skills, plus one guide paragraph. No command code changes.

1. Earlier evidence for a test is reused only when it ran after the latest change to that test and to every helper or fixture it uses. This defines "reuse unchanged evidence" in the implement and check.fix proof steps.
2. The implementation report records, for each proof result, the command, the commit it ran on and the result.
3. Slot B rejects proof for an added or changed test that ran before the latest change to that test or a helper or fixture it uses, and asks for the missing current run. Example: green runs of a test file taken before a new case was added to it do not prove the new case.

Owned text: skills/implement-issue/SKILL.md (the two proof-step paragraphs that say "reuse unchanged evidence", and the report contents), skills/check-issue/SKILL.md (the paragraph where B checks the report ran the planned tests), docs/guide/phases.md (the implementation and review paragraphs that describe evidence reuse).

## Why
Tamdoma/akrogon#86. In framework leaf probe-waits the reviewer accepted 20 green load runs taken before a new playback case existed as proof for that case (framework issues/closed/merge-flow/probe-waits/review-B.md:143). The case then failed in the merge gate (:162-173). Nothing in the skills says when earlier evidence stops counting.

## Done-criteria
1. skills/implement-issue/SKILL.md, in both the implement and check.fix proof steps, reuses earlier evidence for a test only when it ran after the latest change to that test and every helper or fixture it uses.
2. skills/implement-issue/SKILL.md requires the implementation report to record the command, the commit it ran on and the result for each proof result.
3. skills/check-issue/SKILL.md tells B to reject proof for an added or changed test that ran before the latest change to that test or a helper or fixture it uses, and to ask for the current run.
4. docs/guide/phases.md describes the rule in its implementation and review paragraphs.
5. No run count, rerun, new phase step, command code or change to when `checks` and `merge_checks` run appears. The rejected-command replay after a red merge stays as it is.
