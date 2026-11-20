# Brief: independent map, watch-live-speed (slot B, C or E)

## Reading rule

Read process text by named section for the step you answer: locate the section before reading it, batch independent reads in one call with bounded output, and read content you already hold at most once. Name sections, never line ranges. You choose your own evidence.

## Context

Read /home/ivan/Work/infra/akrogon/issues/chart/watch-live-speed/INTAKE.md first (operator words, the watcher's facts, prior charts). The leaf is /home/ivan/Work/infra/akrogon/issues/open/watch-any-harness/watch-timer (brief.md, design.md, plan.md, readiness.yaml, state.yaml, implementation/ logs and e2e-*/ folders). Its worktree is /home/ivan/.akrogon/worktrees/akrogon/watch-timer (scripts in skills/watch-issues/scripts/, live test tests/e2e/watch-live.e2e.ts, tier tests/e2e/watch-tier.ts). Its chart is /home/ivan/Work/infra/akrogon/issues/chart/watch-any-harness (CHART.md, forks/timer-design.md Taken and Corrections, P1-P13). Prior speed and proof-cost charts: issues/chart/{leaf-speed,system-speed,proof-cost,paid-proof-bounds,cross-leaf-proof,changed-test-proof,proof-limits-handoff}; check what they decided and what landed before proposing it again. Lifecycle skills: /home/ivan/.claude/skills/{plan-issue,implement-issue,check-issue}/SKILL.md and chart-issues assets/standing-design.md.

Locks: the operator's signposts for watch-any-harness (forks/signposts.md Taken and Corrections) stay; the N1 grant (8 paid harness sessions for the leaf, each within 10 minutes) is the operator's bound.

## Questions (answer each, with evidence path per claim)

1. Root cause of the shell-shape failure "receipt due=1 missing" (claude-shell, codex-shell, pi-shell): is it a product defect in the timer scripts, a test defect, or a design defect in the pin or receipt rule? Cite the implementation logs and code.
2. Why did the leaf take ~4h and launch 19 paid harness sessions against a grant of 8? Rank causes by time and cost, with evidence. Name what should have stopped it and did not.
3. What to do with the running leaf now: stop, let finish, fix in place, or re-chart (and into what leaves)? State the cost of each.
4. How to make leaves like this much faster and better, at every layer: chart (scope, proof design, grant shape), plan, implement (fast-fail order, reruns, worker visibility), test machinery (parallel tiers, stand-in coverage), and enforcement (grant counting). For each change: what it removes, what it could break, and whether a prior chart already decided it.

## Rules

Independent view: do not read other slots' files under issues/chart/watch-live-speed/slots/. Read-only; start no agents; run no paid session; do not touch the running leaf, its seats or its worktree. Under 60 lines.

## Return

Write to /home/ivan/Work/infra/akrogon/issues/chart/watch-live-speed/slots/map-<your slot letter lowercase>.md, then run: hc send t126 "done <your slot letter>: <return path>"
