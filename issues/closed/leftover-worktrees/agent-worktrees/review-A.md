# Review A — agent-worktrees

Base `c7c4ef8`, reviewed head `3c5cebc` (`0ed7a05` tests, `277af50` code, `3c5cebc` fixture fixes).

## Evidence

- `bun test tests/reconcile.test.ts -t agent` on the head → `check review-agent-tests: 0 .../check-review-agent-tests-1792134528996-3905514.log` (6 pass).
- `akrogon verify` green on `3c5cebc` (per implementation report; test `check-test-1792134337149-3171679.log`, typecheck `check-typecheck-1792134341749-3171679.log`).
- Deliberate-break run red on the live-owner path: `check impl-deliberate-break: 1 .../check-impl-deliberate-break-1792133784150-2038648.log`.
- `src/AREA.md` path check: every path its bullets name exists under the worktree root; the changed bullet adds no file path.
- Planned-test provenance holds: red runs recorded at plan.synthesis, green rerun on the head after the test fix commit.

## Fix

1. **Criterion-1/3 keep case with no catching test: lock id mismatch.** `endedAgentWorktree` requires `lock[1] === id` — a worktree `agent-<id>` whose lock names a different agent id must stay locked (criterion 3 "a lock text in any other form"; criterion 1's lock shape binds the id). Deleting or loosening `lock[1] !== id` changes no test result today: every T3 case exercises a different guard. One case in the existing matrix (`agentWorktree`-style dir `agent-x`, lock `claude agent agent-y (pid 4194303 start 0)`, kept + still locked) closes it; the existing runner and helpers suffice, so this is handed to A under the proof-case rule.

## Nits

1. README.md says commits "landed on the default branch"; the proof is against `refs/remotes/<remote>/<default_branch>` as last fetched. Deferred: AREA.md and design state it precisely, and the stale-ref direction only over-keeps. Promote if an operator reads the README wording as proof of a fresh remote check.
2. `reconcileNeedsPanes` fires the pane fetch for any `agent-*` entry under `.claude/worktrees`, including unregistered strays. Deferred: one `herdr pane list` per pass, already fetched for most candidates anyway; recorded in report.md.
3. The mid-pass branch-move race (criterion 4) has no in-process injection path; covered by `update-ref -d` expected-old semantics and the stale-lock error path. Recorded in plan.md and report.md.
4. `row === undefined` inside `endedAgentWorktree` is dead (caller iterates `registered.keys()`). Deferred: two words, no behavior.

## Verdict: fix

Verdict `fix` for the missing id-mismatch case only; all other findings are Nits.
