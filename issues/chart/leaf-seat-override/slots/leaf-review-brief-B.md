# Leaf review brief for slot B

Role: implementer review. You are the agent that will receive each of these leaves and must implement it from the brief and design alone. Return only disagreements with evidence (file and line, command output, or a doc citation). Agreement is one line: `No disagreements`.

Drafts (read every file in each folder):

- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d37e972e-0280-4777-9a14-780b925a82b1/scratchpad/drafts/seat-override/ISSUE.md
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d37e972e-0280-4777-9a14-780b925a82b1/scratchpad/drafts/seat-override/index-seats/
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d37e972e-0280-4777-9a14-780b925a82b1/scratchpad/drafts/seat-override/subagent-seat-model/
- /tmp/claude-1000/-home-ivan-Work-infra-akrogon/d37e972e-0280-4777-9a14-780b925a82b1/scratchpad/drafts/seat-override/door-seat-capture/

Locks (taken by the operator, not open for review): issues/chart/leaf-seat-override/forks/setting-home.md, forks/worker-model.md, forks/visibility.md, each under `Taken`. Contract shape rules: skills/chart-issues/assets/shapes.md (leaf folder, brief, design, readiness) and skills/chart-issues/assets/standing-design.md.

Surfaces to check against: src/config.ts (seats, effectiveConfig), src/next.ts (launch 252-260, pane start 405-437, allocation 655), src/status.ts (note 96-120, statusCommand 294-308), src/state.ts (readState, leavesUnder), src/shell.ts (quote), config.yaml line 12, tests/helpers.ts, tests/*.test.ts for the existing test style.

Questions to answer per leaf, only where you disagree:

1. Can you implement it without guessing? Name each place a decision is missing.
2. Is any done-criterion untestable, or testable only by wording (forbidden by LESSONS 2026-10-01)?
3. Does any leaf touch a surface another leaf owns, so the three cannot run in parallel on one base?
4. Is anything in the design contradicting a lock?
5. For subagent-seat-model: is the test in done-criterion 1 the right boundary, and should the real run stay out of `checks`?
6. For door-seat-capture: is the shapes/SKILL.md change enough for a door agent to write the block correctly, with nothing else needed?

Write your return to issues/chart/leaf-seat-override/slots/leaf-review-B.md, one section per leaf with the leaf slug as heading, then stop. Do not edit the drafts, the forks or anything under issues/open.
