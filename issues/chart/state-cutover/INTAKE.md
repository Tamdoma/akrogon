# Intake: state-cutover

Destination akrogon: the one-time move of machine state from the tool root to `~/.akrogon` (state-home, merged 2026-10-16) actually happens on this host, without letting an old akrogon command write to the tool root after the move.

## Provenance
Door finding, 2026-10-16 ~03:00 local, while checking the run-release Pending step after state-home merged. No GitHub issue.

## Agent findings (A, 2026-10-16)
- F1 `~/.akrogon/` holds only `worktrees/`; no `config.yaml`. `globalHome()` falls back to the tool root while that file is absent (src/config.ts:197-202), so the host still runs from tool-root state.
- F2 `migrateStateHome` (src/state-home.ts:118-160), run at the start of every command (src/akrogon.ts:10), moves only when `settled()`: no live run record in tool-root `runs/` and `!foreignProcess(toolRoot)` (src/state-home.ts:122).
- F3 `foreignProcess` (src/state-home.ts:85-110) counts any process, other than this one, its ancestors and its children, whose cmdline contains the root or whose cwd is inside the root. On this host about 20 processes match by cwd alone: interactive bash shells, the claude, codex and pi chart sessions, a ChatGPT node helper. None runs akrogon code. The gate therefore never opens in normal use. tests/state-home.test.ts:144 pins "deferred while a foreign process holds the tool root as cwd".
- F4 A real akrogon command started through `~/.local/bin/akrogon` has that symlink path in its cmdline, not the root, and leaf seats run with cwd in `~/.akrogon/worktrees/...`; neither test catches them.
- F5 release-deploy (running) builds releases outside the checkout; with state still in the tool root, a release's `toolRoot` holds no `config.yaml` and `globalHome()` would land on an empty `~/.akrogon`. The cutover must happen before release-deploy ships.
