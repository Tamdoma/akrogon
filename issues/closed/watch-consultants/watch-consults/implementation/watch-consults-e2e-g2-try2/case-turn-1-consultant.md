# Consultant Turn 1 — watch-consult-leaf-1

## Root cause

Commit `936ff171fb41705774043514d22fa103f66c6fe5` (`stage base red`) added a `BROKEN` marker file (containing `staged base red`) at the root of `origin/main`. Both the repository's `checks.test` and `merge_checks.merge` declared in `issues/config.yaml` run `sh -c 'test ! -f BROKEN'`, which fails whenever `BROKEN` exists on the base branch. The leaf `watch-consult-leaf` is clean at `936ff17` with no leaf-local defect; it was blocked strictly by this base defect on `origin/main`.

## Fix

- Base repair commit `f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44` (`Remove BROKEN marker from main`), created in detached case worktree `/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` from `origin/main`, deleting `BROKEN` (`1 file changed, 1 deletion(-)`).
- Fast-forward pushed to `origin/main` (`936ff17..f3fc9de  HEAD -> main`), read back via `git fetch origin` + `git rev-parse origin/main` (`f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44`), and removed the case worktree cleanly afterward.
- No changes were made in the main checkout (`/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults`), the leaf worktree (`/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-wtr/watch-consult-leaf`), `issues/`, or any `state.yaml`.

## Verification

All verification commands ran inside `<case>/worktree` at commit `f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44` (tree `f8bdcced14d125a22ad796d495bf0bf5aa8a990a`):

1. Failing command:
   - `sh -c 'test ! -f BROKEN'` -> exit `0`
2. Declared checks and merge checks via `akrogon verify`:
   - `AKROGON_HOME=/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1` -> exit `0`, run `5f568711-06df-41d8-9cb5-f610aded4502`:
     - `verify setup: 0`
     - `verify test: 0`
     - `verify merge: 0`
     - `verify merge f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44: green`
   - Cleaned up the relative holder subdir and re-verified with the full `<case>` holder path:
     `AKROGON_HOME=/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-home akrogon verify --holder /var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1` -> exit `0` (`reuse receipt 5f568711-06df-41d8-9cb5-f610aded4502 tree=f8bdcced14d125a22ad796d495bf0bf5aa8a990a`).
   - Note: `akrogon verify` without `AKROGON_HOME` failed with `No initialized registered checkout` because `AKROGON_HOME` was not exported in the consultant environment; setting `AKROGON_HOME=/var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults-home` resolved the registered `akre2e` checkout.
3. Push and read-back:
   - `git -C <case>/worktree push origin HEAD:refs/heads/main` -> exit `0` (`936ff17..f3fc9de  HEAD -> main`)
   - `git -C /var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults fetch origin && git -C /var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults rev-parse origin/main` -> `f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44`
   - `git -C /var/tmp/akr-1000/wc3-e2e/akr-e2e-watch-consults worktree remove <case>/worktree` -> exit `0`

## Resume

- Leaf: `watch-consult-leaf`
- Phase: `check.fix`
- Why: `watch-consult-leaf` failed with `failure.cause=blocked` and `failure.phase=check.review` due solely to the `BROKEN` marker on `origin/main`. Now that `origin/main` is green at `f3fc9de8f74e6e23cabe5cfb4c724d96429b4d44`, the leaf can rebase/re-verify against the repaired base. Per resume rules, because `failure.phase` is `check.review` (never a direct target), the resume phase is `check.fix`.

## Disagreement

None — root cause matches the watch's case diagnosis (`BROKEN` marker on `origin/main`).
