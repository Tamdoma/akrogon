# Review rules

## Question
Q1. Must a rule's writer and checker share one source, or the design say why not, with model-writer instructions derived from the checker's definition?
Q2. Must a new check ship with a real passing and failing example, plus a stated capacity bound and boundary test where scale matters?

### Carries
- Taken: "## Taken" of forks/proof-selection.md (review Fix when a failure the leaf's code can cause is left untested in it), forks/spine-growth.md, forks/proof-leaf-policy.md.
- Operator style: very plain words, one concrete example per question.
- Map M4. B3: no mandatory review reruns beyond check-issue/SKILL.md:49; R5 shared code can share a defect.

## Findings
Independent rounds: slots/review-rules-A.md, -B.md, -C.md. Merged: slots/review-rules-merged.md. Rebuttals: -rebuttal-B.md, -rebuttal-C.md.

- better-than-training · live-replay report.md "Blocker #11" (prepare-briefs.ts:715 vs verify-network.ts:326), "#12", "#14" (report.md:309-315), "#16" (report.md:262-284), read 2026-09-29 · prep and verify built one rule twice and drifted; a model writer's instructions omitted a rule its checker enforced; P2 judgment rejected any shared single slot, which 2 heroes and 2 column choices cannot avoid across 4 sites even with all (hero, columns) pairs distinct (R9) · the #16 limit is on single-slot sharing, not pairs (B1), and the failing check was a model judgment, not code (C).
- better-than-training · check-issue/SKILL.md:41-45 (Fix needs a reproducible defect or failed check), standing-design.md:8 (negative and edge tests required), spine-growth 3a, proof-selection 1a · real passing output in chains and untested false rejections are already covered (A,C).
- practitioner · Hunt and Thomas, The Pragmatic Programmer, DRY, https://media.pragprog.com/titles/tpp20/dry.pdf (B,C) · one fact in one place; about knowledge, not look-alike code. Erik Kuefler, Don't Put Logic in Tests, https://testing.googleblog.com/2014/07/testing-on-toilet-dont-put-logic-in.html (B) · test expectations must not reuse the code under test. David R. MacIver, https://hypothesis.works/articles/smarkets/ (B) · checks built on an approximation of generation rejected working cases. John Hughes, Experiences with QuickCheck, https://www.cs.tufts.edu/~nr/cs257/archive/john-hughes/quviq-testing.pdf (C) · rarely-met conditions go untested. No direct source found for proving a check can be met at target size (B,C).
- Consensus 1a: one owner per rule; model writer instructions state the checker's rule; a kept second copy names why plus an agreement test; tests keep independent expected results (R5).
- Consensus 2a for size-dependent checks. Rebuttal changes: a too-small pool gets the refusal the design specifies at its own boundary, not always "fail at plan" (B2); judgment checks test a known acceptable and unacceptable case with the real instructions and judge at target size and state what stays unproven (B, C conceded).
- D10 settled in rebuttal: Fix when a leaf adds or changes a second copy without reason and agreement test, or writer and checker reproducibly disagree (B,C). A's trigger dropped: it would flag justified copies.
- Disagreement D9: B wants every new or tightened check to show it accepts real valid output and rejects one focused bad example. A,C: covered by spine 3a, proof-selection 1a and standing-design.md:8, so a new line is a second copy. B's reply: acceptance of valid output outside a chain is not established by those rules.

## Taken
Operator 2026-09-29: "1a | 2a". Peer final check B, C: none.

Q1 = 1a. When one part writes something and another part checks it, the rule lives in one function, schema or data both use. A model writer's instructions state the checker's rule, including limits and required inputs. A design keeping two copies says why and names a test that checks they agree. The chart names the rule's owner when writer and checker sit in different leaves. Tests keep independently written expected results. Review Fix: a leaf adds or changes a second copy without a reason and agreement test, or writer and checker reproducibly disagree. Look-alike code alone is not a Fix; no refactor of unrelated duplicates.
Reason: #11, #12 and #14 were one rule kept or implied in two places.
Foreclosed: 1b tests share the rule too; 1c nothing new.

Q2 = 2a. Applies only to a check whose result depends on how many items exist or how many choices a pool offers. The leaf states what the check needs for the target count, counting what actually renders, and tests at the real target count with the real pool (must pass) and with a too-small pool (must get the refusal the design specifies, at the design's own boundary). A model-judged check of this kind tests one known-acceptable and one known-unacceptable case with the real instructions and judge at target size, and states what stays unproven. No invented numeric bound. An impossible target changes the requirement or generator through design, never by loosening the check. Review Fix when such a check has no stated need or no target-size test. Other checks stay under standing-design.md:8, spine 3a and proof-selection 1a. No review rerun beyond check-issue/SKILL.md:49.
Reason: #16 could never pass at 4 sites and nothing tested it at that size.
Foreclosed: 2b real pass and focused fail for every check (B's view, repeats taken rules); 2c nothing new.
