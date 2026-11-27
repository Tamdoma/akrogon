# Intake: test-temp-leftovers

## Scope

Destination repo: akrogon (registered). akrogon's own test suite leaves host temp behind on every run: `/var/tmp/akr-1000/<hash>` dirs and empty `~/.akrogon/worktrees/akrogon-XXXXXX` dirs. The outcome: a test run leaves no host dir or worktree-store dir behind. Handed second, after fresh-worktree-setup (handed off 2026-11-25).

## Provenance

- Operator: door message 2026-11-25 (t126), full autopilot. No GitHub seed.

## Source: operator door message 2026-11-25

yes, fix it all the best way you can. Use the active consultants to chart and hand off to to the w-akrogon watcher. Full autopilot mode. I have to go. Be autonomous. Do your best.

(Context: this answered the door's question about #158, a new seed nobody was working on, and the test-suite temp leftovers the door had just cleaned up: about 2,900 `/var/tmp/akr-1000/<hash>` host dirs and 35 empty `~/.akrogon/worktrees/akrogon-XXXXXX` dirs left by akrogon's own test runs in two days.)

## Agent findings

- 2026-11-25 morning: the door removed 2838 `/var/tmp/akr-1000/*` dirs older than 6 h, plus `/var/tmp/akr-1000/5d20/0b69a262` and 35 empty `~/.akrogon/worktrees/akrogon-??????` dirs. At 2026-11-25T12:01:48Z, 59 second-level dirs under `/var/tmp/akr-1000` exist again, and 0 `akrogon-??????` dirs.
- Related charts by this door, all closed or handed off, so none holds the work: test-hygiene (landed 14774a0e 2026-11-23), run-scratch (landed 814a2387, run scratch in a RAM folder removed by the guard unit), test-time-and-temp (handed off 2026-10-01), temp-release (handed off 2026-10-16, closed leaf issues/closed/temp-release), leaf-temp (closed), framework-temp-owners (closed). The map should read their Destinations and closed leaves to find which mechanism each one left uncovered.
- Not yet inspected: which tests create `/var/tmp/akr-<uid>/<hash>` (likely `homePath`/`leafTemp`/`run_root` under fixture homes) and which create `~/.akrogon/worktrees/akrogon-XXXXXX` (a test resolving the real home instead of its fixture home).
- 2026-11-25 map (A,B,C,D, slots/map-merged.md): the /var/tmp leak is `src/run-check.ts` `constructedEnv`, whose `copied` list carries AKROGON_HOME but not AKROGON_LEAF_TEMP_ROOT or AKROGON_RETIRED_TEMP_ROOT. A nested akrogon call inside a checked command falls back to `/var/tmp/akr-<uid>`, creates `<hash4>/<hash8>` and removes only its `run-*` dir. `tests/state-home.test.ts` (1 dir) and `tests/run-permit.test.ts` (3 dirs) are the leaking tests, matching the 4-per-run clusters. Reproduced by A, B, C and D.
- 2026-11-25 map (C, checked by A): leftovers became visible after dc426cd7 (2026-11-22), which made `reconcileHost` keep unregistered store and temp dirs instead of deleting them.
- 2026-11-25 map (A,B,C,D): the `~/.akrogon/worktrees/akrogon-XXXXXX` leak did not recur in four full suite runs and about 30 single-file runs; no live path found.
