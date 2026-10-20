# Leaf review brief (merge-solo handoff)

Operator approved handoff 2026-10-19: "1a" (both leaves, lifecycle, debate no) and "1a - also use claude code with opus 5.5 medium effort for both of these issues as slot A".

Review each draft as the implementer who must build it. Drafts (read all):
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fa8e51c-838c-4286-a49e-3944a99601c8/scratchpad/merge-solo/ISSUE.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fa8e51c-838c-4286-a49e-3944a99601c8/scratchpad/merge-solo/solo-turns/brief.md, design.md, readiness.yaml
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/6fa8e51c-838c-4286-a49e-3944a99601c8/scratchpad/merge-solo/green-merge/brief.md, design.md, readiness.yaml

Binding: forks/stack-fate.md Taken (1a, 2a, 4a, 5a, 3a). Rules: /home/ivan/.claude/skills/chart-issues/assets/shapes.md (Leaf files, Preflight and validation) and /home/ivan/.akrogon/releases/b5a877c1c21d952e7ef86579e8eacecbd582aa5f/skills/chart-issues/assets/standing-design.md. Code: /home/ivan/Work/infra/akrogon/src (batch.ts, next.ts mergeTurn/reconcileBatch, phase.ts merge path, attempts.ts, state.ts, verify.ts), skills/merge-issue/SKILL.md.

Return disagreements only, each with evidence (path:line or source) and the exact replacement text you propose. Cover:
1. Can each done-criterion be met inside the leaf's ownership? Any criterion that names a test, a count, or a repo-health claim?
2. Missing consumers of removed or changed state (batch.members, mergeContext, slots on merge->merged, status/timing readers).
3. green-merge "Where the run executes": pane process vs transient unit vs other. Pick one with reasons, or say the plan should choose.
4. solo-turns in-flight records: strip an empty members list in readState, or not?
5. Anything that breaks 2a or 1a as the operator took them.
Write "no disagreement" for a point you accept.
