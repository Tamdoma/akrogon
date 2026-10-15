# Brief: implementer review of the Q3 leaf draft

Operator chose 3a: one small akrogon lifecycle leaf adding an issue-to-merged view to `akrogon timing`, and paused factory rule changes until about 20 leaves run under today's rules. Chart files: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/CHART.md`, `forks/flow-view.md`.

Draft (not yet handed off): `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/draft/issue-flow/` (ISSUE.md, issue-flow-report/brief.md, design.md, readiness.yaml, state.yaml).

Read it as the implementer and planner would, against the akrogon code (`src/timing-report.ts`, `src/pull.ts`, `src/state.ts`, `src/log.ts`, `src/akrogon.ts` timing case, `tests/fake-gh.ts`) and `skills/chart-issues/assets/shapes.md` (leaf files, done-criteria audit) and `standing-design.md`. Read-only, no lifecycle commands.

Return disagreements only, each with path:line or a command you ran:
1. A criterion that cannot pass within the leaf's ownership, or that the shapes audit refuses.
2. A field or rule that forces the implementer to guess, or that is wrong against the records (`issues/log.jsonl`, leaf `state.yaml` files, the GitHub listing).
3. Anything simpler that gives the same view, or a column that adds no decision value.

Under 25 lines. If none, one line saying so.

Return path by seat:
- B: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/draft-review-B.md`
- D: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/draft-review-D.md`
- E: `/home/ivan/Work/infra/akrogon/issues/chart/system-flow/slots/draft-review-E.md`
