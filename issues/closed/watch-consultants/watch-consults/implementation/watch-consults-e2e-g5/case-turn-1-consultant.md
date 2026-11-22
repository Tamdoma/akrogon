# Consultant turn 1 — watch-consult-leaf-1

## Root cause

Commit `508a0e2f63542d643f981a40712c5c2c2f02983a` ("stage base red") on `origin/main` added a tracked marker file `BROKEN` (containing `staged base red`) at the repository root. Both the repo's declared check `test` and merge check `merge` in `issues/config.yaml` run `sh -c 'test ! -f BROKEN'`, which fails with exit code 1 whenever `BROKEN` is present. Because the defect lived on `origin/main`, `watch-consult-leaf` (whose worktree HEAD was also `508a0e2` with a clean tree) was blocked at `check.review` with `"merge verify red on main: test fails (BROKEN marker on main)"`.

## Fix

- Created detached worktree `/var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` at `origin/main` (`508a0e2f63542d643f981a40712c5c2c2f02983a`).
- Removed `BROKEN` (`git rm BROKEN`) and committed inside the detached case worktree:
  - Commit: `4503d5f4529542dcc29fd2e3c9031b30a15df546` (`Remove BROKEN marker from main`)
  - Diff: `BROKEN | 1 -` (1 file changed, 1 deletion)
  - Tree: `74a095a316c9942fad67acfddd781ee3b46d515f`
- Pushed fast-forward to `origin/main`: `508a0e2..4503d5f HEAD -> main` on `/var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home/remote.git`.
- Read back `origin/main` via `git fetch origin`, `git ls-remote origin refs/heads/main`, and `git rev-parse origin/main` — all returned `4503d5f4529542dcc29fd2e3c9031b30a15df546`.
- Removed the detached case worktree via `git worktree remove`. No commits were made in `/var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults` or in the leaf worktree, and `issues/` and `state.yaml` were not modified.

## Verification

1. Before fix, in `<case>/worktree` at `508a0e2`:
   - `sh -c 'test ! -f BROKEN'` → exit 1 (failed as expected).
2. After fix, in `<case>/worktree` at `4503d5f4529542dcc29fd2e3c9031b30a15df546`:
   - `sh -c 'test ! -f BROKEN'` → exit 0 (pass).
   - `AKROGON_HOME=/var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1` → exit 0, run `12db3408-86ad-4040-aa1c-9e60cd91dc5c`:
     - `verify setup: 0`
     - `verify test: 0`
     - `verify merge: 0`
     - `verify merge 4503d5f4529542dcc29fd2e3c9031b30a15df546: green`
     (Cleaned up the relative `watch-consult-leaf-1/` log subdir created inside `<case>/worktree` before verifying again with the case path.)
   - `AKROGON_HOME=/var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home akrogon verify --holder /var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1` → exit 0:
     - `reuse receipt 12db3408-86ad-4040-aa1c-9e60cd91dc5c tree=74a095a316c9942fad67acfddd781ee3b46d515f`
3. Post-push read-back and cleanup:
   - `git push origin HEAD:refs/heads/main` → exit 0 (`508a0e2..4503d5f HEAD -> main`).
   - `git fetch origin` + `git ls-remote origin refs/heads/main` + `git rev-parse origin/main` → `4503d5f4529542dcc29fd2e3c9031b30a15df546`.
   - `git worktree remove <case>/worktree` + `git worktree list` → case worktree removed; only main checkout and leaf worktree remain.

## Resume

- Leaf: `watch-consult-leaf`
- Phase: `check.fix`
- Reason: `origin/main` is now green at `4503d5f4529542dcc29fd2e3c9031b30a15df546` with `BROKEN` removed and verified by `akrogon verify`. Because `watch-consult-leaf` has `failure.phase: check.review` (and `check.review` is never a direct resume target; `merge`, `check.repair`, and `check.review` resume at `check.fix`), resume `watch-consult-leaf` at `check.fix`.

## Disagreement

None. The watch's diagnosis in `case.md` (base defect `BROKEN` on `origin/main` `508a0e2`, base repair via detached worktree + `akrogon verify` + fast-forward push, resume `watch-consult-leaf` at `check.fix`) matches what was observed and fixed.
