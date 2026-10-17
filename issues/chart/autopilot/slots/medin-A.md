# Cole Medin material, notes A (written before reading B and C)

Revision f7baddc. Source: sources/cole-medin-ai-software-factory.txt, a Gemini summary of youtu.be/GQatuTWSRqY. Video title confirmed by WebFetch 2026-10-16 ("My AI Dark Factory Dream Is Dead (Here's What Actually Works)"). Transcript not reachable, so Medin claims below are as summarized.

## Pick
Medin's split is: the human owns intent at the start (scope, out-of-scope, the checks that prove it works) and verifies the batch at the end. The middle runs alone. Akrogon's charting door is his start stage. So autopilot charting automates the stage he and Horthy keep human. That challenge holds in part. It does not hold for the 89% of answers that follow from evidence and stated intent. It does hold for the 9% where the operator wrote his own text, which is where his intent was not yet on the page.

What to take:
1. A switch-on brief that states intent: the work named, what is out of scope, and what "I would hate this" looks like. Changes Switch (what switch-on must contain) and Boundary Q3 (out-of-scope makes scope edges checkable).
2. Medin's "Intent Question" as the Boundary test: "If this passes every check, could the operator still hate the result?" When a fork's answer is a product or taste choice not settled by the brief, evidence or an earlier answer, hold. Changes Boundary Q1 (gives 1a a concrete test for "only you know").
3. Rule self-modification as a named failure (his Failure Mode 3). Supports always holding changes to hold rules (Q1) and is evidence on Q6.
4. Blast radius: agents merge to staging, never production. Akrogon leaves merge to main. Supports Q2a (no direct overnight).
5. Batch review at the end with its stated cost: a wrong early pick is built on before the human sees it. Changes Morning record: the record is a batch review of A's picks, and a pick that leaves build on should be visible before they merge or accepted as a cost.
6. HITL toggles per step, off by default only where blast radius is low. Supports a per-session switch with holds by action kind, not one global switch.

Cost: the intent brief is operator work at switch-on (Medin: "Requires consistent upfront human planning energy").

## Rejected
- Keep charting fully human (strict Medin/Horthy reading): contradicts the operator's intake and his record of taking the recommendation 89% of the time.
- Holdout scenarios hidden from the builder: a lifecycle concern (review seat vs implementer), off route here.
- Manager agent on a timer: the operator's watcher already fills that role and is off route.
- Complexity router / model routing: lifecycle and cost, off route. Only Q5 touches it.

## Evidence
- operator · INTAKE.md 2026-10-16 Medin source · intent and out-of-scope stay human, batch verification at the end, rule self-modification is a failure mode.
- practitioner · Dex Horthy, "Why Software Factories Fail", AI Engineer World's Fair 2026, ai.engineer/talks/harness-engineering-is-not-enough-why-software-factories-fail, read 2026-10-16 · human judgment moves earlier: product review, architecture, program design · this is the same stage as charting, so it argues for holding product and architecture choices that the brief did not settle.
- operator · INTAKE.md operator record · 89% recommended, 2% other option, 9% own text.
- Search 2026-10-16 for a primary Medin statement found only secondary blog summaries (stork.ai).

## Pitfalls
- P1 "Could he hate it" becomes a blanket hold: removed by the test applying only when brief, evidence and earlier answers do not settle it, with the hold naming the unsettled preference.
- P2 Wrong picks get built before the morning: removed or accepted in the Morning record fork (show picks per leaf, or delay starting leaves with intent-heavy picks).
- P3 The Gemini summary misstates Medin: removed by citing Horthy's talk page for the claims the round relies on.

## Questions the chart does not ask
- Q-M1 Should switch-on require an intent brief (out-of-scope and "would hate" lines), and does A hold when it is missing? (Switch fork)
- Q-M2 Should leaves built on a held-type pick wait for the morning instead of the watcher starting them? (Watcher seam / Morning record)
END medin-A
