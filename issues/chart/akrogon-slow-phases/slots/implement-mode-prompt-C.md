# Blind fork round: implement mode (akrogon slow phases)

Work blind: read no other file in this slots folder except this prompt. Ask no questions. Edit no repo file except your output. Run nothing that changes the repo, its config or other leaves.

Read `issues/chart/akrogon-slow-phases/INTAKE.md`, `issues/chart/akrogon-slow-phases/forks/implement-mode.md` and `forks/suite-speed.md` (Taken: concurrent suite, about 9-10 s instead of 80 s, not yet built).

Locks: `issues/chart/check-reruns/` (which checks run when), `issues/chart/reviewer-repair/` (B repairs most Fixes itself after both blind reviews), `issues/chart/seat-role-swap/` (A is the worker seat). Off route here: models and effort per slot, fewer proofs or checks.

Operator words (verbatim): "I just want to avoid constant back and forthing for failed tests, it just doesn't make sense. In fact, this testing and fixes take up so much time, look at the recent fixes for akrogon." and "let's also look into the slow part in akrogon you had mentioned."

Question: Q1 Set akrogon to repo-wide `implement: inline` (operator edit to `issues/config.yaml:6`), keep `subagents`, or build a per-leaf mode for small leaves (new mechanism)?

Task:
1. Read what `inline` and `subagents` each make the A seat do today: `src/config.ts`, `skills/implement-issue/SKILL.md` and anything else that reads the setting (cite file:line). Say whether inline still needs a fresh agent for any required proof (for example acceptance proof), and what that costs.
2. Measure on Claude-seat akrogon implement passes (sessions under `~/.claude/projects/`, map from `issues/log.jsonl` session ids and `issues/worktrees/<slug>`). Split each pass into worker time, parent model time and check time. State how many passes you found and whether that is enough to decide. Estimate the cut for inline with the 10 s suite.
3. Practitioner or primary sources on single agent vs subagents for small coding tasks, with URLs and dates read. Say what a source does not cover.
4. Options with a recommendation, pitfalls grounded in file:line, and what inline could break (context size on large leaves, review independence, worker proof rules).

Max 50 lines. Write to: issues/chart/akrogon-slow-phases/slots/implement-mode-C.md
