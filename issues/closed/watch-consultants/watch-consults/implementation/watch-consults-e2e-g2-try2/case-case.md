# Case watch-consult-leaf-1

Opened by the akrogon watch on 2026-11-21.

- Anchor leaf: watch-consult-leaf (repo akre2e)
- Signature: cause blocked @ check.review; failing command `sh -c 'test ! -f BROKEN'`; base 936ff171fb41705774043514d22fa103f66c6fe5 (see signature.json)
- Failure: merge verify red on main — a `BROKEN` marker file sits at the root of origin/main, so the merge check `test ! -f BROKEN` fails. The leaf itself is blocked on the base, not on its own work.
- Attached leaves: none — one leaf fails; the same base defect would explain any other blocked leaf.
- Grouping reason: single leaf, single root cause (BROKEN file on main).
- Watch terminal: t1 in hc session akr-e2e-watch. Consultant: child terminal named aw-watch-consult.
- Exchange: turn-<n>-watch.md / turn-<n>-consultant.md in this folder.
- Operator stop list: credential/login/grant, spend past a recorded grant, operator decision or lock changes, host tooling installs, force push or history rewrite, fixes that change what was decided.
- Locks: leaf briefs/designs are fixed.
