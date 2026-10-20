# bound-unit notes, slot A (written before reading B and C)

Pick: the bound counts paid launches of a named proof command, written per operation in the grant's free-text `bounds`, with each launch's fan-out named. Example: "run-satellite-live-replay.ts --case plumbing: at most 2 runs, each up to 12 claude -p sessions; any other claude -p launch, probes included: at most 2". One run of a named command counts as one, whatever it spawns inside, because the grant names its fan-out. A paid launch that is not one of the named commands counts as its own unit against the "any other" line, so splitting one proof into many small launches uses up the small line fast instead of dodging the big one. The door writes the numbers at charting from the plan's fresh-call needs under fresh-run-need 1a (normally 1 fresh run per model-facing change, plus 1 rerun), and the operator approves them at the handoff review, where the worst-case line (runs x sessions) already sits. No schema change: `bounds` stays text, `operations` already names commands.

Parallel seats without new state: under fresh-run-need 1a, review seats judge recorded evidence, and only the seat that owns the phase's proof launches a fresh paid run (A at implement end and check.fix, B in check.repair, merge never). A seat reads the consumed count from the leaf's pass artifacts (`implementation/report.md`, `review-*.md`) before launching, and records the launch before and the result after. Two review seats never both launch, so no reservation or lock is needed. implement-issue overlap already keeps workers off a slow run's resources.

Raising an exhausted bound: one action. The seat stops on the existing blocker path, naming the grant and the consumed count. The operator edits that grant's `bounds` and `approved` (by, date, answer) in readiness.yaml, then resumes the leaf the same way as any blocker. No new command.

Changes:
- chart-issues Take grant paragraph: "repeat and recovery bounds" becomes "bounds counted per named operation run, with each run's fan-out named, and one bound for any other paid launch".
- implement-issue and check-issue reuse sentence (already changing under limit-mechanism 1a): "compares ... remaining bound" reads the consumed count from the leaf's pass artifacts; only the phase's proof owner launches.
- check-issue check.review: review seats launch no fresh paid run; a needed one is a Fix for check.repair or an operator action.

Rejected: count sessions. The seat cannot see how many sessions a runner spawns until it has run, so the count is only known after the money is spent. Rejected: count tokens or dollars. That needs logs per harness and was ruled out as a counter in limit-mechanism. Rejected: a lock file or reservation for parallel seats. New state, and unneeded once only one seat launches.

Evidence:
- better-than-training: src/readiness.ts grantSchema (operations list, bounds text, approved block), read 2026-10-19. skills/check-issue/SKILL.md Shared context operator-only paragraph; implement-issue overlap rule.
- intake: replay runs cost about 13M input tokens each, and hub-child-links ran 12 claude -p phases per replay.
- practitioner: Anthropic multi-agent research post (C cited it in limit-mechanism): effort is set per task as counts of agents and tool calls, not dollars. Training knowledge otherwise.

Pitfalls:
- The fan-out grows after approval (a runner adds stages): the named fan-out is part of the grant, so a bigger run is outside it and needs new approval.
- Count lost after compaction: the count lives in the pass artifacts, not memory; unknown stops (limit-mechanism 1a).
- A review seat needs fresh evidence: it routes through check.repair or Operator actions, not its own launch.

Question the fork does not ask: should the handoff review's live-run line be computed from the grant (runs x sessions) so the two cannot disagree?
