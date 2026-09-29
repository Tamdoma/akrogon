# Chart: LESSONS.md stops blocking rebases

## Destination
Two sides adding lesson lines to `learnings/LESSONS.md` rebase cleanly and keep both lines in every registered repo, including repos registered later. Repo: akrogon. Source: Tamdoma/akrogon#40.

## Forks taken
- [union-rollout](forks/union-rollout.md): union rule for LESSONS.md only, tracked only, written by init, door backfills all 8 repos, log unchanged, overlapping-edit retention accepted

## Open forks

## Fog

## Off route
- `issues/log.jsonl` union: status reads the log by line order (src/status.ts:123, 293).
- gacp and `akrogon sync` rebase logic stay unchanged. The conflict is in the file, not the commands.
Handed off 2026-09-29
