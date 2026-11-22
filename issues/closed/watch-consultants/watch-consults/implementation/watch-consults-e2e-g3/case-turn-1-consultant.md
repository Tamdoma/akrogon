# Turn 1 — Consultant report (watch-consult-leaf-1)

## Root cause

`origin/main` at `0fdfa3a3c000fc17b7eba8e65d1b439b7d2fd443` (`stage base red`) added a `BROKEN` marker file at the repository root. Both declared checks in `issues/config.yaml` — `checks.test` (`sh -c 'test ! -f BROKEN'`) and `merge_checks.merge` (`sh -c 'test ! -f BROKEN'`) — fail whenever `BROKEN` exists in the tree, making `akrogon verify` red on `origin/main` for every leaf. Reproduced in the detached case worktree at `0fdfa3a3c000fc17b7eba8e65d1b439b7d2fd443`, where `akrogon verify --holder watch-consult-leaf-1` exited `1` (`verify test: 1`, `verify merge: blocked by test (1)`).

The anchor leaf `watch-consult-leaf` worktree (`/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults-wtr/watch-consult-leaf`) was clean at `0fdfa3a` with no leaf-local defect.

## Fix

- Commit `c5e8f439895a92d54710c67b250142053ec03d94` (`Remove BROKEN marker from main`): deleted `BROKEN` (`1 file changed, 1 deletion(-)`).
- Created in detached case worktree `/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` from `origin/main` (`0fdfa3a3c000fc17b7eba8e65d1b439b7d2fd443`).
- Pushed fast-forward only to `origin/main` (`0fdfa3a..c5e8f43 HEAD -> main`), verified by `git fetch origin`, `git ls-remote origin refs/heads/main`, and `git ls-tree --name-only origin/main` (only `.gitignore` and `issues` at root).
- Case worktree removed cleanly via `git worktree remove` (without `--force`) after read-back.
- No commits were made in `/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults` or in any leaf worktree, and `issues/` was not modified.

## Verification

1. Before fix (`0fdfa3a3c000fc17b7eba8e65d1b439b7d2fd443`, cwd = case worktree):
   - `AKROGON_HOME=/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1` -> exit `1` (`run 8fb85abf-ece9-4de9-b9bf-5204e1ccecc9`: `verify setup: 0`, `verify test: 1`, `verify merge: blocked by test (1)`, `verify merge 0fdfa3a3c000fc17b7eba8e65d1b439b7d2fd443: red`).
   - Note: `AKROGON_HOME` was not set in the consultant shell environment, so an initial `akrogon verify --holder watch-consult-leaf-1` without `AKROGON_HOME` failed with `No initialized registered checkout`; setting `AKROGON_HOME=/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults-home` resolved the registered `akre2e` repo.
2. After fix (`c5e8f439895a92d54710c67b250142053ec03d94`, cwd = case worktree):
   - `AKROGON_HOME=/var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1` -> exit `0` (`run 4cd519dc-2b7f-4ac7-85fc-db56b6b4ac28`: `verify setup: 0`, `verify test: 0`, `verify merge: 0`, `verify merge c5e8f439895a92d54710c67b250142053ec03d94: green`).
   - `sh -c 'test ! -f BROKEN'` -> exit `0` (`DIRECT_CHECK=PASS`).
3. Push & read-back:
   - `git -C <case>/worktree push origin HEAD:refs/heads/main` -> exit `0` (`0fdfa3a..c5e8f43 HEAD -> main`).
   - `git -C /var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults fetch origin` -> exit `0`.
   - `git -C /var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults ls-remote origin refs/heads/main` -> `c5e8f439895a92d54710c67b250142053ec03d94	refs/heads/main`.
   - `git -C /var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults rev-parse origin/main` -> `c5e8f439895a92d54710c67b250142053ec03d94`.
   - `git -C /var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults ls-tree --name-only origin/main` -> `.gitignore`, `issues` (`BROKEN` absent).
   - `git -C /var/tmp/akr-1000/wc4-e2e/akr-e2e-watch-consults worktree remove <case>/worktree` -> exit `0`.

## Resume

- Leaf: `watch-consult-leaf`
- Phase: `check.fix`
- Why: `origin/main` is now green at `c5e8f439895a92d54710c67b250142053ec03d94` with `BROKEN` removed and verified via `akrogon verify`. Per the failure mapping, `watch-consult-leaf` has `failure.phase: check.review` (which is never a direct resume target), so it resumes at `check.fix`.

## Disagreement

None. The watch's diagnosis in `case.md` matches the observed root cause, fix, and resume target (`watch-consult-leaf` at `check.fix`).
