# Watch consult turn 1 — watch-consult-leaf-1

## Root cause

Commit `ebf8d7d14ae993f993c9beb428f084e63eb97adf` (`stage base red`) on `origin/main` committed the file `BROKEN` (contents: `staged base red`). Both declared checks in `issues/config.yaml` — `checks.test` (`sh -c 'test ! -f BROKEN'`) and `merge_checks.merge` (`sh -c 'test ! -f BROKEN'`) — assert that `BROKEN` does not exist. With `BROKEN` present on `origin/main`, `akrogon verify` (merge scope) fails at `test` (exit 1) and blocks `merge`, making `origin/main` red for `watch-consult-leaf` (whose detached HEAD is also `ebf8d7d`, clean, with no leaf-only commits).

## Fix

- Commit `d51ce97c30b380caa73a5f3548a4baff953960e4` (`Remove BROKEN marker from main`): `git rm BROKEN` (1 file changed, 1 deletion).
- Created in detached consult worktree `/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` from `origin/main` (`ebf8d7d14ae993f993c9beb428f084e63eb97adf`), fast-forward pushed to `origin/main` (`ebf8d7d..d51ce97 HEAD -> main`), read back via `git ls-remote origin refs/heads/main` and `git fetch origin`, and then removed cleanly with `git worktree remove` (no `--force`).
- No edits were made in `/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults`, `issues/`, `state.yaml`, or the leaf worktree `/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-wtr/watch-consult-leaf`.

## Verification

1. **Pre-fix reproduction** on `ebf8d7d14ae993f993c9beb428f084e63eb97adf` in the consult worktree:
   - Command: `AKROGON_HOME=/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1`
   - Result: exit `1` — `verify setup: 0`, `verify test: 1`, `verify merge: blocked by test (1)`, `verify merge ebf8d7d14ae993f993c9beb428f084e63eb97adf: red` (run `cd3106f9-94f7-4358-ae90-ec322b05940a`).
2. **Post-fix verification** on `d51ce97c30b380caa73a5f3548a4baff953960e4` in the consult worktree:
   - Command: `AKROGON_HOME=/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-home akrogon verify --holder watch-consult-leaf-1`
   - Result: exit `0` — `verify setup: 0`, `verify test: 0`, `verify merge: 0`, `verify merge d51ce97c30b380caa73a5f3548a4baff953960e4: green` (run `b3240838-ba85-4bb1-8d84-ff1b790e30be`; verify logs moved to `/var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/verify-logs/`).
3. **Push and readback**:
   - `git push origin HEAD:refs/heads/main` — fast-forward `ebf8d7d..d51ce97 HEAD -> main` (exit `0`).
   - `git -C /var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults fetch origin` and `git ls-remote origin refs/heads/main` / `git rev-parse origin/main` — both returned `d51ce97c30b380caa73a5f3548a4baff953960e4` (exit `0`).
4. **Worktree cleanup**:
   - `git -C /var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults worktree remove /var/tmp/akr-1000/wc2-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1/worktree` — exit `0`, verified removed via `git worktree list`.

## Resume

- Resume `watch-consult-leaf` at phase `check.review` (the phase recorded in `failed=blocked@check.review`), incorporating the new `origin/main` (`d51ce97c30b380caa73a5f3548a4baff953960e4`). The sole blocker was the `BROKEN` file on `origin/main`, which is now removed and verified green; the leaf worktree itself had no local commits beyond `ebf8d7d` and was left clean.

## Disagreement

None. The watch's diagnosis in `case.md` (base defect on `origin/main` caused by the committed `BROKEN` marker failing `test`/`merge` checks) matches the reproduced evidence and fix.
