# Leaf review brief: seed-decisions, slot B

You are slot B. Same reading rule and limits as your earlier briefs (read process text by named section, bounded output, content already held read at most once; name sections, never line ranges; edit nothing outside your return file; read-only commands only).

Read the draft files in /tmp/claude-1000/-home-ivan-Work-infra-akrogon/48f33098-9add-4352-b6e7-36b108a68792/scratchpad/handoff/operator-decisions: ISSUE.md, seed-decisions/brief.md, seed-decisions/design.md, seed-decisions/readiness.yaml, seed-decisions/state.yaml. Check them against the forks' `## Taken` under /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/forks/ and shapes.md `## Leaf files` and `## Preflight and validation` (/home/ivan/.claude/skills/chart-issues/assets/shapes.md).

Task: review as the implementer who must build this leaf. Return disagreements only, each with evidence and the exact change you want: a done-criterion that cannot be met inside ownership or that the shapes audit refuses, a binding decision missing from the design or misplaced, an owned surface or consumer missing, anything an implementer would have to guess, any private text, any readiness field that does not fit. "none" is valid. Under 40 lines.

Write to /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/leaf-review-B.md, then run:
hc send t126 "done B: /home/ivan/Work/infra/akrogon/issues/chart/operator-decisions/slots/leaf-review-B.md"
