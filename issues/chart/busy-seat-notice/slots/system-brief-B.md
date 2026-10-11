# Brief, slot B: why leaves can run 4+ hours (systems analysis)

Operator, verbatim: "It shouldn't even be possible to have four hour leaves. It's something with how the implement issue assigns work. So that's probably a bigger question, not whether we should patch it or not. ... get to the bottom root cause of the problem that even makes it possible in the first place to create such long leaves. Look at it ... from the perspective of a systems thinker. What are the bottlenecks in the system? How does the stock and flow analysis help here? What is the stock? What is the inflow and the outflow of this particular system, primarily implement issue? What are the reinforcing loops that are reinforcing bad behavior? And what are the balancing feedback loops that don't have calibrated targets or the targets are wrong, or the sensor is wrong?"

Task: independent analysis (do not read other slots' system-*.md files). Ground every claim in a path:line or log record.

Primary case: framework leaf /home/ivan/Work/infra/tamdoma/framework/issues/open/formspark-api/formspark-build-wiring (state.yaml: check.fix, fix_rounds 3, 8 implementation briefs, review-B.md 61KB; worktree /home/ivan/Work/infra/tamdoma/framework/issues/worktrees/formspark-build-wiring; git log of its branch; framework issues/log.jsonl records for that slug). Compare with 2-3 other long or short leaves from framework issues/log.jsonl (phase durations from consecutive records) to see whether this is one leaf or a pattern.

Mechanism sources (akrogon, /home/ivan/Work/infra/akrogon): skills/implement-issue, skills/check-issue, skills/plan-issue, skills/merge-issue, src/routing.ts, src/phase.ts (fix_rounds cap :307-320, review aggregation :290-305), the chart-issues door that sizes leaves (/home/ivan/.claude/skills/chart-issues/assets/shapes.md, standing-design.md).

Answer, compactly:
1. Stock(s): what accumulates (work in a leaf, findings, proof cases, commits, time) and its unit.
2. Inflows and outflows for implement and check: what adds work to a leaf after handoff, what removes it; measured rates where the log allows.
3. Bottlenecks: where time actually went in the primary case (minutes per phase/round, per proof rerun).
4. Reinforcing loops driving long leaves (e.g. review finds more -> repair adds proof -> more to review), each with evidence.
5. Balancing loops whose target is missing, wrong or whose sensor is wrong (leaf size at charting, fix_rounds cap, review bar, proof scope, the 60 min stall notice), each with evidence.
6. Root cause in one paragraph, and the 1-3 highest-leverage changes (change a target, a sensor, a rule or a structure), each with what it would break or invite later. Prefer removing the cause over adding a monitor. The operator dislikes added complexity.

Return path (write only this file): /home/ivan/Work/infra/akrogon/issues/chart/busy-seat-notice/slots/system-B.md
