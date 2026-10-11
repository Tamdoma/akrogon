# Design: worktree-reconciler

## Binding decisions, verbatim
Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework).

### Migration (forks/migration.md)
Applies: 1a (except `setup` carrying `--backend=copyfile`, operator step S1, and `~` expansion, worktree-store) and 2a in full.
#### Taken
- 1a: remove the old clean worktree and let dispatch recreate it at the store from the branch. Refuse on uncommitted work, rebase/merge in progress, live tab or cwd inside (removal only when next.ts:356-367 finds no match), or any leaf with `state.batch`. Ignored files in the old tree are discarded. `setup` in issues/config.yaml carries `--backend=copyfile` alongside the repo bunfig. `~` in worktree_root is home-expanded. Each is a done-criterion. Operator, 2026-10-10.
- 2a: a reconciler in every pass compares `git worktree list --porcelain`, store directories and the leafTemp root with leaf state. Keep while the leaf is active (not merged or failed) or a live pane is inside, and skip temp roots of a running attempt. Otherwise remove when clean, not mid-rebase and HEAD reachable from a branch or remote. Branches deleted only with `git branch -d`. Everything else is reported in `akrogon status` with path and reason (dirty, unreachable commits with count, unknown directory). Failed leaves lose the worktree, keep the branch, and recreate on recovery. Operator, 2026-10-10.
- Foreclosed: 1b move with operation record, F5b drain with exemption, 2b keep failed worktrees, age-based prune.
- Q-d answered (A, 2026-10-10): the no-leaf worktrees were not orphaned by deleted folders. emdash-health-run and update-replay closed normally (issues/closed/emdash-cms, issues/closed/satellite-update-loop). The worktrees are seat-made variant checkouts (`-v0`, `-u7`, `-u5`, matching brief-V0..V2 in emdash-health-run) created outside akrogon (no akrogon source names them). 2a reports or removes them; no separate fork.


### Outputs (forks/outputs.md)
Applies here only: "The reconciler removes run roots whose process is gone." The rest belongs to check-env and framework check-scratch.
#### Taken 2026-10-10
Operator, verbatim: "We need to make sure that all of the leftovers are always cleaned up unless it's logs or something that we will need in the future. So even this is too big. I don't want any gigabytes to be on the disc for no reason. I want the repo to be clean and up to date."

Read as 1a and 2a, with the strict rule:
- Default is delete. Each check run gets a fresh run root inside the per-leaf scratch, removed at run end. The reconciler removes run roots whose process is gone. The scratch root moves off tmpfs to the home disk.
- Kept set is explicit: logs and named evidence go to `<leaf>/implementation/` before removal. Nothing else survives a run.
- The 5 mkdtemp sites and the fixed-name writers move to the run root. The path-security.ts:98-108 guidance stops pointing outputs at `/.temp/`.
- Sensor (done-criterion): a run that leaves new ignored entries in the checkout fails, naming them, with node_modules and committed fixtures excluded. Writer-route tests sit beside it (B F4).

Moved to new forks: root .temp/proof-34b (recording workspace, 6.5 GiB) and the per-worktree copy of issues/closed (about 0.4 GiB each). See forks/disk-stock.md.


### Disk stock (forks/disk-stock.md)
Applies here only: "Migration 1a recreate applies it to old leaves" and "reconciler clean-checks read it as clean" from 2a. 1a's crash sweep of recording consumers is framework recording-consumers' own lane-flock sweep, not this reconciler. 3a is operator step S4.
#### Taken 2026-10-10
Operator: "1a | 2a | 3a |".
- 1a: every capture, record and run-*-proof script builds its consumer through the one builder (composition-spine capture.ts switches from rsync), the archive excludes issues/, and the lane's consumer is deleted in finally while holding its flock. Fixed lane paths stay, so trust holds. Crash sweep acquires and holds the lane flock before removal. Done-criterion: each multi-stage driver's later stage runs from a removed consumer.
- 2a: ensureWorktree and base-run create worktrees with `--no-checkout`, then per-worktree non-cone sparse-checkout `'/*' '!/issues/'`, then checkout. The root stays full. Migration 1a recreate applies it to old leaves. Done-criterion: leaf checks, base-run and a stack rebase pass in a sparse worktree, and reconciler clean-checks read it as clean.
- 3a: one sweep of root .temp, including proof-34b-a-consumer and the four hand notes, after 1a lands and with no proof holding a lane flock. The outputs sensor keeps it empty after.


### Base rerun (forks/base-rerun.md)
Applies here only: "The migration 2a reconciler removes an unconfirmed base entry only under its safety rules." and "akrogon in-process tests set AKROGON_LEAF_TEMP_ROOT inside their fixture." The verb belongs to base-run.

### Exclusions
- boundary store and guard: worktree-store. outside-inputs: check-env and leaf-env-file.
- The operator's `worktree_root` lines (S1, S2) are written on main; this leaf only reads config.

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: every removal and refusal case is tested against real git worktrees in a temporary repo (dirty file, rebase stopped on conflict, unreachable commit, live pid via a real child process). Live pane detection uses the existing herdr pane listing seam already used by next.ts. A deliberate break (removing the dirty check) turns a test red. No age-based rule.

## Leaf architecture
Owned surfaces:
- New `src/reconcile.ts`: `reconcile(repo, leaves, panes)` returns `{removed, kept: {path, reason}[]}`; called once per repo from `src/next.ts` `sweepAll`.
- `src/status.ts`: prints kept entries with path and reason.
- `src/next.ts` `cleanupMerged` and `removeLeafTemp`: fold into the reconciler rules (worktree removal no longer waits for the whole issue to close).
- Migration: in `reconcile`, an active leaf whose `state.worktree` is outside `worktreeStore(repo)` is removed under the refusal rules and its `state.worktree` cleared, so `ensureWorktree` recreates it.
- Tests: every in-process akrogon test fixture sets AKROGON_LEAF_TEMP_ROOT.
Interfaces consumed: `worktreeStore`, `createSparseWorktree` (worktree-store); run root `.owner` `{pid, boot_id, started}` (check-env); base-run record lines and reader (base-run, landed before this leaf). (B,C)
Dependencies: blocked-by worktree-store, check-env, base-run. (B,C)
