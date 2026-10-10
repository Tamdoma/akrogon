# deploy-path merged notes (A)

## Q1 deploy path
- (a) separate runtime from the authoring root; install links (bin, skills, plugin) point at a runtime copy updated automatically after each akrogon landing (A,B,C). Root stays dev + issue store.
  - A refinement: immutable release dir per landed SHA (git worktree or clone at SHA, bun install --frozen-lockfile), one `current` symlink swapped atomically (rename(2)); previous release kept for rollback by pointer swap. Removes mixed-file reads during a lazy import (B F7) without a drain. Practitioner: Capistrano/Deployer release dirs + atomic current symlink (deployer.org/blog/atomic-symlinks; github.com/rafaelbiriba/cap_blue_green_deploy). (A)
  - C shape: one deploy clone ff-merged in place, reset --hard prev sha for rollback. (C)
  - B: prepare exact landed SHA, activate one coherent release (command+deps+skills+plugin) at a safe boundary; pointer over in-place mutation. (B)
- (b) ff root when clean: rejected; root is dirty most of the time (4 dirty files also changed on origin), keeps untested local edits live (A,B,C).
- (c) warn only: kept as detector inside (a), rejected as remedy; LESSONS.md:18 lag recurred at 52 commits (A,B,C).
- (d) manual pull: rejected (A,B,C).
- Trigger must cover every verified default-branch landing incl. direct route and operator pushes, never a consumer repo push; deploy the exact tested SHA, not latest origin silently (B F6,R8; C Q-a ff on next as catch-up) (B,C).
- Deploy failure after a successful push is reported as deploy failure, never a merge failure or second push (B R6, C) (B,C).

## Q2 switch timing
- Switch at once; in-flight processes keep their loaded release; next invocation and next skill read use the new one; state schema changes stay additive-optional so both versions read the same state (origin/main state.ts adds only optional fields) (A,C).
- Pause new dispatch, drain running passes, fresh sessions, then activate; incompatible state needs explicit migration (B).

## Contract surfaces the leaf must own (B F2-F4, C)
- install.ts relink of bin/skills/plugin to runtime; install refuses existing links to another checkout today (install.ts:35-44) (B,C).
- Stable home: globalHome defaults to toolRoot (config.ts:170-185): config.yaml, paused.yaml, hold files must stay at the authoring root via AKROGON_HOME or explicit home, for CLI, leaf calls and plugin hooks (B).
- Authoring root discovery: skills resolve the akrogon root via `readlink -f $(command -v akrogon)` (chart-issues SKILL.md:77, seed-issue SKILL.md:24-26, lesson-rule.md:7). After the move that would point at the runtime copy; must resolve to the registered authoring root (`akrogon config` repos.akrogon) (B).
- Plugin adoption after relink unproven: needs a real probe of `herdr plugin link` relink (B Q6, C).

## Pitfalls
- Bad release host-wide: gate + previous release pointer for rollback (A,B,C). Rollback cannot undo state written by the new release: additive-optional rule (A,C) or compatibility check (B).
- Root dirty edits: operator prerequisite to decide per file (src/next.ts waiting change + 3 tests + docs/guide/next.md, chart door files, LESSONS/history); not a prerequisite for (a) itself, only for the operator's own pull (C,B).
- Two machines: next/status detector shows behind (C).

## Differences
- D1 timing: switch at once (A,C) vs drain boundary (B).
- D2 in-place ff (C) vs immutable release + pointer (A,B).
