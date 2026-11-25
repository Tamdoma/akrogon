# review-A — shell-sweep, initial review (slot A, blind)

Base: 085f2f88c3a1920732e10afbc0bad190cf32d540. Reviewed head: d388a2d4. Diff reviewed: full leaf diff `085f2f88...d388a2d4` (d687aede red-first tests, f8a5682f implementation, d388a2d4 formatting).

## Verification evidence

- `implementation/check-test-1795572821451-2815121.log`: full suite 1427 pass / 0 fail across 91 files plus 40/40 rerun-each.
- verify receipt `23123b58` on the reviewed head: format 0, typecheck 0, test 0. The receipt's suite run includes the formatted test files, so no proof predates the latest change to a test or fixture.
- `implementation/check-sweep-commit-1795572032158-2088920.log`, `-shape-…920282.log`, `-fail-…920504.log`, `check-seat-recovery-1795570694683-945619.log`: criterion proofs green.
- AREA.md path check run for the reviewed diff: every `src/*.ts` and docs path `src/AREA.md` names exists in the registered checkout (live listing, no dead pointers).
- Docs: `docs/reference/state-and-phases.md` and `docs/reference/files.md` match the implementation (sweep at every completed move, `shell_sweep` row kind, recovered-shell loss meaning on `lost`).

## Fixes

F1. The fork-race re-collect pass has no test that would catch its loss. Brief criterion 1 requires the descendants of each leftover shell to be gone after the move, "including a reparented background shell and a looping shell that keeps starting children". The design's Taken shape implements the looping-shell case with the second collect-then-kill pass in `src/seat.ts:sweepOneSeat` ("A looping shell can fork a replacement child in the kill window; one re-collect under the same rule ends anything new"). Grep of `tests/shell-sweep.test.ts` shows no loop/respawn/fork coverage: if the re-collect pass were deleted or broken, `sw-main` and every other test still passes, while in production a shell child forked between the first collect and its parent's SIGKILL — reparented outside the tree, itself a shell — survives the move and keeps masking the seat's idle state, criterion 1's outcome failing. The realistic source is the incident shape itself: a harness-shell loop that keeps starting children (the charting proof P1 pattern), which forks continuously during the milliseconds the kill pass needs for a multi-target tree. A test is feasible deterministically in practice: a continuously forking shell loop (`while :; do bash -c 'sleep 1000' & done` style, bounded) produces fork-in-window survivors across a kill pass spanning several milliseconds, red without the re-collect pass and green with it. Consequence today: the one mechanism implementing a named criterion scenario can regress silently. Hits brief criterion 1.

## Nits

N1. The caller-chain spare expands each chain member's whole in-scope tree (descendants of the chain's tree root), wider than the design's "sparing process.pid's ancestor chain". Reproduction concern: a shell backgrounded inside the reporting shell's own tree (same root as the reporting chain) survives the sweep although criterion 1's plain text covers it. Deferred because reaching it requires the report invocation itself to share a shell root with a backgrounded shell — production reports are their own tool call, so no realistic source today; a shell surviving inside the reporting tree in a real trace would promote it to a Fix.

N2. When a seat's harness was replaced by an hc keep-recovery shell, that shell lives in the hc server's cgroup, not the seat's scope, so the sweep's slice check errors the seat ("seat harness outside its leaf slice") and writes an error row plus warning for a normal, expected shape. Deferred: the window is the time between the harness's death and the next dispatch pass replacing the terminal, the rows carry no wrong action (nothing is wrongly killed), and the design accepts sweep errors as warnings. Evidence promoting it: operator noise in production timings from routine signal deaths.

## Other checks

- Schema evolution exclusion (readTimings unknown-kind tolerance) is a locked design line ("not this leaf's change (scope)"); not a finding.
- Mid-turn shells of a reporting seat's phase end at the move when they are not on the reporting chain: the design's structural definition, with production chains spared because the reporting CLI descends from the harness shell. Not a finding.
- `shell_sweep` row shape, per-seat filtering, writer states (waiting/live/ended), parent-first kill order, pre-kill start-time and membership re-proof, parked/spawned/boot/spawn_pending predicate shapes all match the design, and the implementation notes in plan.md document the two deviations (silent-end exclusion for recovered shells, procRoot scope of liveStartTime) with their evidence.
- Report gaps: none material. Wall times recorded; the verify receipt names the reviewed head.

## Verdict

fix — F1 blocks.
