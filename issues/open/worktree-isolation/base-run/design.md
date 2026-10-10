# Design: base-run

## Binding decisions, verbatim
Chart: framework repo issues/chart/worktree-isolation (registered root /home/ivan/Work/infra/tamdoma/framework).

### Base rerun (forks/base-rerun.md)
Applies: 1a and the red-base-wait interface. Resolved open point: a merge-time run logs under the merge attempt's issue folder and records the parent attempt id. Excluded: "akrogon in-process tests set AKROGON_LEAF_TEMP_ROOT" (worktree-reconciler). "Both skill paragraphs become one command line" is owned here, covering check-issue :18/:63, implement-issue :25/:38 and merge-issue :18. (C)
#### Taken
- 1a: `akrogon base-run` owns the base checkout: record line in `issues/base-runs.jsonl` written before `worktree add` (repo, leaf, slot, parent attempt if any, supplied base sha, exact command, args, relative cwd, pid, boot_id, start), location guard before allocation, detached checkout in the store, copyfile setup and constructed env with the leaf's current `.env` generation, own-node_modules guard after setup, AKROGON_BASE set to the base, log at `<leaf>/implementation/base-<id>.log`, end and exit status recorded, removal in finally and removal confirmation recorded. The migration 2a reconciler removes an unconfirmed base entry only under its safety rules. Caller supplies and judges the baseline; the verb never chooses it. Both skill paragraphs become one command line. akrogon in-process tests set AKROGON_LEAF_TEMP_ROOT inside their fixture. Operator, 2026-10-10.
- Foreclosed: 1b prose plus reconciler, named-check form, persistent base checkout, base inside leaf scratch.

#### Interface with akrogon red-base-wait (2026-10-10)
Consumer contract: caller supplies the baseline (pre-merge: the leaf's AKROGON_BASE, merge: the exact stack target), exact command, args and scope. The verb runs fresh every time and prints the log path and completion status on stdout. Matches 1a. Open point for leaf writing: a merge-time run belongs to a merge attempt, not one leaf, so the log location and `leaf` field take the attempt's issue folder there.


### Disk stock (forks/disk-stock.md)
Applies here only: base-run creates its checkout with the 2a sparse sequence and passes checks there.
#### Taken 2026-10-10
Operator: "1a | 2a | 3a |".
- 1a: every capture, record and run-*-proof script builds its consumer through the one builder (composition-spine capture.ts switches from rsync), the archive excludes issues/, and the lane's consumer is deleted in finally while holding its flock. Fixed lane paths stay, so trust holds. Crash sweep acquires and holds the lane flock before removal. Done-criterion: each multi-stage driver's later stage runs from a removed consumer.
- 2a: ensureWorktree and base-run create worktrees with `--no-checkout`, then per-worktree non-cone sparse-checkout `'/*' '!/issues/'`, then checkout. The root stays full. Migration 1a recreate applies it to old leaves. Done-criterion: leaf checks, base-run and a stack rebase pass in a sparse worktree, and reconciler clean-checks read it as clean.
- 3a: one sweep of root .temp, including proof-34b-a-consumer and the four hand notes, after 1a lands and with no proof holding a lane flock. The outputs sensor keeps it empty after.


### Exclusions
- Store, sparse helper and guard: worktree-store. Constructed env and run root: check-env. `.env` generation: leaf-env-file (base-run reads the current generation when present). Reconciler backstop for unconfirmed entries: worktree-reconciler.
- Per-test comparison and the known-red judgment stay with the seat (red-base-wait).

## Standing design

/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

Interpretation: tests run the real verb against a temporary repo with a real command that writes output and exits 0 or 1, and a real setup step; kill-during-setup is exercised with a real signal to the child. The record and log are read back from disk. No reuse means a second run is a second checkout, observed by distinct paths in the records.

## Leaf architecture
Owned surfaces:
- `src/akrogon.ts`: `base-run` case.
- New `src/base-run.ts`: record append (record file sibling to the merge attempts record, schema parsed with zod), guard, `createSparseWorktree(repo, path, base, {detach: true})` under `worktreeStore(repo)/base-<id>`, `akrogon run-check` for setup plus command with AKROGON_BASE=<base>, log write, removal in finally, confirmation line.
- Leaf and attempt folder resolution: leaf from the cwd's worktree via `allLeaves`, slot from the leaf's seat state, relative cwd from `git rev-parse --show-prefix`, attempt folder from the batch record when `--attempt` is given. (B)
- `.env` transfer: reads the calling leaf's `env_generation` and `env_names` (leaf-env-file) and writes the base checkout's `.env` with those names from the root `.env`, mode 0600, before setup; the generation goes into the record line. (B)
- Location: `checkLocation(<store>/base-<id>)` (worktree-store) before `git worktree add`. (B)
- Skill text: `skills/check-issue/SKILL.md`, `skills/implement-issue/SKILL.md`, `skills/merge-issue/SKILL.md` base checkout sentences become one `akrogon base-run --base "$AKROGON_BASE" -- <command> <args>` line; the surrounding judgment text is unchanged. (C)
Exports `readBaseRuns(repo)` returning parsed record lines (schema owned here), consumed by worktree-reconciler. (B)
Interfaces: CLI `akrogon base-run --base <sha> [--attempt <id>] [--cwd <rel>] -- <argv>`; stdout two lines `log: <path>` and `status: <exit code>`; exit code equals the command's.
Dependencies: blocked-by worktree-store (store, sparse helper, guard, `checkLocation`), check-env (run-check env and run root), leaf-env-file (env generation and names). (B,C)
