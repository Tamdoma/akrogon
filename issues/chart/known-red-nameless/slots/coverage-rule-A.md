# Fork notes, coverage-rule, slot A

## Q1

Pick: 1a. The refusal in `knownRedReceipt` keeps `(log gone)` and drops `(no test name)`; the existing subset comparison then does the rest. Reason: it removes a special case instead of adding a path, changes nothing for named reds, and matches the facts signpost 3a lists (same command, both red, both runs complete, both logs present). Cost: two different nameless failures of one command are machine-eligible, and only the seat refuses them.

Rejected:
- 1b: it removes a working mechanical refusal (a head failing test `beta` against a base failing `alpha`) and hands it to seat judgment alone. Signpost 1a reopens the lock narrowly and 5a says nothing else moves; the named path is something else.
- 1c: the same failure gives the same exit, but different failures mostly share exit 1, so the added fact catches little that reading two logs does not; it adds a condition and a case, and the October lock foreclosed exit comparison.

Evidence:
- better-than-training, src/verify.ts `knownRedReceipt` and src/flaky.ts `failedTests`, read 2026-11-09: with `(no test name)` out of the guard, a nameless head yields `['(no test name)']`; a named base yields real names and does not include it; a nameless base does; a gone base log yields `['(log gone)']` and does not. Every listed outcome of 1a follows from the existing subset line with no new branch.
- better-than-training, slots/evidence/herdr-setup-pair-2026-11-09.log, 2026-11-09: the reported pair holds every fact 1a needs.
- better-than-training, tests/verify.test.ts `a linked pair fails to satisfy requireGreenReceipt with unnamed or unlinked failing work`: its unnamed case pairs a nameless head with a named base and its gone case a gone head; both stay refused under 1a.
- model-knowledge: no outside practice was searched for Q1; it is this repository's own mechanism.

Pitfalls:
- A head log gone with a base log gone would compare equal if the guard were dropped whole: 1a keeps `(log gone)` refused.
- Reporting identity (`flips`, `newRedUnits`) changing: 1a does not touch `failedTests`.

## Q2

Pick: 2a. Reason: it is signpost 2a and 3a written as the seat's duty, and it needs no knowledge of what kind of command ran. Cost: the judgment is prose a test cannot prove; a seat can judge wrongly.

Rejected:
- 2b: "is this a test runner" is a second judgment that 2a's clauses already cover: a runner that crashed is not an own-verdict end, and a runner that could not load hides the leaf's own tests, so the leaf's done-criteria proof fails and it stops.

Evidence:
- better-than-training, skills/check-issue/SKILL.md and skills/implement-issue/SKILL.md known-red paragraphs, read 2026-11-09: the judgment is defined as "the red command logged a real test name and that name also fails on the base"; skills/merge-issue/SKILL.md and skills/chart-issues/SKILL.md `## Direct route` step 3 say "runner completeness and causal fit" without the definition. All four need the nameless clause.
- better-than-training, docs/reference/checks.md `## Known red` and its error-table row, and src/AREA.md's verify paragraph: they state the named-only contract.
- practitioner, Chromium CQ (carried from red-base-wait comparison Findings, read 2026-10-10): without-patch runs excuse only failures that also fail without the patch; nothing there excuses a failure the patch could have caused, which is 2a's diff clause.

Pitfalls:
- A typecheck or lint prints every error, so the leaf's new errors sit beside the base's: the "no failure the base log lacks" clause.
- A timed-out or killed command: the own-verdict clause.
- The command's `pass` read as approval: each seat path keeps "counts as passing only when that judgment agrees".

## A question the fork does not ask

None. Where the texts live follows the repo's pattern of one restated rule per seat skill.
