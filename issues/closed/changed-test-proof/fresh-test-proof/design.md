# Design: fresh-test-proof

## Binding decisions, verbatim

### proof-owner (issues/chart/changed-test-proof/forks/proof-owner.md)
Operator 2026-10-11, verbatim: `1a |`

Q1 -> 1a: skill steps only. The planner names how an added or changed test is proven stable, the implementer runs that proof and records the command, the test's version and the result, and slot B rejects proof taken before the latest change to that test or its helper. No new command code.

Reason: both gaps in the #86 case were evidence judgments (stale load runs reused for a new case; one green replay admitting a rewrite), and a command that reruns the test file alone would likely have passed this test.

Foreclosed: 1b phase record check (record format, parser and runnable-test rule not built); 1c command-run reruns; 1d framework config only.

### proof-rule (issues/chart/changed-test-proof/forks/proof-rule.md)
Operator 2026-10-11, verbatim: `1a |` (answer to the corrected round after `1a` was found to rest on A's wrong run-count claim).

Q6 -> reviewer-only, and Q4 -> no rerun count: the rule is proof-owner 1a alone. Proof for an added or changed test counts only when run on that test's current version, after the latest change to the test or its helper; the planner names that proof in the existing proof mapping, the implementer records command, test version and result, and slot B rejects older proof. No new command code, no new step, no load-run campaign, no change to the check-reruns schedule.

Reason: the flow already runs the full merge check twice after a fix (check.fix replay, then the merge phase run), and in #86 the fixed test passed both and still failed later, so a small count adds nothing; a count that might catch it costs about 60-110 min per own-test merge failure. The stale-proof rule fixes the gap a reviewer can see, at no extra run time.

Accepted cost: a fixed test that fails rarely can still land and break a later leaf, as in #86 (B D1).

Foreclosed: the broader partial answers Q1 1a, Q2 2a, Q3 3a, Q5 5a (load runs for timing, browser and process tests before review); 10 full merge-check runs after a fix; no change with #86 closed.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: this leaf changes text only, so no test is added. No vanity tests means no test asserting skill or guide wording, and check-issue already rejects akrogon tests of prose wording; review checks the text. The existing blocking `checks` must still pass after the edit.

## Leaf architecture
- Owned: skills/implement-issue/SKILL.md proof-step paragraphs at :65 (implement) and :86 (check.fix), where "reuse unchanged evidence" appears, and the report-contents clause in :65; skills/check-issue/SKILL.md :55 (B checks the report ran the planned tests); docs/guide/phases.md :94 (implementation) and :104 (review).
- The installed skill paths under /home/ivan/.claude/skills link to the repo's skills folders, so the repo edit is the installed text after deploy.
- The planner side of proof-owner 1a needs no edit (A,B): criterion tests use the existing plan mapping (skills/plan-issue/SKILL.md:61 maps each done-criterion to its proof command), and a red-first bug reproduction uses the existing report link to the bug and its evidence (implement-issue :59). The freshness rule applies to both. plan-issue is excluded.
- "Helper or fixture it uses" means a file the test imports or reads that is not the product under test. The rule compares the commit a proof ran on with the latest commit touching the test or such a file; no tool computes this.
- Exclusions: no command code, no new script, no state or readiness field, no run count, no load run, no change to `checks`/`merge_checks` scheduling, the rejected-command replay, the unattributed-red retry or the `Test-Change:` trailer rules.
- Wording stays one rule per place: the reuse rule and report fields live in implement-issue, the rejection in check-issue; the guide describes and does not restate them in full.
