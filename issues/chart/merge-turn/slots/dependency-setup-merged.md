# dependency-setup, merged round (A, B, C)

Sources: slots/dependency-setup-A.md, -B.md, -C.md. Measurements: A (throwaway detached framework worktree, removed) first `bun install --frozen-lockfile` 453ms, repeat 7ms, `markdown-it` present; C (scratch folder, Bun 1.4.2) 0.44s and 0.009s. Warm cache, one machine.

## Q1. Who installs a worktree's packages, and when?
- 1a (B,C recommended; A moves here from its setup-key form): each dependency-using command under `checks` and `merge_checks` in the repo's own `issues/config.yaml` starts with the install, e.g. `bun install --frozen-lockfile && bun run hooks:parity`. Install happens at the same moment and on the same commit as the check, whoever runs it: seat, worker (`test_changed` carries it, `skills/implement-issue/SKILL.md:55`), rebased leaf, or the batch run on the stacked top. The batch lockfile rule carried from merge-order 1d is met with no code. New in akrogon: no code, no setting. New elsewhere: the prefix in akrogon's and framework's configs, one sentence in `docs/guide/setup.md:53-54` and in `skills/init-akrogon/SKILL.md:20` so new repos get it (C), and one skill sentence that direct criterion proofs run outside the listed commands prepare the same way (B). Cost: the prefix repeats per line, and a line added later without it brings the bug back for that command (C).
- 1b (C): one `setup` key that `akrogon config` prepends to every check it prints. Cost: new key, the command a seat runs differs from the file.
- 1c (A's first form, B, C): `setup` key run by akrogon at worktree creation and after stacking. Cost: install under the global dispatch lock (`src/next.ts` allocate, B `:338,774`), misses seat rebases and leaf-added packages, so seats still need a rule (B,C). A withdraws it.
- 1d (B,C): skill text only. Cost: a forgetful seat brings the bug back silently.

## Q2. Should worktrees stay inside the main checkout? (C, new)
- 2a (C recommended, A agrees): leave them. After 1a each worktree has its own install, found first. Leftover case: a leaf imports a package it never declared that the root happens to have; checks pass, a clean clone fails (B,C). New: nothing.
- 2b (C): move worktrees outside via the existing `worktree_root` setting (`src/config.ts:128-130`, `src/init.ts:53-55`). Makes the leftover case fail loudly. Cost: move existing worktrees and fix recorded paths by hand (`docs/guide/setup.md:69`); seats work outside the repo, possible permission prompts; needs a one-leaf trial.
- 2c: share root packages by link. Off route.

## Pitfalls avoided
- `&&` so a failed install never yields a test result (B). `--frozen-lockfile` fails loudly on a lockfile and `package.json` mismatch instead of testing something else (A,B,C).
- `node_modules/` is ignored in both repos, so installs never trip the dirty-worktree guard (`src/phase.ts:225-226`) (C).
- Record-only restack under issues-only 1a reuses green evidence; no install or suite just because the SHA changed (B).
- Concurrent installs (A,C): A and B seats can run checks in one worktree at once during review, and several worktrees install against Bun's shared cache. Untested.
- Probe before handoff (B, pending): frozen install in disposable worktrees of akrogon and framework, record Bun version and exit, include a package present only in the parent to show the local install is found first, remove the worktrees.

## Done-criteria (B,C)
- A new worktree with no `node_modules` passes its first check command without a separate install step.
- A batch whose carried member adds a package passes its single check run; a restored member is prepared again before its solo run.
- A lockfile that does not match `package.json` fails the check with the install error.
- Evidence shows the resolved package path and version.

## Challenge check
- 1a is a convention per repo, not enforced (C). Only 2b makes a forgotten prefix fail loudly.
- 1a assumes cheap installs; a cold cache or slow package manager pays per command (C).

## After rebuttals
- C 1 accepted: the prefix goes on every line under `checks` and `merge_checks`, no judgment of which use packages (`format` runs prettier, `package.json:8`).
- C 2 accepted: probe split. Same package with different versions in root and worktree resolves to the worktree (tests 1a). A parent-only package resolves from the parent (known cost of 2a).
- B F1 accepted: both repos commit `bun.lock` (`git ls-files`); init proposes the prefix only with a committed lockfile.
- B F3 accepted: 2b removes this checkout's parent lookup, it does not enforce preparation (Bun auto-install can download imports when no parent `node_modules` exists).
- B F2 accepted and probed now, see below.

## Concurrency probe (A, 2026-10-05, Bun 1.4.2, throwaway detached framework worktree at origin/main, removed and pruned, 0 left)
- Three `bun install --frozen-lockfile` at once on an empty `node_modules`, three rounds: two of three exited 1 every round. A later single install reported "no changes" and `markdown-it` resolved inside the worktree.
- Four at once on an installed `node_modules`, three rounds: round 1 all four exited 1, round 2 all 0, round 3 two exited 1. So even no-op installs collide.
- Three at once wrapped in `flock .akrogon-install.lock`, empty `node_modules`, three rounds: all exited 0. The lock file showed as untracked (`?? .akrogon-install.lock`), which would trip the dirty-worktree guard (`src/phase.ts:225-226`); a lock path under the git dir (`git rev-parse --git-path`) would not.
- Who runs at once: subagent workers each run `test_changed` in the same worktree (`skills/implement-issue/SKILL.md:55`); A and B can run checks together in review. So 1a as merged gives spurious reds.
- Limits: one machine, warm cache, framework only; error text not captured (logs empty of "error").

## Follow-up (slots/dependency-setup-followup-B.md, -C.md)
- B picks (z): akrogon installs at creation and after command-owned integration, outside the global lock, with a completion gate; B lists the new parts (key, calls, gate, interrupted-prep handling, cancellation waiting).
- C picks (y): one `setup` key; `akrogon config` prints each check as lock, setup, then the check. Against (z): a missed install moment fails silently through the parent lookup, and the list is already longer (restore after red batch, seat-resolved lockfile conflicts `skills/merge-issue/SKILL.md:41`, detached base checkouts `skills/implement-issue/SKILL.md:38`).
- A picks (y): same level-based reasoning as turn-release 1a; fewer new parts than (z).

## Composed-command probe (A, 2026-10-05, Bun 1.4.2, throwaway detached framework worktree at origin/main, removed and pruned, 0 left)
- Command: `flock "$(git rev-parse --git-path akrogon-install.lock)" bun install --frozen-lockfile && bun run hooks:parity && bun run contracts:verify`, four at once.
- Rounds: two from empty `node_modules`, three installed. All 20 runs exited 0. `git status --porcelain` empty; lock file at `.git/worktrees/fw-probe/akrogon-install.lock`.
- Limits: one machine, warm Bun cache, framework only, cheap checks (not `framework:verify`); does not cover a seat changing packages while another check runs.
