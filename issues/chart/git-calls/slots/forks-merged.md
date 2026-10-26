# Merged notes: forks reuse and proof

Blind notes: the opening maps map-A.md, map-B.md, map-C.md (each written without the others) answer every question below, so they serve as the fork notes. Tags name the slots whose notes back each line.

## Reuse Q1, herdr reads in one process

- 1a central read cache at `herdr()` in src/shell.ts, named read verbs only, cleared by any other herdr argv, named poll sites exempt (C; A's map leans this way with a per-pass snapshot). Cost: stale-read risk class; one central change.
- 1b caller-level sharing only, within one observation step; no whole-pass snapshot; keep currentPane accepted-tab proof, process placement checks, PID start-time checks fresh (B). Cost: many call-site edits in src/next.ts and src/scope.ts; smaller saving.
- 1c fake-only (rejected by A, B, C: tests only).
- Evidence: 33% of herdr calls per process are exact repeats with no herdr mutation between (A measurement, forks/reuse.md Findings); pane process-info read three times per new pane (inOwnScope, adoptShell, inOwnScope after placement) (A); sessionLists/resolutions precedent (C); deliberate re-read boundaries (B).
- Pitfalls: stale absence authorizing deletion or double seat (B); outside agent status changes during a poll (C P1, removed by exempting poll sites by name and a mid-run status-flip test).

## Reuse Q2, git in one process

- 2a memo of layout/config facts by cwd plus args, success only, cleared on worktree add/remove/move and init at run()/command(); ref facts fresh; plus caller duplicate removal (A, C; B D1 for identity, B D2 for callers). Cost: tests/config.test.ts "once per call" contract changes.
- 2b caller-level only (B leans for refs).
- 2c fetch once per (repo, remote) per process (C); not raised by A or B. Pitfall: an outside push during one run is seen next run (C P5).
- Evidence: 19% exact git repeats per process; git-common-dir 616 of 1,371 repeats, remote get-url 342 of 737 (A). Git is at most about 11% of the failing test (B, C).

## Reuse Q3, fakes

- Bundle fake-busctl like fake herdr in tests/isolation.ts (A, B, C). fake-gh and fake-systemctl only on census evidence (B, C).

## Reuse Q4, split and guard

- Committed census harness leaf first, then reuse leaves, then a spawn-count ceiling test with headroom (C).
- Measurement in each leaf's report, no general framework, no harness feature (B). A's map: no measurement leaf.

## Proof Q1, load bar

- 20 busy-host pairs, all suites green, durations reported (B). 5 pairs, slowest re-entering run at or under 10 s (C). 8 quiet pairs (A).

## Proof Q2, three at once

- Required, since the recorded bar was three (B). Not raised (A, C).

## Proof Q3, CPU

- Same host, same command, alternating, median of three, spread reported (B, C). Named 25% floor (C) or lower than baseline (B); shapes.md refuses guessed CPU caps (A).

## Where slots differ

Q1 central cache vs caller sharing; Q2c fetch once; Q4 harness and ceiling test; Proof Q1 pair count and host load; Proof Q2 three at once.
