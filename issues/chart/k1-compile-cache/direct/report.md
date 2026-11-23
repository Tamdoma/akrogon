# Direct report: k1-compile-cache

Landed 0383d6008b79a38dfebed59d671ab09dbd22b205 on main (base f08d7e9c).

- 682f11e4: run-check sets NODE_DISABLE_COMPILE_CACHE=1 in every checked command's env. The copy-if-set path is gone.
- e055ac38: the land and verify services set it too.
- 0383d600: the verify service sets it after the repo's pass_env, so a repo value cannot turn the cache back on.

Review: D fix, fix, ready (slots/review-D-1..3.md). Rebased onto f08d7e9c after round 3 with no content change.
Verify: merge green on 0383d600 (check-test-1795375065433-2590588.log). An earlier run had 1 failure (the known agy reset flake); its known-red check found no matching base red, so the full verify was rerun at load < 20. Earlier reds were host-load timeouts and the cross-home temp deletion that land-own-reds fixes.
Guards: passed. #148 stays open until run-scratch lands.
