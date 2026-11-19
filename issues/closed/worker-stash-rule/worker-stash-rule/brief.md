# Brief: worker-stash-rule

## What

Edit two implement-issue rule texts. `skills/implement-issue/brief-template.md`: section 5 (Do-not) carries, for every sub-brief, the rule never to run any `git stash` subcommand, with its reason (every worktree of a repo shares one stash, so a pop can lift a sibling worker's edit) and the replacements: to check behaviour on the base, use a second worktree of the base; in a delegated leaf worker worktree, set work aside as a WIP commit and, before returning, `git reset --soft <creation commit>` and make the unit's returned commit once; section 4 records, for a delegated leaf unit, the commit A created the worker worktree at, filled by A when it creates that worktree (D). `skills/implement-issue/SKILL.md` Shared context refresh: A never runs `git stash` in a leaf or worker worktree, at a refresh or at any other time.

Owned files: `skills/implement-issue/brief-template.md`, `skills/implement-issue/SKILL.md`. Prose only; no script, hook or test.

## Why

Two framework workers in sibling worktrees popped each other's stashes and briefly held each other's edits (Tamdoma/akrogon#141; framework history `learnings/history/2026-10-16-stash-shared-across-worker-worktrees.md`). `refs/stash` lives in the shared git directory, and nothing a worker reads says not to stash. No akrogon code runs a worker's git, git has no stash hook, and a per-worker clone breaks `akrogon run-check`, so the rule goes where every worker and A read it.

## Done-criteria

1. The template instructs A to put in every sub-brief the never-stash rule with its reason and the base-worktree replacement, and in a delegated leaf sub-brief also the WIP-commit replacement and the worktree's creation commit, filled when A creates that worktree, so a worker that follows it returns one commit A can cherry-pick alone; a standalone sub-brief gets no reset step. Judged by the reviewing seat reading the template against the case in the framework history file. (B,D)
2. implement-issue SKILL.md states that A never runs `git stash` in a leaf or worker worktree at any time, and no sentence left in the owned files permits stashing there.
3. Links in the changed files resolve on the leaf head (the `test` check). (B,D)
4. The report states that the change is prose, which today's Retire rule does not count as a stop, so the framework lesson `history/2026-10-16-stash-shared-across-worker-worktrees.md` stays active.
