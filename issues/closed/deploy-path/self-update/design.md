# Design: self-update

## Binding decisions, verbatim

### deploy-path (issues/chart/deploy-path/forks/deploy-path.md)
Operator 2026-10-10: "1c".
Reason (operator, preceding message): no new mental model; the root stays the program.
Binding decisions (operator 1c; mechanism shaped by A with B,C focused checks 1-3, slots/deploy-path-final-check*.md, slots/deploy-path-shape3.md):
- One self-update step, keyed on realpath(repo.root) == realpath(toolRoot), so consumer repos never update akrogon. (A,B,C)
- Triggers only: (a) mergeWake for the akrogon repo when the committed move's `to` is `merged`, run before mergeWake's pause check (the step changes no leaf state); (b) `akrogon next --resume`, `next --all` and a manual `next` whose selected repos include akrogon. Per-pane hooked events are not triggers. (A,C)
- Step, under the existing shared `akrogon-install.lock` (src/config.ts:256-260) for the whole sequence, taking the global lock only around the fast-forward (lock order: install lock, then global lock): own `git fetch <remote> <default_branch>`; when the root is on default_branch and HEAD is an ancestor of and behind <remote>/<default_branch>, `git merge --ff-only <remote>/<default_branch>`; then on every run `bun install --frozen-lockfile` and skill-link reconciliation split out of install() (links and dangling-link removal only, no herdr integration or plugin calls, a conflict printed not thrown). A failed install or link step retries at the next trigger with no pending state. (A,B,C)
- Output is one printed line: `deployed <old>..<new>` only when fast-forward, install and links all succeeded for the revision actually reconciled; otherwise the failing step, the git/bun error, the lag count and the remedy (`akrogon sync` when ahead or diverged; commit or finish the overlapping edit). Never throws; never alters the merge or next result. (A,B,C)
- Never checkout, stash, reset, rebase or merge root state; another branch, detached HEAD or a diverged root is skipped and reported. (A,B,C)
- `akrogon next` prints one line when its akrogon pass finds the root behind after the fetch and the step did not update it.
Foreclosed: 1a and 1b (new mental model: separate copy, settings move, relinks); 1d (operator stays the pump, failed once already 2026-09-27); auto-stash, reset or merge of root edits (never).
Accepted cost: unmerged edits in the root stay live for every seat, as before.

Correction 2026-10-10 (A, from the operation proof): `git pull --ff-only` is replaced by `git fetch <remote> <default_branch>` then `git merge --ff-only <remote>/<default_branch>`, because operator git config sets `pull.rebase=true`, which makes `git pull --ff-only` refuse on any unstaged change. Same behavior, same refusals for overlapping edits. The decisions above already carry the corrected step.

Off route (not this leaf): a separate runtime copy (1a/1b); herdr plugin manifest drift (operator relinks with `akrogon install`); the mixed-version window during a seat's pass (accepted); the direct route (akrogon has `direct: false`); landings by ancestry or from another machine deploy at the next trigger.

## Standing design
/home/ivan/.claude/skills/chart-issues/assets/standing-design.md

- Smallest real boundary: tests drive real git repos (a bare remote plus a clone standing in for the root, passed as the step's root parameter) and a real offline `bun install --frozen-lockfile` on a fixture lockfile, not mocked git. (A,C) The existing fake herdr covers the merge and next paths.
- New behavior shows one deliberate break turning its test red: criterion 1 fails with the step disabled.
- The step never runs `checks`; it only moves code that already passed the merge gate.
- No vanity tests: the guide text is checked by review, not by a test.

## Leaf architecture
- Owned: one self-update function (new small module beside install.ts, or inside install.ts); the link-reconciliation split of install() in src/install.ts (install() keeps its current behavior, including the conflict throw and herdr calls, by calling the split part); the phase-to-wake wiring in src/akrogon.ts:61-82 and the phaseCommand result in src/phase.ts, which gains the committed phase so the caller knows the move landed at `merged` on both the success path and the MoveCommittedError path (MoveCommittedError already carries `to`, src/phase.ts:122-131) (A,B,C); the call in mergeWake (src/next.ts:1287) before the pause read; the call in nextCommand for `--resume`, `--all` and a manual `next` whose selection includes akrogon, after the selection is computed (src/next.ts:1443) and before the global-lock block (src/next.ts:1448), so the fetch and the behind line print before any dispatch output (A,C); the behind line in `next`; tests in the existing install and next test files; docs/guide/install.md:37-41.
- Interface: no new config key, flag, command or state field. The phase result field is internal. The step takes the root to treat as its own checkout as a parameter defaulting to toolRoot (src/config.ts:170, fixed at import), which is the test seam for the identity check. (A,C)
- Lock: the install lock path is `git rev-parse --git-path akrogon-install.lock` run in the root, so it is root-scoped (`.git/akrogon-install.lock`); a leaf worktree's `setup` takes its own per-worktree path (src/config.ts:256-260). The lock stops two self-updates at once (merge wake plus a startup `next --all`). The step takes it with the existing `withLock` (src/state.ts:194, flock) and takes the global `resolve(globalHome(), '.lock')` with `withLock` only around the fast-forward. Order: install lock, then global lock. (A,C)
- Output, one line: `deployed <old>..<new>`; `current <sha>` when there was nothing to fast-forward and install and links succeeded; otherwise the failing step, the git or bun error, the lag count and the remedy. (A,C)
- Tests: a bare remote plus a clone as the root, with a fixture package.json holding no dependencies and its matching bun.lock, so `bun install --frozen-lockfile` runs real and offline. No clone of this repo. (A,C)
- Exclusions: no herdr integration or plugin call from the step; no checkout, stash, reset, rebase or merge of root state; no retry loop or pending record; no change to merge or dispatch decisions.
- Limit, stated: an already-running seat keeps the code and skill text it loaded; the change reaches the next invocation.
