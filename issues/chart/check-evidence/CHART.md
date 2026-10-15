# Chart: check-evidence

## Destination
Check evidence stays lossless while the logs stop adding hundreds of MB to every checkout. Registered repo: akrogon.

Route: lifecycle (debate no)

Handoff review 2026-10-15, operator `1a | 2a`: one issue `check-evidence` with leaves log-reader, close-pack (blocked-by log-reader), folder-pack (blocked-by close-pack), check-path-print; debate no. Tamdoma/akrogon#92 is withheld from leaf `sources` because its close follows the migration step on main.

## Forks taken
- [Evidence location](forks/evidence-location.md): one `evidence.tar.zst` per owner at close, read with `akrogon log <path>`; open logs never committed.
- [Log coverage](forks/log-coverage.md): chart direct logs packed by `akrogon pack <chart>` at chart end; all kept command output through run-check, which prints its path; no stray-log guard.
- [Existing backlog](forks/existing-backlog.md): one migration per repo with `akrogon pack`, akrogon first then framework; 9 slots scraps deleted.

## Open forks
none

## Fog
none

## Off route
- The reporter's whole-checkout size target: node_modules and .git alone exceed it.

## Pending steps
- Migrate akrogon, then framework, per [existing-backlog](forks/existing-backlog.md) Taken item 7, once the leaf delivering `akrogon pack` for closed owners is merged and installed. Owner: the door.
  - akrogon done 2026-10-16: `.gitignore` 9a4c7a4 (init's issues/config.yaml normalization discarded, not committed); 34 folders packed, status lists none; flaky output unchanged; 29 closed owners each read back one tracked log through `akrogon log` equal to `git show HEAD`, plus one chart-direct log; 9 system-speed scraps deleted; archives 8c99509. Framework done 2026-10-16 at the operator's request while its door edited only chart notes: `.gitignore` 8fd92bd89 (config normalization discarded); 47 folders packed, status lists none; flaky unchanged; 45 owners read back equal; archives 7995328a3. Tamdoma/akrogon#92 closed 2026-10-16.
- After both migrations verify, run `akrogon close Tamdoma/akrogon#92 --by "check-evidence leaves and migration <akrogon sha>, <framework sha>"`. Owner: the door. Check: `gh issue view 92 -R Tamdoma/akrogon --json state` prints CLOSED.

Handed off 2026-10-15
