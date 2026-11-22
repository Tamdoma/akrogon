# Consultant Turn 1 — watch-consult-leaf-1

## Root cause

Commit `d15db79a4ac8af91bae6ab2b2861b2a533d79d12` (`stage base red`) on `origin/main` added a tracked `BROKEN` marker file (contents: `staged base red`). Both `checks.test` and `merge_checks.merge` in `issues/config.yaml` execute `sh -c 'test ! -f BROKEN'`, which fails with exit code `1` whenever `BROKEN` is present on `main`. That base-branch failure caused `watch-consult-leaf` (whose worktree HEAD was also at `d15db79`) to fail with `blocked@check.review` (`merge verify red on main: test fails (BROKEN marker on main)`).

## Fix

- Created detached base worktree `/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` at `origin/main` (`d15db79a4ac8af91bae6ab2b2861b2a533d79d12`).
- Removed `BROKEN` and committed `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70` (`Remove BROKEN marker blocking main checks`, 1 file changed, 1 deletion) in the case worktree.
- Fast-forward pushed `HEAD:refs/heads/main` to `origin` (`/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home/remote.git`), advancing `origin/main` from `d15db79` to `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70`, and read back the updated ref via `git ls-remote` and `git fetch origin`.
- Moved the untracked `watch-consult-leaf-1/` verify logs created inside the case worktree to `/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/verify-logs`, then cleanly removed the detached worktree without `--force`.
- Left `issues/`, all `state.yaml` files, `/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults`, and the `watch-consult-leaf` worktree untouched.

## Verification

1. Reproduce on detached `origin/main` (`d15db79`):
   - `sh -c 'test ! -f BROKEN'` -> exit `1` (`BROKEN` present).
2. After `git rm BROKEN` and committing `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70` in the case worktree:
   - `sh -c 'test ! -f BROKEN'` -> exit `0`.
   - `akrogon verify --holder watch-consult-leaf-1` (without `AKROGON_HOME` set in env) -> exit `1` (`No initialized registered checkout for .../worktree`, because `AKROGON_HOME` was not exported in this terminal's environment).
   - `AKROGON_HOME=/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1` (cwd = case worktree) -> exit `0`:
     - `run 035f839e-f77b-4dea-8e67-d5810b9dba7f`
     - `verify setup: 0`
     - `verify test: 0`
     - `verify merge: 0`
     - `verify merge c6933728e3ac9bcb6718354a4d1ceb0e267bbb70: green`
     - Capture logs preserved in `/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/verify-logs`.
3. Fast-forward push and read-back:
   - `git push origin HEAD:refs/heads/main` -> exit `0` (`d15db79..c693372  HEAD -> main`).
   - `git ls-remote origin refs/heads/main` -> `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70	refs/heads/main`.
   - `git -C /var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults fetch origin && git -C /var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults rev-parse origin/main` -> `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70`.
4. Cleanup:
   - `git -C /var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults worktree remove /var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` -> exit `0`.
   - `git -C /var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults worktree list` confirms only the main checkout and `watch-consult-leaf` worktree remain.

## Resume

- Leaf: `watch-consult-leaf`
- Phase: `check.fix`
- Why: `origin/main` is now green at `c6933728e3ac9bcb6718354a4d1ceb0e267bbb70` with `BROKEN` removed and verified via `akrogon verify --holder watch-consult-leaf-1`. The leaf's `failure.phase` is `check.review`, and `check.review` is never a direct resume target, so it should resume at `check.fix`.

## Disagreement

None. Diagnosis, base repair, verification, and resume target align with `case.md`. (Environmental note: `AKROGON_HOME` was unset in the consultant shell, so running `akrogon verify` required `AKROGON_HOME=/var/tmp/akr-1000/wc7-e2e/akr-e2e-watch-consults-home`.)
