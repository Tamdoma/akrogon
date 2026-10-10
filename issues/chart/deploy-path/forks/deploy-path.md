# Deploy path

## Question
Q1. How should landed akrogon work reach the command, skills and plugin every seat runs, so merged means in effect without a manual pull?
Options shown: 1a separate runtime with one folder per release and an atomic `current` link; 1b one deploy clone fast-forwarded in place; 1c the command fast-forwards the root checkout after each landing, warning when refused; 1d warn only.
Q2-Q4 (switch timing, settings home, which version deploys) applied only to 1a.

### Carries
- Locks: clean-merge-gate, merge-load-flakes, lesson-guards, merge-throughput charts (not reopened).
- Operator 2026-10-10: "I don't want to have another mental model upgrade."

## Findings
- Research: practitioner, Capistrano/Deployer release dirs with atomic symlink (https://deployer.org/blog/atomic-symlinks, https://github.com/rafaelbiriba/cap_blue_green_deploy, read 2026-10-10): atomic pointer swap avoids half-updated reads. Better-than-training: origin src/akrogon.ts:61-115 lazy-imports subcommands, so an in-place update can mix versions in one call (B, confirmed C).
- A,B,C first picked 1a (slots/deploy-path-merged.md). Rebuttals: B (slots/deploy-path-rebuttal-B.md) wanted drain-before-switch; C (slots/deploy-path-rebuttal-C.md) withdrew in-place ff, moved state home to ~/.config/akrogon, deploy latest origin tip.
- A correction 2026-10-10: `git pull --ff-only` succeeds with uncommitted edits unless the same files changed upstream; leaves never change issues/, so the usual dirty issue files do not block it. 1c was understated in round 1.
- C: ~/.config/herdr/plugins.json is a snapshot from link time (startup `next.sh --all` vs toml `--resume`); a pull never updates it.

## Taken
Operator 2026-10-10: "1c".
Reason (operator, preceding message): no new mental model; the root stays the program.
Binding decisions (operator 1c; mechanism shaped by A with B,C focused checks 1-3, slots/deploy-path-final-check*.md, slots/deploy-path-shape3.md):
- One self-update step, keyed on realpath(repo.root) == realpath(toolRoot), so consumer repos never update akrogon. (A,B,C)
- Triggers only: (a) mergeWake for the akrogon repo when the committed move's `to` is `merged`, run before mergeWake's pause check (the step changes no leaf state); (b) `akrogon next --resume`, `next --all` and a manual `next` whose selected repos include akrogon. Per-pane hooked events are not triggers. (A,C)
- (Superseded in the step below: `git pull --ff-only` reads `git fetch` + `git merge --ff-only`, see Correction.) Step, under the existing shared `akrogon-install.lock` (src/config.ts:256-260) for the whole sequence, taking the global lock only around the pull (lock order: install lock, then global lock): own `git fetch <remote> <default_branch>`; when the root is on default_branch and HEAD is an ancestor of and behind <remote>/<default_branch>, `git pull --ff-only <remote> <default_branch>`; then on every run `bun install --frozen-lockfile` and skill-link reconciliation split out of install() (links and dangling-link removal only, no herdr integration or plugin calls, a conflict printed not thrown). A failed install or link step retries at the next trigger with no pending state. (A,B,C)
- Output is one printed line: `deployed <old>..<new>` only when pull, install and links all succeeded for the revision actually reconciled; otherwise the failing step, the git/bun error, the lag count and the remedy (`akrogon sync` when ahead or diverged; commit or finish the overlapping edit). Never throws; never alters the merge or next result. (A,B,C)
- Never checkout, stash, reset, rebase or merge root state; another branch, detached HEAD or a diverged root is skipped and reported. (A,B,C)
- `akrogon next` prints one line when its akrogon pass finds the root behind after the fetch and the step did not update it.
Foreclosed: 1a and 1b (new mental model: separate copy, settings move, relinks); 1d (operator stays the pump, failed once already 2026-09-27); auto-stash, reset or merge of root edits (never).
Accepted cost: unmerged edits in the root stay live for every seat, as before.

### Correction 2026-10-10 (A, from the operation proof below)
`git pull --ff-only` is replaced by `git fetch <remote> <default_branch>` then `git merge --ff-only <remote>/<default_branch>`. Reason: operator git config sets `pull.rebase=true` (~/.config/git/config), which makes `git pull --ff-only` refuse on any unstaged change, so 1c would almost never run. Same 1c behavior, same refusals for overlapping edits.

### Proofs 2026-10-10 (identity: operator's local git and bun, user ivan, no credentials beyond the existing GitHub HTTPS read)
- `git fetch origin main` on /home/ivan/Work/infra/akrogon, git 2.56.0: exit 0, FETCH_HEAD updated; read-only. Limits: does not prove push or auth for private remotes.
- `git pull --ff-only origin main` on the root (dirty issue files): exit 128 "cannot pull with rebase: You have unstaged changes" (pull.rebase=true). No change made. Drove the correction above.
- Throwaway clone of https://github.com/Tamdoma/akrogon.git at scratchpad/ffprobe, reset 3 behind, one unrelated dirty file: `git fetch -q origin main && git merge --ff-only origin/main` exit 0, fast-forwarded, dirty file kept. Same clone reset, dirty file overlapping an incoming change: exit 1 "Please commit your changes or stash them before you merge. Aborting", no change. Cleanup: clone deleted, absence confirmed by ls. Limits: does not prove behavior under a concurrent writer or a diverged root.
- `bun install --frozen-lockfile` on the root, bun 1.4.2: exit 0 "no changes". Limits: does not prove a lockfile change installs cleanly.
