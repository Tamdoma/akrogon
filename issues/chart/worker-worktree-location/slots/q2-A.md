# Q2 reshaped, slot A, 2026-09-28

## Findings
- Seats already read `akrogon config` once per pass (skills/implement-issue/SKILL.md:21), and config already injects one computed value, `AKROGON_BASE`, when the cwd is not the registered root (src/config.ts:139-144, tested tests/config.test.ts:46-55). That is the existing channel for "akrogon computes, the seat copies".
- The defect is anchor ambiguity: the seat composes `<lane>/<worktree_root>` from a relative value (worker-protocol.md:11). akrogon resolves the same value as `resolve(repo.root, worktree_root, slug)` (src/next.ts:231). An absolute value removes the second reading.
- Script precedent exists: skills/watch-issues/scripts/observe.ts and skills/broadcast-issue/scripts/discord-send.ts, run as `bun <skill-folder>/scripts/<x>.ts` (watch-issues/SKILL.md:22, broadcast-issue/SKILL.md:32), installed with the skill folder (src/install.ts:11-24).

## Options
- A1 (recommend) Computed field in `akrogon config`: print the resolved absolute store (`resolve(repo.root, worktree_root)`) as a new derived key, reusing the function next.ts:231 uses. worker-protocol.md:11 names `<that key>/<slug>-u<N>` and drops `<lane>` and the pi-confirm reason. One line of code, one test, no new verb, no state. Soft: the seat still runs `git worktree add`, but it copies an absolute path instead of composing one.
- A2 Skill script `bun <skill-folder>/scripts/worker-add.ts <slug> <N>`: calls `akrogon config`, resolves the path, runs `git worktree add --detach <path> HEAD`, prints it. Harder push (one command does create), but duplicates path resolution outside src/ unless it parses config output, and owns creation without owning removal or retained workers.
- A3 Spawn-time check in pi tamdoma-subagents refusing a cwd nested inside another worktree. Hardest push, but another repo, and it would refuse legitimate standalone or retained nested workers (Q3-A).

## Pitfalls
- Do not overwrite `worktree_root` with an absolute value in config output: init-akrogon reads config to build proposals (init-akrogon/SKILL.md:16, :39) and could write the absolute path back.
- Unregistered or root-less cwd: the key exists only when a repo resolves, like `AKROGON_BASE`.
