# merge-order, slot A

Q1. 1a recommended: command-derived merge turn. In `dispatchLeaf` (src/next.ts:567), a leaf in `merge` gets B prompted only when it is the earliest-entered leaf in `merge` for its repo. The holder is derived from state on every pass (a `merge_since` stamp written by commitMove at src/phase.ts:105), so there is no lock file, lease or clock, and a restart derives the same holder. The turn moves when the holder leaves `merge`. 1b batch: one run for all waiting leaves, red needs bisection and a multi-leaf owner. 1c speculative train: parallel runs on one machine, restart cascade. 1d skill-held lock: crash leaves it held.
Research: practitioner, firstmate#4453 (read 2026-10-05): same symptom on one host, a serial landing queue is enough at single-machine volume. Jane Street (Minsky): serial costs m x n. GitLab merge trains: speculation restarts later runs on failure.

Q2. 2a recommended: waiting leaf stays in phase `merge`, unprompted, keeps its tab (B keeps its review context) but does not count toward `max_active` while waiting, since its seats are idle. 2b keeps the tab and the slot (long queue blocks new leaves). 2c new `merge.queued` phase (routing, docs, migration cost).

Pitfalls: completion must wake the next waiting leaf, not only dependents (src/next.ts:681). Stall notices must not fire for an unprompted waiting seat (src/next.ts:210-228).
