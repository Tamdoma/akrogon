# Chart: akrogon

## Destination
Each leaf runs the full merge checks about once, on the commit it pushes. Other merges and issues-only commits no longer force reruns, merges still land correctly with conflicts resolved before checks, and a fresh leaf worktree runs the configured checks without a repair round.

## Forks taken
- [merge-order](forks/merge-order.md): 1d merge turn plus batching; waiting leaves keep tabs; red batch goes solo; B records Nits before entering merge
- [issues-only](forks/issues-only.md): 1a 2a reuse green run when main moved only in `issues/` (not config.yaml) and `learnings/`, command-proven
- [turn-release](forks/turn-release.md): 1a 2a 3a every pass and phase move sweeps the repo's merge leaves; operator fails a hung holder, command reconciles and owns the batch push; returning leaves go to the back
- [dependency-setup](forks/dependency-setup.md): 1a 2a one `setup` key that `akrogon config` runs, locked per worktree, before every check; worktrees stay where they are

## Open forks

## Fog

## Off route
- Path-disjoint "affected-only" reuse beyond `issues/`: needs declared inputs, foreclosed by check-reruns/check-scheduling Q1 (A,B,C).
- Sharing the registered checkout's `node_modules` with worktrees: branch-specific dependency changes contaminate it (A,B,C).
- Framework running `hooks:parity`, `selftest`, `contracts:verify` twice at merge (once in `checks`, once inside `framework:verify`): framework config, not akrogon.
- Machine-wide limit on concurrent implement-time check runs: separate from merge ordering; new intake if wanted.
- Two SIGTERM merge-check kills 2026-10-05 (spec-mutation-anchors about 12:48Z exit -15, slice-boundary-anchors 12:49:42Z exit 143), both during test:cf-workers-deploy with about 9 verifies running, no OOM in the journal: cause not established (slots/map-C.md K8). Later serial long runs finished (cadence-canned-pins 18:41-19:17Z pushed 8e787e1c7, slice-boundary 1679s to a normal exit 1). The merge turn runs one merge check per repo at a time. New intake if a kill recurs under the turn.

Handed off 2026-10-05
