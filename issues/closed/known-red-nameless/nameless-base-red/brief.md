# Brief: nameless-base-red

## What

`akrogon verify --known-red` covers a red configured check whose log names no test when a completed base run at the merge-base holds the same command red with a log that also names no test. `knownRedReceipt` (src/verify.ts) stops refusing the `(no test name)` marker and still refuses `(log gone)`; nothing else in it, in the name reader or in scheduling changes. Because every receipt gate reads that one function, the leaf, merge and direct-landing routes follow.

The seat rule changes with it, in the known-red paragraph of skills/implement-issue, skills/check-issue and skills/merge-issue and in landing step 3 of skills/chart-issues `## Direct route`: a nameless cover counts as passing only when the seat, having read both logs whole, finds that the head shows no failure the base lacks, that the command ended by its own verdict, and that the leaf's diff holds no plausible cause, with the leaf's own done-criteria proofs passing on their own. A check recorded `blocked` behind a known-red the judgment agrees with stays recorded as not run and does not by itself stop the leaf. docs/reference/checks.md and src/AREA.md state the changed command rule.

No new configuration, no receipt field, no output comparison, no run of a blocked check.

## Why

Tamdoma/akrogon#133: in herdr-setup the configured `shell` check was broken on main and exited 127 with the same one-line output on a leaf's head and on its base. `akrogon verify --known-red` ran the base and still judged `fail`, because a log without a `(fail) <name>` line is refused before any base run is compared, and the leaf stopped for the operator. Every leaf of a repo stops that way until main is fixed by hand. The operator reopened the 2026-10-10 lock on nameless reds as far as the signposts in the design state.

## Done-criteria

1. A configured check that fails on a leaf's head with a log naming no test, and fails as the same command with a log naming no test on the completed base run at the merge-base, is covered: `akrogon verify --known-red` on that head prints `verify known-red <sha>: pass` and exits 0, and the phase move that needs a leaf receipt for that head is accepted. A pair of the same kind in merge scope satisfies the merge receipt gate. It fails on the base and passes after.
2. These are still judged `fail` and give no receipt: a nameless head against a base whose same command names failed tests; a head that names failed tests against a nameless base; a red log that is gone, on the head or on the base. A cover between named failures and a refusal between different named failures behave as before.
3. The known-red paragraphs of skills/implement-issue/SKILL.md, skills/check-issue/SKILL.md and skills/merge-issue/SKILL.md and landing step 3 of skills/chart-issues/SKILL.md `## Direct route` each state the judgment rule and the blocked-check exception of the design's "Coverage rule" decision, and none still says that only a real test name can make the judgment agree or that a blocker is fixed first without exception.
4. docs/reference/checks.md `## Known red`, its `verify known-red <sha>: fail` table row and src/AREA.md's verify paragraph state the changed command rule, and none still says a red log that names no failed test is always uncovered.
