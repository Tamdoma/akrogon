# Q2 reshaped, merged 2026-09-28 (A merged; tags (A) (B) (A,B))

## Findings
- (A,B) Skill scripts are an existing interface: `bun <skill-folder>/scripts/<x>.ts` (watch-issues/SKILL.md:22, broadcast-issue/SKILL.md:32). `akrogon install` symlinks the whole skill folder into every harness root (src/install.ts:11-21), so a new script reaches pi with no installer change. Nothing runs a script automatically; the protocol must call it.
- (A,B) Path resolution already exists: `resolve(repo.root, worktree_root, slug)` (src/next.ts:231) with `requireRepo` (src/config.ts:119-122). Reuse it, do not re-derive.
- (A) Seats read `akrogon config` once (implement-issue/SKILL.md:21), and config already prints one computed value, `AKROGON_BASE` (src/config.ts:139-144).
- (A) No skill script imports from src/ today (observe.ts and discord-send.ts import only node and zod). A creator that reuses src/config.ts adds that coupling for the first time.
- (B) pi admits nested and sibling workers alike (tamdoma-subagents/tools.ts:91-95), so a spawn check is new policy in another repo. Git has no pre-`worktree add` hook, only post-checkout, skipped with `--no-checkout` (githooks manual).

## Options
- O1 (B recommend, A agrees after merge) Creator script `skills/implement-issue/scripts/create-worker.ts <slug> <N>`: checks the caller is the leaf worktree for that slug, computes the Q1-A path, runs `git worktree add --detach <path> <leaf HEAD>`, prints only the absolute path. Refuses an occupied path. No state, no verb, no cleanup. The protocol tells B to call it for every new delegated worker and copy the printed path unchanged to spawn, inspect and remove. Standalone and retained workers never call it. (B) It removes the path, the start commit and the wrong-checkout mistake in one command.
- O2 (A) Computed absolute key in `akrogon config` output, protocol copies it. One line plus a test, but the seat still writes `git worktree add` and picks the commit.
- O3 (A,B) Prose rule fix only.
- Not recommended (B): env var at pane creation (stale in reused panes, src/next.ts:307-346), pi spawn check, Git hook, dispatch prompt text.

## Pitfalls
- (A,B) It nudges, it does not enforce. A seat can still type raw git.
- (B) On Git failure print command, cwd, status and stderr, no success path, no delete of partial state.
- (A) Do not overwrite `worktree_root` with an absolute value in config output; init-akrogon reads config for proposals.
- (B) Verify with real temp repos: default, custom and absolute stores, leaf HEAD ahead of main, spaces in paths, wrong caller, occupied path, invocation through a symlinked skill folder.
