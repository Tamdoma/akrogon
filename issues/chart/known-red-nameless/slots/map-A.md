# Opening map, slot A

Inspected at main a93fec75 (also the installed release), 2026-11-09.

## Surface

- `knownRedReceipt` (src/verify.ts) is the one place that decides cover. It refuses a red head entry whose `failedTests` names hold `(no test name)` or `(log gone)` before it looks at any base run. Past that guard it covers when a completed base run linked by `compares` at the merge-base holds the same `name` and `command`, red and not blocked, and every head name is among the base names.
- `requireGreenReceipt` (src/verify.ts) calls it, and the phase gates (`check.review`, `check.repair`, `merged --check`, direct-guards) call `requireGreenReceipt`. So one change in `knownRedReceipt` reaches every route named in signpost 5a.
- `failedTests` (src/flaky.ts) returns `['(no test name)']` for a log without a `(fail) <name>` line and `['(log gone)']` for a log that cannot be read. Other callers: `flips` (flaky) and `newRedUnits` (the main-red notice), which already treat `(no test name)` as one unit per command.
- Real records of the reported red (slots/evidence/herdr-setup-pair-2026-11-09.log): head run 980c6312 and linked base run ce2cf1f4 at the merge-base, both completed with setup 0, `shell` at exit 127 on both, both logs present and identical (`bash: bin/herdrapp: No such file or directory`), no `(fail)` line. The main-red notice was shown on the base run. Every fact signpost 3a lists is already recorded; only the name guard refuses.

## Consumers of the rule

- Code: `knownRedReceipt`. Tests: tests/verify.test.ts holds the refusal of an unnamed head against a named base and of a gone log; both stay refused under any option below.
- Seat text: the Shared-context known-red paragraphs of skills/check-issue, skills/implement-issue and skills/merge-issue, and landing step 3 of skills/chart-issues `## Direct route`. Check-issue and implement-issue define the judgment as "the red command logged a real test name and that name also fails on the base"; merge-issue and the direct route say "runner completeness and causal fit" without the definition.
- seed-issue `## Lifecycle filing`: files the base red once the judgment agrees for a configured command. It already takes "the failing test file or command path", so a nameless red files without change. Effect: a covered nameless red files the broken main check as intake by itself.
- Docs: docs/reference/checks.md `## Known red` and its error table row ("or a red log names no failed test").

## Forks

F1 Coverage rule. Two questions shown together.

- Q1 What does the command accept? (a) Drop only `(no test name)` from the guard: the nameless marker then compares like a name, so a nameless head is covered only by a nameless red base entry of the same command, a named head is never covered by a nameless base, a nameless head is never covered by a named base, and a gone log on either side never covers. Removes code. (b) (a) plus the same exit code on both sides for a nameless pair. One more fact; catches some different failures early; the October lock foreclosed exit comparison as the test, not as an added fact. (c) Compare output. Foreclosed by signpost 3a.
- Q2 What must the seat judge before a nameless cover counts? Candidate rule: both logs read whole; the head log shows no failure the base log lacks (a check that prints every error, such as a typecheck or lint, can carry the leaf's new errors beside the base's); the run ended by the command's own verdict, never by a kill, timeout or runner crash; no cause in the diff; and the leaf's own done-criteria proofs still pass on their own (signpost 2a). Option: also refuse any command the seat judges to be a test runner, whatever the failure.

No other material fork found. Text placement follows the repo's existing pattern (each seat skill restates its own rule), not a choice.

## Pitfalls over the lifetime

- A check that lists all errors hides the leaf's new errors among the base's: removed by the seat rule's "nothing on the head the base lacks".
- A crashed or timed-out test run looks nameless on both sides: removed by the seat rule's own-verdict clause and by signpost 2a (the leaf cannot prove its change, so it stops).
- A seat reads the new rule as "any identical exit covers": removed by keeping the judgment gate words and the named-test path unchanged.
- The existing refusal cases get deleted as outdated: both stay true, so the leaf keeps them.
- Skill text reaches seats and doors only at the next release link.

## Split

One leaf: the command change, the four seat texts and the docs change are one outcome. The command without the text leaves seats refusing; the text without the command changes nothing. Nothing in it can be proven alone.

## Observation before handoff

Done: the read-only record read above. It reaches the key parts that exist before the leaf builds (a linked completed pair, both red, both logs kept, no test name). No further call is needed; the changed judgment is the leaf's own proof.
