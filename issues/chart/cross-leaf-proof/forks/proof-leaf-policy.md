# Proof leaf policy

## Question
Q1. May a proof leaf fix cross-leaf defects in its own branch with a fail-first test instead of reopening the owning leaf, and what bounds that (for example no locked decision changed)?
Q2. May debug runs resume from the failed stage, and what must a reuse argument name (code, inputs, config, artifacts still valid, downstream consumers rerun)?
Q3. Should proof runs collect every independently evaluable failure in one pass, and may stand-ins feed later stages in diagnostic runs (never as acceptance evidence)?
Q4. Is the final evidence one clean run, or a resumed run with named weakened invariants?

### Carries
- Map M1, M3. B4, C2, C4 corrections (slots/proof-selection-merged.md "Map corrections").
- Taken: forks/proof-selection.md and forks/spine-growth.md "## Taken". With a grown spine, the final live run proves only what recorded stages cannot (C).
- Operator style: very plain words, one concrete example per question.

## Findings
Independent rounds: slots/proof-leaf-policy-A.md, -B.md, -C.md. Merged: slots/proof-leaf-policy-merged.md. Rebuttals: -rebuttal-B.md, -rebuttal-C.md.

- better-than-training · live-replay design.md:41-42,48,119, brief.md:36, plan.md:29 (checker "first failure wins"), report.md:783-788 (run table), read 2026-09-29 · defects went to new leaves, every fix forced a from-scratch run, checker stopped at first failure · all three rules multiplied reruns. (A,B,C)
- better-than-training · implement-issue/SKILL.md:31 (`failed` only for steps physically needing the operator), :37 (locked decision never changed in plan notes), worker-protocol.md:21-25 (B repairs integration failures between workers) · a design-change stop needs a skill line; it is not today's rule (B).
- practitioner · Mokhov, Mitchell, Peyton Jones, Build Systems a la Carte, ICFP 2018, https://www.microsoft.com/en-us/research/wp-content/uploads/2018/03/build-systems-final.pdf (C) · incremental result equals clean when every step depending on a change reruns · sets the reuse rule. Bazel --keep_going, https://bazel.build/docs/user-manual (C) · continue targets whose inputs built. Jenkins restart from stage, https://www.jenkins.io/doc/book/pipeline/running-pipelines/#restart-from-a-stage (B) · restart keeps original inputs, does not justify mixing revisions. Buildkite promise job failure, https://buildkite.com/docs/pipelines/configure/promise-job-failure (B) · keep testing while already failing.
- Consensus on in-branch fixes, resume, collect-all and reuse-valid final proof. Rebuttal changes: rerun the earliest affected stage and its affected consumers, not every later stage (B1); a check runs when its own prerequisites are valid, product gates still stop (B2); applies to future designs only, existing contracts change only by operator (B3).
- Disagreement D7: a fix needing a locked-decision change. A,C: end the pass with `failed` naming the decision (needs a new implement-issue line, B4). B: record the conflict for review. C rebuttal: review verdicts cannot make a design decision, so B's path lets the implementer choose design.
- Disagreement D6: B would ask separately whether diagnostic stand-ins are allowed; A,C fold it into Q3.


## Taken
Operator 2026-09-29: "1a | 2a | 3a | 4a". Peer final check: C none; B found that "earliest changed stage" misses a second independent change, corrected below within 2a's intent.

Scope: future designs of any leaf whose criteria include a slow or live run. Existing leaf contracts change only by operator.

Q1 = 1a. The proof leaf fixes a bug in another leaf's code in its own branch when the fix meets an already-settled requirement: no locked decision changed, no new feature, no changed acceptance rule. Each fix gets a fail-first test at the cheapest level in the owning code's own tests, is listed in the implementation report and gets normal review. A fix needing a locked decision changed ends the pass with `akrogon phase <slug> failed --reason` naming the decision; implement-issue/SKILL.md gains this line beside :31.
Reason: a leaf per bug cost a full lifecycle; review cannot make design decisions.
Foreclosed: 1b record design conflicts for review (B's view); 1c new leaf per bug.

Q2 = 2a. A debug run reruns every stage whose code, inputs or config changed, plus every stage that consumes their outputs; unchanged, unaffected stages keep their saved results. The report names the saved run's commit, what changed and which stages it feeds. Shared files, lockfile or environment count as inputs to every stage reading them. If validity cannot be shown, restart from the last trustworthy point or from scratch.
Reason: rerunning what depends on a change equals a clean result at a fraction of the time.
Foreclosed: 2b always from scratch.

Q3 = 3a. Every check whose own prerequisites are valid runs; checks with invalid prerequisites are marked blocked, not passed; the run still ends failed; product gates still stop the product. Stand-ins only in a separate diagnostic run, named, never proof. Follow-on failures grouped under their root.
Reason: one run finds every independent bug.
Foreclosed: 3b stop at first failure.

Q4 = 4a. Final proof is one result at the final commit where every stage ran there or passes the Q2 rule, listed with its source commit. A clean full run only when reuse can't be shown or when fresh start, uninterrupted order or whole-run behavior is itself under test.
Reason: same strength as a clean run without repeating unchanged hours.
Foreclosed: 4b always clean; 4c resumed with waived checks.

Homes: standing design; chart states repair scope and final-proof rule; plan names restart boundaries; implement-issue records fixes and reuse in its report and gains the design-stop line; check-issue judges under current rerun rules.
