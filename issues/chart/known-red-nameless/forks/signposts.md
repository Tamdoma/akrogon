# Signposts: known-red-nameless

Original for the door session opened 2026-11-09T19:27:58Z in door t15 (chart known-red-nameless). Autopilot: the operator answers this round once, A answers every fork after it. Angles merged from slots/signposts-A.md and slots/signposts-B.md. From the latest earlier record (issues/chart/merged-batch-cleanup/forks/signposts.md) only proof spending carries over (its 6a, here 6a); its other questions were about that chart's cleanup pass.

Settled by the operator's words, not asked: autopilot, lifecycle route, consultant B (codex), one handed report (#133), nudge the watcher in the w-akrogon tab after handoff.

## Question

1. The 2026-10-10 lock (issues/chart/red-base-wait/forks/comparison.md, Q2 2a: a red that names no test is "unverified, never known-red, and blocks"; foreclosed "command-exit comparison; crash exemption"): does it reopen?
   - 1a (recommended, A,B) Reopen it narrowly: a configured check whose red names no test may be covered by the same red on its base. A missing log or an unfinished run still never covers.
   - 1b Keep the lock whole; the broken check on main is fixed first and leaves wait for it.
   - 1c Reopen it fully: the same non-zero exit on both sides covers any command.
   - Steers: the destination, the mechanism fork, the seat rule text, which existing tests change.

2. What about work the shared failure hides (the reported check stops at its second file, so its third file is never checked on either side)?
   - 2a (recommended, B; A agrees) The leaf must still prove its own change by its done-criteria; untouched work hidden by the same base failure does not stop it. A red the leaf's diff could have caused is never covered.
   - 2b Every hidden unit must run before the red counts as covered, so a check that stops early never qualifies.
   - 2c Hidden work is waived whenever the red is covered.
   - Steers: how the seat judges, the negative cases the leaf must refuse, whether a crashed test run can ever qualify.

3. Who decides that head and base failed the same way?
   - 3a (recommended, A,B) The command checks function only (same command, both red, both runs complete, both logs present) and the seat judges the cause from the two logs and the diff, as it does today for named test failures. Different checkout paths in the output do not disqualify.
   - 3b The command decides alone: identical output and exit, any difference blocks.
   - Steers: code size, whether output needs normalizing, how much the seat text changes.

4. New configuration?
   - 4a (recommended, A) None: no per-check kind or marker a consumer repo must set.
   - 4b One config key that marks a check as naming no tests.
   - Steers: whether every consumer repo gets the fix without an edit.

5. Reach.
   - 5a (recommended, A,B) Every existing known-red route for a configured check (implement end, review, merge, direct landing) follows the one changed rule. Nothing else moves: done-criterion proofs stay blocking, and the herdr-setup check and its stopped leaf stay outside this chart.
   - 5b Only check.review and the reported syntax-check case.
   - 5c Also repair the consumer's check, recover its stopped leaf, or change how a leaf stops when a red is not covered.
   - Steers: owned surfaces, leaf count.

6. Proof spending.
   - 6a (recommended, A,B; same as the last session) No paid calls and no live changes: local tests on isolated fixtures, red before and green after. No replay on the herdr-setup leaf.
   - 6b A live replay on the stopped herdr-setup leaf.
   - Steers: needs sheet, proofs, grants (none).

Reply key: `1a 2a 3a 4a 5a 6a`, or numbered free text.

Challenge check: B holds that 1 and 2 must be settled by the operator in words and never inferred by a later fork, since 1a changes an operator lock; A agrees. 4 is an A-only angle with no contrary position from B.

## Taken

Operator, 2026-11-09T19:40Z (door t15): "1a | 2a | 3a | 4a | 5a | 6a"

What the session prioritizes and gives up (A's account of those answers): a configured check whose red names no test can be covered by the same red on its base, on every existing known-red route, with the command checking facts only and the seat judging the cause; the leaf still proves its own change, and a red its diff could have caused, a missing log and an unfinished run never cover. It gives up a mechanical output comparison, any new configuration, any change to how an uncovered leaf stops, work in herdr-setup and a live replay.

## Needs

none (asked with this round, 2026-11-09T19:33Z; the operator's reply added no row). No key, login, file, grant, paid approval or operator-decided close is foreseen.
