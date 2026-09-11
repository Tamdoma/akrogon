# Brief: worktree-root-ignore

## What
`akrogon init` adds the configured `worktree_root` (with trailing slash) to `.gitignore` instead of the hardcoded `issues/worktrees/`.

## Why
`src/init.ts:38` ignores `issues/worktrees/` regardless of configuration, so a repo with another in-repo root has its worktree checkouts staged as gitlinks by sync.

## Done-criteria
1. `bun test tests/init.test.ts` passes with new cases: a proposal setting `worktree_root: work/trees` produces a `.gitignore` line `work/trees/` and no `issues/worktrees/` line; the default proposal still produces `issues/worktrees/`; a root outside the repo (`../trees`) adds no line; re-running init does not duplicate lines.
2. CLI end-to-end init in a temp repo leaves `implementation/cli-artifact.log` with the resulting `.gitignore`.
3. `bun run format`, `bun run typecheck`, `bun test` pass.
