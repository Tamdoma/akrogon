# Main health map, slot A, 2026-10-10

## Stocks and flows
- S1 unknown defects on main ("main is red and nobody knows"). Inflows:
  - I1 merges whose gate ran somewhere unlike clean main (C8 passed in leaves before the 13:29 root install, framework#221).
  - I2 environment drift with no commit (root install, Bun, Chrome or blepsis version; motion-probe framework#220 went red with no commit touching it).
  - I3 flakes that pass the merge run (akrogon#69 load flakes).
  Outflow: a fix lands, but only after someone discovers the red. Discovery today = a leaf trips over it (check-issue SKILL.md:63 base run), hours later.
- S2 leaves failed "red on base". Inflow: each leaf rediscovers S1 by itself (log.jsonl: 2x selftest and 2x motion-probe on 5cb74c3c6 today; 2x zombie stall on e077b26b on 10-08). Outflow: manual `akrogon phase` moves only, and they leak straight back (akrogon#77, stale evidence reused).
- S3 host load. Inflow: each base discovery is a full command in a fresh detached worktree plus an install (SKILL.md:63), about 15 min per leaf (akrogon#76). Outflow: runs finishing. No cap on heavy runs (next.ts:336-367 counts leaves, akrogon#69).
- S4 operator attention. Drained by reading per-leaf failure reasons and hand recovery. No single notice exists (akrogon#76). Long-busy seats are noticed by eye (akrogon#78).

## Loops
- R1 (vicious): S1 up → every leaf reruns base → S3 up → flakes up (#69) → more bounces and false base reds → more reruns.
- R2 (vicious): S2 up → manual recovery → stale evidence → fail again (#77) → S2 stays up, S4 drains.
- B1 merge gate, target "main stays green". Sensor: the gate run in the leaf's worktree at merge time. It measures the leaf in its own environment once, not main in a clean environment over time. It is blind to I2 and I3.
- B2 leaf base-run rule (SKILL.md:63). Sensor fires per leaf, result kept in that leaf only, not keyed to a commit and environment. Its action stops the leaf. It does not drain S1. It balances the wrong stock.
- B3 stall notice (next.ts:227-246) only runs inside next paths (:497, :555, :601, :667), so a leaf that next skips never notifies (#78).
- B4 repo pause (pause.ts) honored everywhere in next.ts (:659 … :1505) but only set by hand.

## Leverage point
Nothing owns the fact "main at commit X in environment E is green or red". Every consumer recomputes it, nobody stores it, nothing acts on it.
One mechanism: akrogon keeps one main-health record per repo keyed by (main commit, environment fingerprint), produced by one run of the repo's merge checks on clean main.
- Triggered after each merge and whenever the fingerprint changes (toolchain versions, lockfile).
- Red: set the existing repo pause automatically and send one notice naming the check.
- Leaves read the record instead of running their own base run.
- Green on a new key: unpause and resume leaves failed "red on base <old key>" automatically. Evidence tied to the old key is stale by construction (#77).
Covers #76 and #77, cuts R1 and R2, removes most of #69's extra load. Turns B1 into a real sensor on main.
Not covered: #220 needs its own diagnosis (consumer defect). #221 is fixed by the worktree-isolation chart, which also removes I1's largest source. #69's concurrency cap stays separate. #78 is the same "observer runs only when next touches the leaf" fault. A per-tick observer that checks main health and busy seats together would cover it.

## Pitfalls over the lifetime
- A flaky main-health run pauses everything. Fix: red needs the failing test reproduced in a second run, or a flake count, before pausing.
- A long main run (15 min) delays dispatch after each merge. Fix: leaves keep working, and only merges and base claims wait on the record.
- Fingerprint misses an input (Chrome update), so the record says green while main is red. Fix: periodic rerun as a backstop, plus a leaf base claim invalidating the record.
- Auto-resume loops on a real red. Fix: resume only on a green record for a newer key.

## Practitioner questions
- Google TAP and Chromium sheriffs: a "tree status" that closes the tree when trunk is red is the industry pattern (Chromium tree closer, Mozilla treeherder sheriffs). Bors/merge queues keep main green by testing the merged result before landing, which removes I1 but not I2.
