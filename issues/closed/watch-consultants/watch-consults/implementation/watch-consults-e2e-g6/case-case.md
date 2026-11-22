# Case watch-consult-leaf-1

Opened by watch at 2026-11-22 (fire after `started t2`).

- Anchor: watch-consult-leaf (akre2e). No attached leaves.
- Failure: `failed=blocked@check.review` — merge verify red on main: `sh -c 'test ! -f BROKEN'` fails because a BROKEN marker file sits on main. Base and leaf HEAD both at d15db79.
- Why a case: two consecutive failed -> check.review cycles in issues/log.jsonl, and the defect is on main, outside the leaf.
- Plan: consultant removes the BROKEN marker on a detached worktree of origin/main, proves with `akrogon verify --holder watch-consult-leaf-1`, fast-forward pushes origin main. On verified fix, resume leaf at check.fix.
