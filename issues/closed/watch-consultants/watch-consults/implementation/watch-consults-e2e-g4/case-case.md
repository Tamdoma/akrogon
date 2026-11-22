# Case watch-consult-leaf-1

Anchor leaf `watch-consult-leaf` is `failed` at `check.review` (cause `blocked`): merge verify on `main` is red because the file `BROKEN` is committed on the base (origin/main HEAD `115d097`), and the repo's `checks.test` / `merge_checks.merge` is `test ! -f BROKEN`. The leaf cannot fix this itself; a consultant was opened to repair the base in a detached worktree and push fast-forward to `origin/main`.

- Watch address: t1 (hc session akr-e2e-watch); timer: t2
- Leaf worktree: /var/tmp/akr-1000/wc5-e2e/akr-e2e-watch-consults-wtr/watch-consult-leaf
- State: /var/tmp/akr-1000/wc5-e2e/akr-e2e-watch-consults/issues/open/e2e/watch-consult-leaf/state.yaml
- Status: open
