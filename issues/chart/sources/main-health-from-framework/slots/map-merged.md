# Main health merged map, 2026-10-10

Sources: slots/map-A.md, map-B.md, map-C.md.

## Live state (C E3, A checked held.yaml 2026-10-10)
- Framework is held on main 5cb74c3c6 since 14:02:42Z (holder audit-errors, command framework:verify, `fix` unset).
- audit-errors, page-measure-full-id and selected-check wait in `merge`.
- page-measure-full-id carries the motion-probe repair (4584cf7cb, tab visibility silences IntersectionObserver), green full verify reported (B E7, C E3). It is not on main. It waits only because nobody ran `akrogon hold-fix page-measure-full-id`.

## Stocks (A,B,C)
- S1 red main. Inflow: environment drift under a green gate (root install for C8, headless tab timing for motion-probe), flakes. Neither red was introduced by a commit after a green gate (C E7). Outflow: a merged fix or a machine repair, then a moved main or unhold.
- S2 knowledge of S1 (C names this as the stock being destroyed). Produced 6 times on 10-10, stored 0 times where the next seat looks (C S2). Every `failed` move carries the fact into a dead leaf instead of a shared record (C). Evidence has no freshness key (A,B,C).
- S3 leaves failed by a red they did not cause: 7 moves on 10-10, union 6 of 7 merge-gate leaves (C E4). Outflow: manual moves that refill it (#77, confirmed for both leaves by B E2).
- S4 host load and seat time: each rediscovery is a leaf and base pair, 3-15 min (A,B,C). Check processes are not counted (A,B,C).
- S5 operator attention: one notice per merge hold, none for pre-merge base reds as an incident (B,C), none for a busy seat next skips (A,B,C). B E1 corrects: per-leaf failure notices do show. The gap is no shared incident.

## Loops
- R1 red main → every leaf reruns base → load → flakes → more false base reds (A,B,C).
- R2 failed leaves → manual move → stale evidence → fail again (A,B,C).
- R3 a stalled seat holds a slot for hours, and others wait and drift (C).
- B1 leaf base-run rule: measures one leaf's run, stops the leaf, does not drain S1 (A,B,C).
- B2 merge hold (hold.ts, held.yaml): right target and actuator, but one writer and one reader, both inside mergeTurn (next.ts:1044-1049, :1062-1070). It never reaches pre-merge seats (C E2, B E3).
- B3 stall notice runs only inside next (A,B,C).
- B4 max_active counts leaves, not running checks (A,B,C).
- R4 good loop once S2 is shared: first proof writes, later seats read in ms, fix merges first, moved main releases everyone (C).

## Leverage point (A,B,C agree on one owner of "main health")
- (C) The record already exists: held.yaml. Add three edges, not a new system:
  1. Writers: `--red-on-base` accepted at implement, check.review and check.fix by any slot. The leaf stays in its phase, marked held, not failed.
  2. Readers: before a base rerun a seat checks the hold for that sha and stops "held, see <evidence>". `akrogon phase … failed --reason "…red on base…"` refuses when a hold exists (P5).
  3. Release: a moved main or unhold resumes held leaves through normal dispatch and refreshes AKROGON_BASE. Evidence proven under the held sha stops being reusable (#77).
  Plus: a merge-queued leaf whose diff touches the failing path becomes the fix automatically. hold-fix stays as an override.
- (B) Same owner, with these constraints:
  - Key evidence by commit, command and scope plus declared execution inputs, not commit alone (O1a). Commit-only repeats #77 when the environment changes at the same sha.
  - Keep human pause separate from health holds (R4).
  - Hold only verification and merge, not repairs (R3).
  - Unknown, running, green and red are separate states. Crashed runs are unknown, not red (R6).
- (A) Same record keyed by (sha, environment fingerprint) with auto-pause. B and C show pause is wrong: it blocks observation and repair (next.ts:659-667). A withdraws pause in favour of the hold.

## Where slots differ
1. Record key: sha plus command (C M1a) vs sha plus command plus declared inputs (B O1a) vs sha plus environment fingerprint (A). Worktree-isolation removes root installs as an input. Toolchain and browser versions remain.
2. Trigger for a fresh measurement: none beyond what seats already run (C M4, B D2: the merge already verified those bytes, a post-merge verify doubles load) vs periodic backstop for silent environment drift (A, B O3a as a light reconciliation pass, not a suite run). The watch's proposal (verify after each merge and root install) is rejected by B and C.
3. Who may write a hold before worktree-isolation lands: any seat with both runs complete (C M3a later) vs a second confirmation until then (C M3b). B: write only after attribution, never parse free text.
4. Scope: #78 (observe busy seats on every pass) and #69 (count heavy checks) as separate small outcomes (B,C), or the same tick (A). C M6 and B O4b: measure PSI before a limiter.

## Coverage (A,B,C)
- #76, #77: covered by the shared hold.
- #220: fix exists on page-measure-full-id. The mechanism would have merged it around 14:47.
- #221: worktree-isolation chart.
- #69: partly (removes rediscovery load).
- #78: separate observer change.

## Pitfalls
- False hold from a wrong base rerun holds the repo (C P1, B R1). Removed by the evidence named in the hold, one-line unhold, and M3.
- Machine repair moves no sha (C P2). Removed by unhold plus the release pass. Status prints the held line.
- Released leaves keep an old base (C P3, #64). Removed by refreshing AKROGON_BASE on resume.
- Concurrent writers (C P4). Removed by writeHeld under the global lock.
- Skill rule ignored (C P5). Removed by the phase command refusing.
- Bulk release saturates the host (C P6). Removed by releasing through dispatch.
- Crash leaves health running forever (B R6). Removed by an owned attempt and incomplete = unknown.
- Human pause undone by health release (B R4). Removed by keeping them separate.
