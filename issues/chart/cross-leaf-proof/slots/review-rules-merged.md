# review-rules, merged round

Evidence (A,B,C): #11 prep and verify built the allowed-name list separately (prepare-briefs.ts:715 vs verify-network.ts:326) and disagreed by construction. #12 auditor heading match missed the writer's heading. #14 the chrome check demanded uniqueness the model's instructions never stated (report.md:309-315). #16 the check wanted distinct pairs 2 heroes cannot give 4 sites (report.md:267-284).

Already covered (A,B,C): spine-growth 3a runs real or recorded-from-real producer output through every check in a chain. proof-selection 1a makes an untested failure the leaf's code can cause a review Fix. standing-design.md:8 already requires negative and edge tests. Not covered: two copies of a rule inside one leaf or outside a chain, a model writer whose instructions omit the checker's rule, and a check whose pass depends on group size beyond the fixture (C).

### 1 · Must a writer and its checker share one definition of the rule?
- 1a (recommended) (A,B,C) Yes, for the same domain rule. Code writers and checkers use one function, schema or data (A,B,C). A model writer's instructions state the checker's rule, including limits and required inputs (A,B,C). Wording differs on how: taken from the checker's definition (A), quoted or generated (C), expressed consistently with no new generation tooling (B). If a design keeps two copies it says why and names a test that checks they agree (B,C). The chart names the rule's owner when writer and checker are in different leaves (A,B). Tests keep independent expected results so a shared bug cannot pass its own test (A,B,C, carried R5). Review Fix: a leaf adds or changes a second copy without a reason and agreement test (C), or a reproducible disagreement or missing proof, not mere resemblance (B). A names the Fix as a leaf that adds or changes a check whose rule another path re-implements.
- 1b (B) one function for writer, checker and test expectations in every case: a shared wrong result passes. (A,C) review-only, no standing-design line: review sees one leaf, and prep and verify were different leaves.
- 1c (A,B,C) nothing new: #11, #12, #14 recur, and the case inside one leaf is never covered.

Pitfalls: one rule, not look-alike code, and no refactor of unrelated duplicates or a rule framework (B,C). One source means one approved rule, the checker does not decide product intent (B, report.md:309-315). A real browser still checks contrast even when token math passes (B, report.md:320-325). Some copies are legitimate, for example a validator that cannot import shared code (C).

### 2 · Must a new check prove real valid output can pass it, with a size test where size matters?
- 2a (recommended) (A,B,C) all recommend 2a, but scope differs.
  - Narrow (A,C): only a check whose pass depends on how many items exist or how many choices a pool offers states its need (smallest pool for the target count) and tests at the real target count with the real pool (must pass) and with a too-small pool (must fail early at plan with a clear message). Passing and failing examples for other checks stay under the existing rules above. Review Fix when such a check has no stated need or no target-size test (C).
  - Broad (B): every new or tightened check accepts a real valid producer result and rejects a focused invalid example for the changed rule, reusing existing evidence where it proves those cases. Size-dependent checks name the supported limit and test at it and just beyond it. For judgment checks, test a known acceptable and unacceptable case with the real instructions and judge at the intended size and state what stays unproven.
- 2b (A,C) require real passing and failing examples plus size test for every check: repeats standing-design.md:8 and spine 3a, two copies of one rule. (B) passing and failing at any size: misses #16.
- 2c (A,B,C) nothing new: #16 recurs.

Pitfalls: the stated need counts what actually renders, not what config lists (C, #16 hero-lede). Don't invent a numeric bound where none exists (B). If the target is impossible, change the requirement or generator through design, never quietly relax the check (B). Group must stay concrete or every check gets a pointless size test (C). No mandatory review rerun beyond check-issue/SKILL.md:49 (B,C, carried B3).

Disagreement D9: Q2 scope. B adds a real-pass/focused-fail requirement for every new or tightened check. A,C limit the new rule to size-dependent checks and treat the rest as covered.
Disagreement D10: Q1 review Fix trigger. C: second copy without reason and test. B: reproducible disagreement or missing proof. A: a changed check whose rule another path re-implements.

Practitioners: Hunt and Thomas, The Pragmatic Programmer, DRY is about knowledge not code (B,C). Erik Kuefler, Google Testing Blog, Don't Put Logic in Tests (B). David R. MacIver, Hypothesis, move checks onto actual execution (B). John Hughes, Experiences with QuickCheck, rarely-met conditions go untested (C). No direct source found for proving a check is satisfiable at target scale (B,C).
