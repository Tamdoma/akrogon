# Direct report: codex-seat-scope

Base 9a7cf4166ad1ba094f5aef9d16817f26c5181f87, head 4325f9ce566c5d8588f84b7a214422e1dffe62a0, worktree /home/ivan/.akrogon/worktrees/akrogon/codex-seat-root.

## Commits

- 27bdd983 test: the red-first cases (Test-Change trailer).
- 26b5ad9b test: the bash-launcher case counts only `t-` entries under tools/. My own new assertion first listed the cgroup control files (real output in check-targeted-1795623872019-3858060.log). The expectation is unchanged (Test-Change trailer).
- 4325f9ce fix: seatWrap for every kind, the placementShell skip, the spawnHelper scrub, src/AREA.md.

## Changed files

- src/seat.ts: every harness execs through `sh -c 'export AKROGON_SEAT_PID=$$[ PATH=<entry>:$PATH]; exec "$0" "$@"'`. agy's PATH prefix rides the same hop (Taken 2).
- src/tool-cgroup.ts: placementShell returns early when `$$` equals AKROGON_SEAT_PID. Unset means place as before (Taken 1). spawnHelper drops AKROGON_SEAT_PID from the helper env beside the other two markers.
- src/AREA.md: describes the hop and the skip.
- tests/tool-entry.test.ts: see Commits.

## Proof

| criterion | command | commit | result |
| --- | --- | --- | --- |
| seat launcher stays at scope root, forked bash placed; marker set to another pid places; every kind has the hop; bash-launcher codex seat starts with no seat `t-` | run-check red-on-base: `bun test tests/tool-entry.test.ts` | 27bdd983 on base src | red, 3 fail: case s got `.../tentry.scope/tools/t-3837158-9862320`; argv "claude launch hop" -1; the bash-launcher seat refused `seat outside its leaf scope`, cgroup `.../tools/t-3837441-9862357` (the production error). check-red-on-base-1795623700451-3837015.log |
| same, plus no regression in the entry, tracing, kill and hc-start | run-check targeted: typecheck + 4 test files | 4325f9ce tree (uncommitted test fix, then committed as 26b5ad9b) | green, 18 pass. check-targeted-1795623894086-3863118.log |
| every check | `akrogon verify --holder <chart>/direct` | 4325f9ce | green: format 0, typecheck 0, test 0 (1496 pass, 0 fail across 99 files, changed-file rerun x5 20 pass). check-test-1795624031428-3867362.log |

Deliberate break: the base src is the break (no skip, no hop), and all three new cases are red on it.

## Known limitations

- Fork-and-wait launchers (a forked bash child execs the harness) remain a silent residual (fork Taken, Off route).
- A wrapper's forked startup child (omarchy-agent-account-home) mints one empty `t-`, which the next sweep removes.
- Proven against a bash launcher stand-in, not a live interactive codex seat (S7a, free tests). The live confirmation is the N2 restart after install.
- Wall time: verify about 2.5 min, targeted under 1 min.
