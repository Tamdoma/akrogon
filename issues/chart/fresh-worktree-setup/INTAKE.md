# Intake: fresh-worktree-setup

## Scope

Destination repo: akrogon (registered). One chart for Tamdoma/akrogon#158: a new leaf worktree gets no `node_modules`, so a repo hook that imports its own dependencies blocks the seat's first tool call. Handed with the test-suite temp leftovers, which get their own chart (separate outcome).

## Provenance

- GitHub: Tamdoma/akrogon#158
- Operator: door message 2026-11-25 (t126), full autopilot

## Source: Tamdoma/akrogon#158

# A fresh leaf worktree has no node_modules, so the framework PreToolUse Skill hook blocks the dispatched plan-issue call (suspected: setup runs only inside checks)

Source: Tamdoma/akrogon#158
URL: https://github.com/Tamdoma/akrogon/issues/158

Origin repo: Tamdoma/tamdoma-framework
Lesson history: /home/ivan/Work/infra/akrogon/learnings/history/2026-11-25-fresh-worktree-skips-setup.md

Unverified intake.

## Observation

On 2026-11-25, seat A was dispatched `plan-issue photo-rule-judges-anatomy slot=A phase=plan.synthesis leaf=...` in the framework leaf worktree `/home/ivan/.akrogon/worktrees/framework/photo-rule-judges-anatomy`. The first Skill call was blocked by the framework repo's PreToolUse hook:

```
PreToolUse:Skill hook error: [bun "$CLAUDE_PROJECT_DIR/.claude/hooks/pretool/pretool-skill.ts"]: failed; blocking because onFailure is "block"
error: Cannot find package 'js-yaml' from '/home/ivan/.akrogon/worktrees/framework/photo-rule-judges-anatomy/.claude/hooks/infrastructure/frontmatter-utils.ts'
```

`ls node_modules` in the worktree returned "No such file or directory". After the seat ran `bun install --frozen-lockfile` (804 packages, 1.88 s), the same Skill call loaded.

## Location

akrogon leaf worktree creation before the first seat dispatch (`src/next.ts` `ensureWorktree`), and repo `setup` handling (`src/config.ts` `setupCommand`). Consumer: framework, whose `setup` is `bun install --frozen-lockfile --backend=copyfile`.

## Reproduction

1. Hand off a framework leaf whose worktree does not exist yet.
2. Let akrogon create the worktree and dispatch the plan.synthesis seat.
3. The seat's first Skill call is blocked by the repo hook.

Seen once. Frequency on other fresh worktrees: Not provided.

## Expected behavior

The configured `setup` has run in the worktree before the first seat dispatch, so the repo's own hooks, tests and typecheck can load its dependencies.

## Urgency

Every seat dispatched into a fresh framework worktree is blocked at its first Skill call. A seat without the knowledge to run the install itself would stall. Workaround: the seat runs the repo's `setup` command by hand.

## Suspected cause

Supported hypothesis. `ensureWorktree` (`src/next.ts:283-316`) creates the sparse worktree and writes the leaf `.env`, then saves state. It runs no `setup`. `setupCommand` (`src/config.ts:471-479`) wraps `setup` only around configured `checks` commands run through `akrogon run-check`. `src/run-check.ts:226` and `src/verify.ts` use the same wrapping. The contributing condition: a consumer whose PreToolUse hooks import its own dependencies (framework `.claude/hooks/infrastructure/frontmatter-utils.ts` imports `js-yaml`) fails before any check runs.

Whose view: agent.

Files read: `src/config.ts` (akrogon development checkout `/home/ivan/Work/infra/akrogon`), `src/next.ts` `ensureWorktree` and `writeLeafEnv`, grep of `setup` across `src/*.ts`.

Not inspected or would disprove: whether another path (the herdr/hc launch, or a harness start script) is meant to run `setup` before the seat's first turn. If it is, that path did not run here.

Related reports: Tamdoma/akrogon#156 (same `ensureWorktree` path, reused stale worktree base, a different defect). Tamdoma/akrogon#113 (closed, `akrogon verify` setup own-modules guard, verify-time not dispatch-time). Searched Tamdoma/akrogon, all states: my reports since 2026-11-23 (limit 30), and "worktree setup install" (limit 10).

## Source: operator door message 2026-11-25

yes, fix it all the best way you can. Use the active consultants to chart and hand off to to the w-akrogon watcher. Full autopilot mode. I have to go. Be autonomous. Do your best.

(Context: this answered the door's question about #158, a new seed nobody was working on, and the test-suite temp leftovers the door had just cleaned up: about 2,900 `/var/tmp/akr-1000/<hash>` host dirs and 35 empty `~/.akrogon/worktrees/akrogon-XXXXXX` dirs left by akrogon's own test runs in two days.)

## Agent findings

- Pull 2026-11-25T11:15:04Z ok (3 open issues). Seed 158 has no `## Operator decision` section.
- The lesson is on main: `learnings/LESSONS.md` line "fresh worktree skips setup (2026-11-25)" and `learnings/history/2026-11-25-fresh-worktree-skips-setup.md` (commit 99552b73). A leaf that stops it on every path removes the line and appends `Applied` (lesson rule Retire).
- `src/next.ts:ensureWorktree` creates a leaf worktree via `createSparseWorktree` (git worktree add --no-checkout, sparse-checkout without issues/, checkout) and runs no `setup`. `src/config.ts:setupCommand` wraps `setup` only around configured checks (`withSetup`, run-check, verify).
- akrogon's own config has `setup: bun install --frozen-lockfile --backend=copyfile`.
- Recorded only (outside the handed list): akrogon flaky lists 5 tests, latest 2026-11-23.
