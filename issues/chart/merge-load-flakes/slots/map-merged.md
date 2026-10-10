# Opening map, merged (A, B, C)

## #63 dirty worktree hides failures
- Cause traced: the leaf's own commit framework 0c5d1d7cb added copies into two folders the scaffold never tracked; fix 264cc2f5b adds mkdir. (C; B,A confirm the dependency) Not proven that the removed worktree held them at merge. (A,B)
- The gate runs in the long-lived leaf worktree (skills/merge-issue/SKILL.md:41,51). The only pre-gate check is `git status --porcelain` (src/batch.ts:82-89, src/phase.ts:318-321), which shows untracked files but never empty folders or ignored files. (A,B,C)
- Leftover kinds: empty folders (evidenced), untracked files (already refused), ignored files like `.temp/`, `node_modules` (6 of 8 framework worktrees hold `.temp/`; no case evidenced). (C)
- Options:
  - G1 command runs `git clean -fd` in the holder worktree when it hands the turn to B, after the empty-status check. Then only empty folders can go. Keeps ignored files. One git call. (A,C) Cost: ignored-file leftovers stay uncovered. (A,B,C)
  - G2 gate in a fresh checkout of the exact candidate with declared setup, replacing the current run. Catches ignored-file leftovers too. Cost: install/setup on the serial merge slot each attempt, a gate-worktree lifecycle, and framework gates need `node_modules` and `.temp/` recordings; INFRA bounces from missing node_modules already exist (#207, 3 of 34). (B picks; A,C reject on cost)
  - G3 refuse the turn when `git clean -nd` prints anything. Turns a self-healing case into a bounce. (C rejects)
  - G4 `-x` too: deletes node_modules and recorded proofs. (A,B,C reject)
  - G5 consumer fixture fixes only. Leaves the class open. (B lists, not picked)
- Placement: one site covering top and solo. C: in mergeTurn (src/next.ts ~1017-1031), blocked-by batch-limit-repo and merge-attempt-records, which edit those lines. A: in batch.ts move() after reset --keep. C notes move() needs a skill line for solo; one site is better.
- Pitfalls: deleting seat work (removed: clean only after empty status, no -x) (A,C); solo rebase leaves no empty folders (C); same lines as in-progress leaves (removed: blocked-by) (C); gate certifies the wrong SHA (B, applies to G2).

## #69 host load flakes
- Load is not proven as the cause. (A,B,C)
  - Host 32 threads, 123 GB; framework max_active 20, akrogon default 3. (A,B,C)
  - C proxy, framework log.jsonl 10-07..10-09: active leaves in the 30 min before each event: bounces mean 4.0, merges mean 3.6; the five named load flakes at 2, 6, 6, 5, 2. Two at the quietest activity seen. Activity, not CPU. (C)
  - Named flakes have test-level causes: EPIPE with an unchanged-code passing rerun (B), nested `bun test --isolate` zombie reproduced on base (B), 5 s timeouts (C). #208 lane race inside one suite, fixed by 5b7da1ff5; a host slot would not touch it. (B,C)
  - The gate itself runs six lanes in parallel (framework package.json:162). (C)
- Options:
  - H1 framework test fixes for the named flakes (timeouts, EPIPE, isolate zombie), framework destination, existing framework-test-scope chart. (B,C)
  - H2 record load at each merge gate (loadavg or PSI, count of running test processes, start and end), so a later flake can be matched to load. C: skill line now, `load` field in merge-attempt-records later or now. A: field in merge-attempt-records. B: one bounded idle vs loaded comparison of the same revision instead. (A,B,C variants)
  - H3 load-based admission: next starts no seat while loadavg/cores > `max_load` (default off). Follow-up only if H2 shows load. (C)
  - H4 host-wide heavy-run slot or pool. New component; leaves lane races alive. (A,B,C reject now)
  - H5 lower max_active: slows all phases. (A,B,C reject)
- Pitfalls: reading flakes as load repeats #53 (removed: each fix names its mechanism, load read per gate) (A,C); prose evidence (removed: field in records) (C); duplicating merge-throughput leaves (B).

## Split
- #63: akrogon, one small leaf. (A,B,C)
- #69: framework for test fixes; akrogon only for load recording. (B,C) A had one akrogon destination.
- Differences: B prefers G2 fresh checkout; A,C prefer G1. B prefers a one-time comparison; C per-gate recording.
