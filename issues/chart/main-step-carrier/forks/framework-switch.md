# Framework switch

## Question
Q1. Switch framework `checks.test_changed` to `bun run test:changed` on framework main now, after a real run that shows it selects and runs the affected area?

### Carries
- forks/check-entry-points.md Taken 1d.
- framework verify-gate area-selection 1a already chose folder selection (framework issues/chart/verify-gate/forks/area-selection.md:20-24).

## Findings
- Selection on the failing leaf's diff picks both failed verifiers (INTAKE Agent findings). (A)
- A clean base selects nothing (run-test-changed.ts:191-194); the proof must use a base with real changes and record selected scripts and time. (B)
- A commit to framework main needs operator approval. (A)
- Probe 2026-10-12 (A), scratch detached worktree of framework, `bun install --frozen-lockfile --backend=copyfile`, then `AKROGON_BASE=2e5b2aaf3 bun run test:changed`:
  - known break, revision 6fe2049d7: 22 of 140 scripts selected, exit 1 in 8 s, with both merge errors (`endpoint competitor-context contract missing data/ahrefs-anchors-pull@competitor:<slug>`, `toxicity subroutine missing output path ...`).
  - known good, revision 1b8d3a437 (origin/main): shared files changed since that base, so all 138 scripts selected and `framework:verify:core` ran; exit 0 in 237 s.
  - Cleanup: worktree removed, verified absent from `git worktree list`. Logs kept in the door scratchpad only.
  - Limits: one quiet-host run each; does not prove timing under parallel load (#86 territory) or the effective command through akrogon's run-check wrapper.
- (B) slots/framework-switch-B.md: pick yes; after the edit, read effective config from the registered root and confirm the wrapped command; keep framework #115 closed, #87 carries the present failure and closes only when the akrogon change and this switch are both delivered.

## Taken
Operator 2026-10-12: "1a |"

Decision: the door sets framework `checks.test_changed: bun run test:changed` in the registered root's issues/config.yaml, leaving other entries and unrelated issues/ edits untouched. Done 2026-10-12: line 12 changed; `akrogon config` in framework shows the run-check/flock wrapper invoking `bun run test:changed`. The file is left for akrogon's record sync like other door writes on main. Framework #115 stays closed; #87 stays open until the akrogon change also lands.
Foreclosed: 1b leave the stub.
