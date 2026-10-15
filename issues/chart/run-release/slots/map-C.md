# Slot C map: run-from-workspace

## Recommended fix: immutable release snapshot, not a second checkout

Deploy by materializing the fetched `origin/main` tree into a new versioned directory (`~/.akrogon/releases/<commit>/`, via `git archive` from the root repo, then `bun install --frozen-lockfile` inside it) and flipping one stable symlink `~/.akrogon/current` to it; `~/.local/bin/akrogon`, every skill link, the plugin and the systemd unit all point through `current`. The root checkout stays the workspace and record holder, and its move in self-update continues for records only.

This removes the class instead of guarding it: the running tree is not a git checkout at all (no branch, no index, nothing to commit from or merge into), so no edit anyone makes anywhere can go live unreviewed, and deployment never needs to move a checkout, so a dirty root can block records movement (already handled as `checkout pending`) but can never block or leak into a deploy. A worktree (O1) only relocates the same properties to a less-tempting address.

Two enabling cuts are required first, and they are the substance:

1. State home must leave the code tree. Today `globalHome()` defaults to `toolRoot` (src/config.ts:195-198), so the tracked machine `config.yaml`, `reconcile/` reports, `.lock`, `paused.yaml` and `runs/` all live in whatever tree runs. Default `globalHome()` to `~/.akrogon` (migrating the current files once; `AKROGON_HOME` already overrides everywhere and tests already set it, tests/helpers.ts:88), leaving `toolRoot` meaning code and skills only.
2. "Own repo" detection must stop being path equality. `selfUpdate` decides it is deploying itself by `repo.root === ownRoot` (src/self-update.ts:208-212) and then runs installStage at the root; with a snapshot that is never true, so the deploy trigger must key on the akrogon repo's identity (its registered name/remote), build the snapshot from the fetched commit, and flip `current` after `bun install` succeeds in the new directory. `installStage`'s link step then links through `current` once and never needs per-release relinking.

## Alternatives considered

- O1 as stated (detached worktree at `~/.akrogon/app`): works today with zero build, but it is a second editable checkout sharing the same `.git`; a dirty edit there recreates the pending-move block in miniature, and it still needs the `globalHome` cut above, since running from it would otherwise read and write state inside it.
- Refuse or warn at startup when `src/` is dirty: a guard, not a removal; it blocks legitimate door edits on main and trains agents to commit unreviewed work to make the tool run.
- Self-update autostashes or auto-commits the overlapping edit, then moves: hides the edit instead of surfacing it, and the code already ran live before the stash.
- Make root `src/` and `skills/` read-only: seats with a shell can undo permissions, and door main steps legitimately edit code and skills on main under review.
- Compiled single binary (`bun build --compile`) with no release tree: skills, `plugin/` and the systemd unit still need versioned files on disk, and `process.execPath` is used as the bun interpreter (src/self-update.ts:189 `install`, skills/chart-issues/scripts/peer-ask.ts:33), which a compiled binary breaks; the snapshot gives the same immutability while keeping bun-runs-TypeScript.
- Move `issues/` records out of the akrogon repo: solves nothing for code liveness and breaks the records-live-in-the-repo design every consumer repo relies on, for one repo's problem.
- Do nothing beyond the existing rule: already falsified; the rule was in force when this happened.

## What makes this (and O1) harder than it looks

- Skill and tool links are absolute into `toolRoot` (src/install.ts:14-25), and `planSkillLinks` treats a destination pointing anywhere else as a conflict requiring manual removal (src/install.ts:38-44); linking through one stable `current` symlink avoids rewriting ~4 skill roots per deploy, but the one-time migration must repoint links that today resolve into the root checkout, and tests pin `realpathSync(destination) === toolRoot/...` (tests/install.test.ts:118-124).
- Several skill steps find akrogon source through the binary symlink and assume a git tree: seed-issue resolves the akrogon root by `git rev-parse --show-toplevel` on the resolved `akrogon` command (skills/seed-issue/SKILL.md:26), which fails in a snapshot with no `.git` and must switch to the `akrogon` entry in the global registry. The chart presence check and merge lessons helper import `src/*.ts` by that resolved path (skills/chart-issues/SKILL.md:77-80, skills/merge-issue/SKILL.md:64); those keep working only because the snapshot is a full source tree with `node_modules` installed before the flip.
- Flipping `current` under a running process can mix versions: src/akrogon.ts loads most verbs by dynamic import at dispatch, so the flip belongs exactly where `installStage` runs today (end of the merge wake, src/self-update.ts:208-262), never mid-command; the same is true of moving a worktree out from under its own interpreter in O1.
- Seats re-read skill files at every phase prompt, so a flip changes skill text for in-flight leaves at their next prompt. That is already true when the root checkout moves today, but a snapshot makes deployments more frequent and less visible; keeping the previous release directory until no process has it open (or simply keeping the last few) is the rollback and the audit trail.
- `self-update` currently conflates three jobs for the akrogon repo: pushing record commits, moving the record checkout, and deploying code (`gitStage` plus `installStage`, src/self-update.ts:208-262). The fix is mostly separating deploy from the other two; the record jobs and their pending state when edits overlap are correct and should not change.
