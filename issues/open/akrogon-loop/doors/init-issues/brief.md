# Brief: init-issues

Chart skill version: 4

## What

Rewrite `skills/init-issues` under the cap: inspect a repo's runner, linter, typecheck and test commands, read the global config through `akrogon config`, write the proposed per-repo config to a temp file (remote, default_branch, worktree_root, rebuttal, fix_rounds, checks with `test_changed` against `$AKROGON_BASE`, advisory, grounding.index, broadcast in the `discord: webhook_env` shape) and, when the repo has no tests, a toolkit line, then run `akrogon init --from <file> [--toolkit <lang>=<runner>]`, never writing `issues/config.yaml` or the global config by hand; when `grounding.index` names no file, write the top index file (areas one line each with a link) and point the key at it, the skill's only write outside issues/. Delete `payload/` and `scripts/` under the skill folder and every reference to scripts_dir, sync-payload and the payload scripts. The skill names the akrogon command as its dependency, carries the compaction first lines and ends with `Next: none`; it runs outside a leaf and never calls `akrogon phase`.

## Why

Per repo setup is one skill that proposes and one command that writes (# Distribution, # Config Shape, # Index Levels).

## Done-criteria

1. The skill under the cap proposes every per-repo key from # Config Shape with defaults, asks only where inspection cannot decide, reads the global config only through `akrogon config`, and names the akrogon command as its dependency.
2. On a temp repo with bun test and eslint under `AKROGON_HOME`, the proposal names them under `checks` with a `test_changed` line and the written `issues/config.yaml` comes from `akrogon init --from` (checker verifies).
3. When `grounding.index` is absent the skill writes a top index file listing areas one line each with a link and the key points at it; nothing else outside issues/ is written by the skill.
4. `payload/` and `scripts/` are gone from the skill folder and no reference to scripts_dir, sync-payload or issues/.scripts remains.
