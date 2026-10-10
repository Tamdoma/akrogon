# Opening map: main health, slot C, 2026-10-10

Blind. Inspected: akrogon src (next.ts, hold.ts, phase.ts, pause.ts, config.ts, preflight.ts, batch.ts), skills check-issue, merge-issue, implement-issue; akrogon held.yaml at the tool root; framework issues/log.jsonl, merge-attempts.jsonl, the seven merge-gate reports and states, package.json, issues/config.yaml; the worktree-isolation and merge-gate charts; akrogon#51, #53, #64, #67, #75 bodies. Read-only. Tiers: T1 operator, T2 practitioner (inspection or probe, dated), T3 documentation or code, T4 model.

## E. Evidence

- E1 (T3) Two different endings for the same event. A red check with no cause in the leaf's diff, rerun once in a detached base worktree and red there, ends `failed --reason "<command> red on base <sha>"` at implement and check.fix (implement-issue/SKILL.md:38) and at check.review (check-issue/SKILL.md:63), "a stop, never a handoff, creating no repair or merge path". At merge the same event ends `check.fix --red-on-base <sha> --command <cmd>`, the leaf stays in `merge` and "the repo is held against further merge runs until fetched main moves" (merge-issue/SKILL.md:73; phase.ts:797-801 restricts `--red-on-base` to check.fix, slot B, with a batch record :831-832).
- E2 (T3) The hold is a record of main health, keyed by sha: hold.ts:10-18 (`sha, command, holder, attempt, at, evidence, fix?`), written by phase.ts:857-864, stored at `<tool root>/held.yaml` (hold.ts:29-31, config.ts:172-174 globalHome = AKROGON_HOME or tool root). It is read in exactly two places, both inside mergeTurn: next.ts:1044-1049 and :1062-1070. The guard compares `equalOutsideRecordFolders(held.sha, main)`; a moved main drops the hold (:1067); `fix` names one merge leaf allowed through (hold.ts:85-87, holdFixCommand :90-102, README.md:144-145). No pre-merge path reads it: `heldFor` call sites are :1044 and :1062 only; dispatch at next.ts:704-716 checks deps, inputs, merge holder, seats, base reachability (preflight.ts:62-73 checks the ref exists, not its health) and seat capacity (:366-367 vs config.ts:25 max_active default 3).
- E3 (T2, 2026-10-10) The hold is live now and did not stop the rediscovery. held.yaml: framework held on 5cb74c3c6 since 14:02:42Z by audit-errors, command = setup + `bun run framework:verify`, evidence audit-errors/review-B.md:181, `fix` unset. merge-attempts.jsonl has one row, outcome `held`, 25 min wall (13:37:26 to 14:02:42Z). After the hold: dist-capture-disk ran its own base rerun and went `check.fix -> failed` at 14:10:23Z on the same motion-probe red (log.jsonl). page-measure-full-id, which carries the motion-probe repair (commit 4584cf7cb, its report lines 11 and 49: tab `visibilityState` hidden silences the IntersectionObserver; re-activate and poll), moved to `merge` at 14:47:22Z and waits, because `hold-fix` was never run. Three leaves sit in `merge` (audit-errors, page-measure-full-id, selected-check), none merged since.
- E4 (T2) Count of rediscovery on 2026-10-10 (log.jsonl, agent read): 7 moves into `failed`, all cause `blocked`, all "red on base 5cb74c3c6": C8 selftest 4 leaves, motion-probe 4 leaves, union 6 of 7 merge-gate leaves. Three manual `failed -> check.review` moves at 13:44:44, 13:44:45, 13:45:13Z from one session (slot null); cheap-checks and fail-fast failed again at 13:48:48 and 13:51:40Z with "unchanged head, see review-B.md" (akrogon#77). Selftest runs 175-312 s each; a full verify 11-15.5 min (page-measure-full-id report line 35, spawn-deadlines line 45).
- E5 (T3) Evidence reuse has no staleness key. check-issue/SKILL.md:25 "an existing review and unchanged diff are evidence to resume from", :61 rerun only for "a code change, missing evidence or a specific concern"; merge-issue/SKILL.md:75 reuse "only when neither code nor integration changed". The only main-moved rule is merge-issue:47 (`reuse tested= pushed=`). Nothing keys a red-on-base result to the base sha or to the hold, so a leaf re-entering check.review reuses a red recorded under a base that may be green now.
- E6 (T3) Operator notice paths. Hold: phase.ts:866-876 `herdrCall(['notification','show', '<repo> merge held on <sha>', ...])`, once, at the merge turn. Every `failed` move: phase.ts:87-120 announceFailed shows `<repo>/<slug> failed` with `cause: reason`, so 10-10 produced 7 such notices for one cause (E4), each naming the sha only inside the reason text. Stall: next.ts:227 `STALL_MS` 60 min, observeBusy :230-259 sets `busy_notified` once past the threshold, called only from `next` paths (:497, :555, :601, :667); a hook event with status `working` returns before any of them (next.ts:1443), and there is no timer (only setTimeout is the command deadline, shell.ts:34-44). A seat that stays `working` and a leaf `next` skips are both invisible (akrogon#78: 4 h busy, `notified=` empty).
- E7 (T2, T3) Where the reds came from. C8: root `bun install` at 13:29 made ancestor resolution find ffmpeg-static (worktree-isolation INTAKE F1-F2); the class is taken by the worktree-isolation chart (boundary 2a, binary-boundary 2a). motion-probe: last main commits touching it are 10-08 (b89a1559d, 84096dddf, 1d0681294), each merged through a green verify; the red is tab-visibility timing in headless Chrome, so it is environment-sensitive (page-measure-full-id report line 49), the load-flake class (merge-gate chart, forks/load-flakes.md; akrogon#69). Neither red was introduced by a commit to main after a green gate. The 34 commits on main on 10-10 are rebased leaf merges plus `add issues` record commits.
- E8 (T3) Capacity: next.ts:336-347 activeCount counts active leaves; :366-367 refuses allocation at `max_active` (config.ts:25, default 3; framework intake says 20). Check processes are not counted anywhere. The held attempt recorded PSI stall cpu 54.6 s over its 25 min (merge-attempts.jsonl pressure).
- E9 (T3) Pause: pause.ts:18-19 stores `paused.yaml` per repo in globalHome; isPaused gates every automatic path (next.ts:659, :779, :882, :997, :1264, :1277, :1414, :1553), set only by `akrogon pause` (pause.ts:58-63). `unpause` already prints any hold (akrogon.ts:131-135), so pause and hold sit next to each other but neither sets the other. A held repo that holds pre-merge seats is a pause with a cause and an auto-release, which is why the leverage point reuses the pause gate rather than adding a third flag.

## S. Stocks and flows (operator question)

- S1 Red main (the health of main at one sha). Inflow: environment drift under a green gate (root install, E7), environment-sensitive tests firing later (E7), and in principle a flaky green gate. Outflow: a merged fix leaf or a machine repair, then `unhold` or a moved main (E2). Sensor today: a merge holder's full verify plus a base rerun, 25 min after the holder started, once per merge turn (E3). Before that, no sensor at all.
- S2 Knowledge of S1. One record exists (held.yaml) but has one writer (the merge turn) and one reader (the merge turn). Pre-merge seats each rebuild it from scratch (E1, E4): the knowledge is produced 6 times and stored 0 times where the next seat looks. This is the stock the operator is asking about: it is destroyed by every `failed` move, because `failed` carries the fact into a dead leaf instead of into the shared record.
- S3 Leaves stopped in `failed` by a red they did not cause. Inflow: every pre-merge red-on-base (E1), 7 on 10-10 (E4). Outflow: a manual phase move (E4), which then reruns against stale evidence (E5, akrogon#77) and refills S3.
- S4 Seat-hours and host load. Inflow: each rediscovery is a selftest or verify pair (leaf and base), 3-15 min each (E4), on a host where check processes are not counted (E8). Outflow: none; the same base result is never reused across leaves (E5, R3 in the skill read).
- S5 Operator attention. Inflow: one notification per hold plus one per failed leaf (E6), so a red main costs the operator N notices that all say the same thing and none says "main is red"; none for a stalled seat that `next` skips or that stays `working` (E6). Outflow: the operator reads panes by eye (INTAKE, akrogon#78).

## L. Loops

- B1 "leaf matches a clean checkout" (the judgment gate, E1). Sensor: a leaf's own base rerun. Measures the true target only when the base worktree sits where the leaf's environment matches (agent read: C8 green at /tmp base, red at issues/worktrees base). Delay: one full check pair per leaf. Target reached by stopping the leaf, which is not the target.
- B2 "merge only onto green main" (the hold, E2-E3). Sensor: merge verify plus base rerun, correct target, delay 25 min and only when a holder exists. Actuator: hold the queue, auto-release on a moved main. It never reaches pre-merge seats and never reaches the operator twice.
- B3 "seat not stuck" (STALL_MS, E6). Sensor runs only inside `next`; a skipped leaf is invisible. Delay: 60 min or infinite.
- B4 "host not overloaded" (max_active, E8). Sensor counts leaves, not running checks; the target is load.
- R1 bad: red main -> each leaf rediscovers it -> more full runs on the host -> more flakes (motion-probe is timing-sensitive) -> more reds that look like base reds -> more rediscovery. E4 and E8 show both halves on 10-10.
- R2 bad: `failed` leaves -> manual moves -> stale evidence re-fails them -> more manual moves (E4, E5).
- R3 bad: a stalled seat consumes a slot for hours -> fewer active slots -> other leaves wait longer -> their base drifts further from main -> more reruns (akrogon#78, #51).
- R4 good, once S2 is shared: the first seat that proves a base red writes it; every later seat reads it in milliseconds; no further run on that sha; the fix leaf is named and merges first; the hold clears on the moved main, which releases every waiting leaf at once.

## Leverage point

One record of main health per repo, written by whoever proves a red first, read by every seat before it reruns anything and by dispatch before it starts anything. The record already exists (held.yaml, E2). What is missing is three edges, not a new system:
1. Writers: `--red-on-base <sha> --command <cmd>` accepted at implement, check.review and check.fix too (phase.ts:799 drops the check.fix-only rule, :801 the slot-B-only rule), writing the same hold with the leaf's evidence path and leaving the leaf in its phase as `held`, not `failed`.
2. Readers: before a base rerun, a seat checks the hold for its command and sha and stops with "held, see <evidence>" instead of running (skill rule in check-issue:63 and implement-issue:38); dispatch at next.ts:704 treats a held repo like a paused one for leaves whose next step runs checks, and the merge-queue selection already honours `fix`.
3. Release: the existing moved-main clear (next.ts:1067) plus one release pass that moves every leaf held on that sha back to the phase it was in, and marks evidence recorded under the held sha as stale for reuse (closes akrogon#77 by construction: reuse is keyed to the sha the evidence was proven on).
The fix leaf is named automatically when a leaf whose diff touches the held command's failing path reaches merge (page-measure-full-id today would have merged at 14:47 instead of waiting, E3); `hold-fix` stays as the manual override.

## Coverage of the six seeds by that one mechanism

| Seed | Covered | Note |
|---|---|---|
| akrogon#76 red main fails leaves one by one | Yes | S2 shared, leaves held not failed, one notice per hold already exists |
| akrogon#77 stale base-red evidence reused | Yes | evidence keyed to held sha, released leaves rerun by construction |
| framework#221 C8 nested worktree | No | consumer defect, taken by worktree-isolation (boundary 2a, binary-boundary 2a) |
| framework#220 motion-probe mismatch | No | consumer defect, fix exists on page-measure-full-id; the mechanism would have merged it 3 h ago |
| akrogon#69 load flakes, no concurrency limit | Partly | removes the rediscovery load (R1), not the missing check-count sensor (B4) |
| akrogon#78 busy seat never noticed | No | B3's sensor must move out of `next` (an observe-time or timer path), a separate small change |

## M. Material forks

- M1 What is the hold's identity: (a) repo + main sha, as today, one hold per repo; (b) repo + sha + command, several holds per repo so an unrelated check can keep merging. (a) is simpler; (b) matters when a long-lived flake holds the queue for days. Recommend (a) with command recorded, since clearing is by sha anyway.
- M2 What a held pre-merge leaf does: (a) stays in its phase with a `held` marker and a seat freed, resumed by the release pass; (b) a new phase `held`. (a) keeps the phase table (docs/guide/phases.md) unchanged; (b) makes `akrogon status` honest. Recommend (a) with status printing `held on <sha>`.
- M3 Who may write a hold: (a) any seat that completed both runs per the base-run rule; (b) only after a second seat or a /tmp-rooted base confirms. 10-10 shows a base red that depended on where the base sat (E7); after worktree-isolation lands, (a) is safe; before it, a hold from a nested base could hold the repo on a false red. Recommend (a) once worktree-isolation 2a is merged, (b) until then.
- M4 Whether to add the watch proposal (run verify on main after each merge and after any root install): it is a second sensor with a 15 min delay and host cost (E4, E8) that measures what the merge gate measured minutes earlier on the same bytes. Recommend no, unless a merge can land without a verify (merge-issue:47 reuse path is the only one, and it requires equal bytes outside record folders).
- M5 Stall notice path for #78: (a) evaluate observeBusy on every `next` pass over all leaves regardless of skip, and stop returning early on `working` events (next.ts:1443) for that pass; (b) a timer. (a) is a loop change near next.ts:667 plus one line at :1443. Separate from the hold, small, recommend (a).
- M6 Check-process accounting for #69: count running check commands (a semaphore around `setup && check`) or keep `max_active`. Not covered by the hold; the merge-gate chart's load-flakes fork already took suite floors and deadlines; recommend measuring PSI (already recorded per attempt, E8) before adding a limiter.

## P. Pitfalls over the work's lifetime, and what removes each

- P1 A false hold from a wrong base rerun holds every leaf of the repo. Removed by M3(b) until worktree-isolation lands, and by the hold naming its evidence so an operator `unhold` is a one-line judgment.
- P2 A hold that never clears because the fix is a machine repair, not a commit (C8 today: the root node_modules edit moved no sha). Removed by `unhold` plus the release pass; `akrogon status` must print the held line until then.
- P3 Release moves leaves whose base is now behind main; they keep testing on the old `AKROGON_BASE` (akrogon#64 shape). Removed by the release pass refreshing `AKROGON_BASE` in the resumed prompt, as merge-issue:41 already does at merge.
- P4 Two seats prove the same red concurrently and both write; last write wins. Removed by writeHeld under the global lock (hold.ts:69-71) and ignoring a second write for the same sha and command.
- P5 Seats skip the hold check because the skill text is advisory. Removed by making the `failed` producer (phase.ts:262-277, the only writer of `cause: blocked`) refuse a red-on-base reason when a hold for that sha exists, pointing at it, so the mechanical path enforces the rule; `--check` (phase.ts:286-289) already gives seats a dry run to ask.
- P6 A held repo with 20 leaves releases all at once and saturates the host (R1 in reverse). Removed by releasing through the normal dispatch gate (max_active), not by a bulk phase move.

## Q. Practitioner questions

- Q1 Is there any main red in log history that a merge verify did not precede, that is, a red introduced by a commit? If none, S1's inflow is environment and flakes only, and the hold plus worktree-isolation plus load-flakes is the whole fix.
- Q2 Should a pre-merge hold free the seat (M2) given seats are the scarce stock (R3)?
- Q3 Does the operator want one notification per hold (today) or one per hold plus one per release?
- Q4 Which seat ran the 14:02 hold's notification, and did it show? If it did not, E6's only operator path is also broken.

## Off this chart

- Consumer defects #220 and #221 (worktree-isolation and the page-measure-full-id repair).
- Load limiter (M6) unless Q1 shows commit-introduced reds are zero and flakes dominate.
