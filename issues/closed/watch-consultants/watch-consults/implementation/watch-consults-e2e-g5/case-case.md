# Case watch-consult-leaf-1

Leaf `watch-consult-leaf` in repo akre2e failed at check.review, cause `blocked`:
"merge verify red on main: test fails (BROKEN marker on main)".

Main's tip (508a0e2, "stage base red") carries a `BROKEN` marker file, so the repo's
merge check `sh -c 'test ! -f BROKEN'` fails on main and no leaf can merge. This is a
defect on main, not in the leaf's work, so the watch opened a consult case.

Expected fix: remove the BROKEN marker on a detached worktree off origin/main, prove
with the failing command plus `akrogon verify --holder` (checks and merge_checks),
push fast-forward to origin/main, then the leaf resumes at check.fix (failure.phase
is check.review, so the resume target is check.fix).

Watch terminal: t1, hc session akr-e2e-watch. Timer: t2.
Case folder: /var/tmp/akr-1000/wc6-e2e/akr-e2e-watch-consults-home/watch/akre2e/consults/watch-consult-leaf-1
