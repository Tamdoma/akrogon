# Comparison

## Question
Q1. How does a seat get per-test outcomes from a check command, given checks are arbitrary commands (framework `hooks:selftest` is a script, `framework:verify` runs stages such as `test:motion-probe` that are not `bun test`)? Seat reads the logs and writes a structured list; a configured machine-readable reporter per check; or both.
Q2. What happens with outcomes that have no test names or are incomplete: build error, crash, setup failure, timeout, a run that stops before later tests?
Q3. Is a failing test rerun with the change once before the without-change run, to separate flakes (Chromium order: with patch, retry with patch, without patch)?

### Carries
- waiting-leaf Taken and binding boundaries F1, F2, F4.
- Base run rule today: skills/implement-issue/SKILL.md:38, skills/check-issue/SKILL.md:63 (both terminal results kept, causal explanation, logs outside the worktree).

## Findings
- better-than-training: `bun test` 1.4.2 offers `--reporter=junit --reporter-outfile=<path>` (local `bun test --help`, 2026-10-10).
- practitioner: Chromium CQ (https://chromium.googlesource.com/chromium/src/+/master/docs/infra/cq.md, read 2026-10-10) runs with patch, retries failing shards with patch, then without patch; fails only for tests failing both with-patch runs and passing without.
- Merged: slots/comparison-merged.md (A, B, rebuttal B). Q1, Q2 agreed (A,B). Q3 retry scope differs: A failing units only, B same command and scope.

## Taken
Operator, 2026-10-10: "1a | 2a | 3a"

Decision:
- Q1 1a: the seat reads both complete logs and writes one structured comparison record per red check (command, args, scope, leaf and counterpart revisions, material conditions, per unit runner/stage, file/suite, full name, outcome each side with log reference, both log paths, completeness). The command validates function only: record parses, states valid, nothing blank, evidence files exist. Native reports are optional evidence. Absence is not pass. skills/check-issue/SKILL.md:59,63 and skills/implement-issue/SKILL.md:38 are rewritten to match.
- Q2 2a: a missing, crashed, timed-out, short-circuited or skipped unit is unverified, never known-red, and blocks (repair path, or the existing incomplete-verification stop with its cause). A non-test error on both sides never exempts the tests it prevented.
- Q3 3a: one with-change retry of the same command, args, scope and configuration after a completed test failure, before any base run. Green retry: recorded on the leaf as inconsistent (flaky), no base run, review still binds. Red retry: per-test base comparison. Retry budget recorded in leaf evidence so a session replacement does not reset it.
Reason: arbitrary check commands have no common format, so judgment stays with the seat and the command checks function only; incomplete runs hide tests; isolated retries change order and shared state (Chromium CQ).
Foreclosed: mandatory reporter per check; log parser; command-exit comparison; crash exemption; retry of failing units only; no retry.

