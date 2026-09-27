# Leaf final check C

All cited lines verified (`docs/guide/phases.md:87`, `skills/AREA.md:21`, `SKILL.md:3,37`, `worker-protocol.md:11`, `package.json` scripts). Cap 3 is consistent across brief, design and ISSUE.md. Three disagreements, all fixable in prose:

1. Design line 12 claims `issues/worktrees/` is gitignored by `src/init.ts:54-55`. That line ignores `config.worktree_root` only when it is inside the repo root, and the fixed path matches it only under the default `issues/worktrees` (`src/config.ts:29`). State the worker path as `<lane>/<worktree_root>/<slug>-u<N>`, or say the ignore holds for the default only. Removal before `akrogon phase` (design line 32) still protects the phase call.

2. Design line 9 and criterion 3 keep a conflicting worker commit "reachable", but a detached worktree's commit is reachable only through that worktree's HEAD. Say the conflicting worktree is retained until its remainder lands; removing it first makes the commit unreachable to a later `gc`.

3. Criterion 3 names a scenario script but no owned surface holds it, and design line 21 says the transcript is the artifact. State that the script is temporary and deleted, so the implementer does not add it under `tests/` (which `bun run format` would then touch).
