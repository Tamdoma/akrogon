# Comparison, merged notes (A: comparison-A.md, B: comparison-B.md)

## Q1 per-test outcomes
- Pick (A,B): the seat reads both complete logs and writes one structured comparison record per red check: command, args, scope, leaf and counterpart revisions, material conditions, per unit (runner/stage, file/suite, full name) the outcome on each side with a log reference, both log paths, completeness. Native reports (bun junit) are optional evidence, never required. Absence is not pass.
- Mechanical check (A,B): the command validates function only: record parses, states valid, nothing blank, evidence files exist. (A) logs must be newer than the seat's `prompted_at`, which removes the #77 stale-log class mechanically.
- Rejected (A,B): mandatory reporter per check (covers bun test only; motion-probe and stage runners are scripts, framework package.json:8,158,162-166); a log parser; command-exit only (operator chose per test); a fake test named after a whole command.
- (B) skills/check-issue/SKILL.md:59 blanket command-red blocker and :63 must be rewritten to match.

## Q2 unnamed or incomplete outcomes
- Pick (A,B): a unit whose run is missing, crashed, timed out or never ran is unverified, never known-red; unverified blocks and takes the repair path, or the existing incomplete-verification stop with its cause when the proof cannot be completed in scope. A build, setup or crash error on both sides never exempts the tests it prevented from running (B). Short-circuited or skipped stages count as missing coverage (B).
- Difference: (A) a both-sides identical terminal build/setup error naming the same unit could count as known-red; (B) no automatic exemption for non-test failures. A accepts B's stricter rule.

## Q3 flakes
- Pick (A,B): one bounded with-change retry after a completed test failure, before any base run; green retry is recorded as inconsistent (flaky) evidence on the leaf, no base run, review still binds; red retry goes to the base comparison; budget recorded so a session replacement does not reset it.
- Difference: (A) retry only the failing units (file or test) to save time; (B) same command and scope, because isolated reruns change order and shared state (Chromium CQ warns isolated retries can differ). Cost of B: one more full run, about 15 min on framework verify (approximate, from INTAKE).

## Added (A,B)
- Where flaky and inconsistent results are recorded and owned: red-record.

## Corrections after rebuttal (comparison-rebuttal-B.md)
- R1 accepted: log freshness vs `prompted_at` is not a complete guard (mtime is not run identity; it would also block cross-leaf reuse). Moved to base-evidence-reuse as a candidate signal; the comparison record carries run identity, completed result and provenance.
- R3 accepted: reporters are rejected for migration cost on every check plus bun junit's limited coverage, not technical impossibility.
- R4 accepted: flaky results stay in leaf evidence; whether red-record also owns them is open there.
- R2 held: retry scope stays a difference for the operator.
