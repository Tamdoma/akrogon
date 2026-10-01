# Merged map: long-implement (#51)

Sources: map-A.md, map-B.md, map-C.md, written blind 2026-10-01. Tags name the slots that agree.

## Where the time goes
- M1 (A,B,C) Only `implement` is routinely long in framework: n=247, median 27m, p90 175m, 48 over 2h. Review (median 5m), fix (median 8m) and merge (median 3m) are short. Other repos are near zero: akrogon 0/83, pi-extensions 0/21, clinique 9/97 (B,C).
- M2 (A,C) Implement time tracks worker count. C: Spearman 0.74 over 244 phases. 7-9 spawns median 164m with 81% over 2h. 0-3 spawns median 9-22m with about 5% over 2h. A measured the same shape from unit commits. C corrects leaf-run-stalls M0: Spearman against insertions is 0.79.
- M3 (C, A spot-check) Workers mostly run one at a time. Across 851 `subagent_wait` calls, 752 name one worker. Mean concurrency 1.09 (206 worker-hours in 189 wall-hours). A spot-check of site-nav: 12 spawns, 2 waits on 3 workers, 6 waits on 1. tamdoma-subagents has no concurrency cap (only `MAX_TRACKED_CHILDREN = 128`, manager.ts:29), so the limit is the skill.
- M4 (C) Cause: "one at a time when unsure" (worker-protocol.md:11) plus a plan that carries only an "ordered file/criterion checklist" (plan-issue/SKILL.md:55) and never says which units are independent. site-nav and emdash-kit sub-briefs say "Chunks that must land first: none" and still ran serially.
- M5 (C) Counter-example: emdash-launch ran 7 units as waves 3+3+1 in 54m.
- M6 (A,B,C) Second shape, A's proof tail (about 6 of 47 long phases). emdash-launch workers were done at 11:46 UTC. A then spent about 2h35m alone, 104m of it in `sleep 280; tail log` polls of live runs, with 9 in-branch fixes and a full live rerun after each. check.fix repeats this. B: no provider failures in this case (report.md:95), so it is all active work.
- M7 (B,C) Third shape, parked seat (about 10%): blueprint-phase-split fix 442m was a 442m gap between an assistant event and a user event. Mostly 2026-09-12, before `--exclude-tools request_user_input`. Rare since.
- M8 (B,C) The stall notice (next.ts:193-222) works as written. It never fires under watch because the watch does not run `next` for a busy leaf. It only notifies and would not shorten anything.

## Already covered by leaf-run-stalls (merged today) (A,B,C)
Red criterion outside `checks`, provider death, failed-state guard and dependency split. None of these address M3-M4 (the serial workers) or M6 (the proof tail).

## Material forks
- K1 Clock lock. Keep it (A,B,C). Most of the time is a model working or a real command running, so a ceiling kills working passes, and a stop with live external state needs cleanup (B R4). No mechanism except a clock can guarantee elapsed time (B).
- K2 Primary lever:
  - (C) The plan states waves: each unit lists owned paths, shared test resources and the units that must land first. Units with disjoint paths and no prerequisite share a wave. Delete "one at a time when unsure". check.fix repair briefs follow the same rule. Wording only.
  - (A) One leaf is one wave at charting, and a serial dependency becomes a separate leaf. Heavier, and C and B say a split frees nothing when dependents need the whole output (leaf-split 1a already covers the useful splits).
  - (B) A finite proof repair: initial proof, one repair, one rerun, then `failed`.
- K3 Proof tail (M6):
  - (C) While a proof command that takes minutes runs, A starts every unit or repair that does not depend on its result.
  - (B) One repair and one rerun per criterion, then `failed`, and watch recovery treats that as final until the cause is resolved.
  - (C) Against B: launch's 9 fixes were 9 different real defects, so a count fails a productive pass.
- K4 Stall notice under watch (#116). No change (B,C): it adds an operator duty, and stall-notifier-removal keeps it as is.

## Pitfalls
- P1 (C) A wave lasts as long as its slowest worker. 99 of 917 workers ran over 30m and hold 85 of 206 worker-hours. Units in one wave should be similar in size.
- P2 (C) Units sharing a live fixture (one Cloudflare account, one test site) must not share a wave. The plan must record shared test resources.
- P3 (C) Three workers share one provider, so a 503 hits a whole wave. The 10-minute retry and the one rerun apply per worker.
- P4 (B) Skill wording is probabilistic. Measure afterwards: worker concurrency from transcripts, not phase wall time, because parked time hides the effect (C).
- P5 (B) Final-commit proof can force repeated full deploys. Reuse valid unchanged proof (implement-issue/SKILL.md:54).
- P6 (C) emdash-launch polls write to `/tmp/c8/...` against the TMPDIR rule. Separate defect, new intake.

## Rebuttal corrections (applied 2026-10-01)
- M3 (B F1, C R2) Mean concurrency 1.09 understates wave use. Better measure: in 46 long implement phases, single-worker waits hold 98h of 116h (84%), and 29 of 46 phases never waited on more than one worker (C). "The limit is the skill" is a hypothesis, not proven (B).
- M4 (C R1, A check) site-nav ran two 3-wide waves, then four real serial units. A read sub-briefs: emdash-kit U1-U6 had no prerequisites and ran as two waves. Its slow part was a real chain (U7 fixture, U8 e2e, U7R/U8R repairs). one-client-link has real prerequisites (1 before 2, 3 and 6; 1-9 before 10). So serial time is part fallback and part real dependency depth.
- M5 (C R3) The 54m emdash-launch waves are a best case. The expected gain is smaller.
- M6 (B F2) "All active work" is too strong. About 104m of shell calls containing `sleep` include background runs and waits. The session shows ongoing proof work, not a parked seat. "A full rerun after every fix" is not established. The report records 7 launch attempts and 9 fixes.
- M7 (B F3, C R8, R9) The parked share is C's figure: about 10% of long-phase hours across 4 phases. blueprint-phase-split's parked gap is 319m, not 442m.
- M8 (B F4) The notifier can fire under watch when the watch runs `next` for a waiting seat while the other seat is busy. It does not fire for an all-busy leaf with no `next` pass.
- K2 (C R4) "One leaf is one wave" is a numeric size gate (at most 3 units), which is locked off route. Each extra leaf also adds a plan, a two-seat review and a merge.
- K2 (C R5) Finite proof repair belongs under K3 only.
- K3 (C R6) "Watch treats exhaustion as final" adds an operator step for every such leaf.
