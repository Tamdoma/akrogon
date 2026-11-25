# Fresh leaf worktree skips the repo setup, so the seat's Skill hook cannot load

## Case

framework leaf photo-rule-judges-anatomy, plan.synthesis pass, slot A, 2026-11-25. The dispatched prompt `plan-issue photo-rule-judges-anatomy slot=A phase=plan.synthesis ...` was blocked before the skill loaded. The framework repo's PreToolUse Skill hook (`bun "$CLAUDE_PROJECT_DIR/.claude/hooks/pretool/pretool-skill.ts"`, onFailure block) failed with `error: Cannot find package 'js-yaml' from '.../photo-rule-judges-anatomy/.claude/hooks/infrastructure/frontmatter-utils.ts'`.

## Evidence

- `ls node_modules` in `/home/ivan/.akrogon/worktrees/framework/photo-rule-judges-anatomy` returned "No such file or directory" at the start of the pass.
- `bun install --frozen-lockfile` (the repo's configured `setup` without `--backend=copyfile`) installed 804 packages in 1.88 s, and the same Skill call then loaded.
- `src/config.ts` `setupCommand` wraps `setup` only around the configured `checks` commands (`setupCommand(config, cmd)` at line 471). The worktree creation path that dispatches a seat runs no `setup`, so a seat's first tool call can meet a repo hook that needs dependencies.

## Learning

A repo whose hooks import its own dependencies cannot take a seat in a fresh worktree until its `setup` has run. Running `setup` only inside `checks` covers the checks but not the seat's own hooks, its tests run outside `checks`, or its typecheck. The required state is "configured `setup` has run in the worktree" before the first seat dispatch.

Report: https://github.com/Tamdoma/akrogon/issues/158
