# Case watch-consult-leaf-1

Status: open

Anchor leaf `watch-consult-leaf` in repo `akre2e` failed at check.review:
`failed blocked merge verify red on main: test fails (BROKEN marker on main)`.

The repo's `test` check runs `test ! -f BROKEN`; origin/main carries a BROKEN
file at the root, so merge verify is red for every leaf. The leaf itself is fine;
two recovery cycles were already unproductive (check.review -> failed, twice),
which is why the watch opened this case.

The consultant is tasked to remove the BROKEN marker from main in a detached
case worktree, prove the fix with akrogon verify, and push fast-forward only.
On success the leaf resumes at check.fix (failure.phase check.review maps to it).

Watch address: t1. Watcher terminal name: akr-e2e-watcher.
Timer: t2 (aw-watch), 20-minute ticks.
