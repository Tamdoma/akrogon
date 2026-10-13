# Fork notes brief: guarantee (slot B, blind)

Task: write blind fork notes for one question, in the five parts defined in /home/ivan/.claude/skills/chart-issues/assets/questions.md section "Blind peer exchange" (pick with reason and cost; each rejected option with reason; evidence with tier, source, date; pitfalls with what removes each; questions the fork does not ask). Your own position only. Do not read other slots' files under /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/slots/ except your own map, and do not read /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/slots/map-merged.md or /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/forks/.

Intake: /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/INTAKE.md.

Question Q1. What must "one heavy test run at a time on this host" mean after this incident, and where is it enforced?
- 1a Keep the current boundary and say it plainly: the permit serializes only akrogon run-check and base-run; anything else a seat starts is bounded by the akrogon.slice ceiling and stoppable, never queued. The patch is seat instructions plus a long-run path (separate fork), and the limit-boundary residual is written down.
- 1b Gate the heavy entry points themselves: each registered repo's heavy test scripts (framework test:changed = .claude/workflow/scripts/run-test-changed.ts, package.json:11) re-enter through akrogon run-check when AKROGON_RUN is absent, using the existing nested path (src/permit.ts:94-98). Adds a framework destination.
- 1c Per-run scope plus throttled panes: run-check moves its admitted child into its own scope with the full quota; pane scopes get a small CPUQuota so raw runs crawl. Reopens permit-release (per-run units foreclosed).
You may propose another option.

Carries (locks, binding unless the operator reopens): /home/ivan/Work/infra/akrogon/issues/chart/host-test-load/forks/limit-boundary.md Taken, permit-release.md, heavy-runs.md, queue-order.md, ceiling-values.md. Related open forks in this chart (not yet researched): long-run path (how a seat runs a queued 12+ min check under a 120-600 s tool limit), evidence (does a raw run count as proof), queue visibility, ceiling trigger reading.
Operator corrections so far: none.

Research: practitioner first for anything outside the repo (who serializes heavy test suites on shared hosts and where they put the gate), then primary docs/code. Cite tier, source, date.

Return: write to /home/ivan/Work/infra/akrogon/issues/chart/permit-bypass/slots/guarantee-B.md and nothing else.
