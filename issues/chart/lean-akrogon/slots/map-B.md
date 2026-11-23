# Map B: lean-akrogon (blind opening map)

Read on main 9c6ae0db. Confidence: (H) I read the lines, (M) a Haiku reader cited them and I did not open them, or a figure I derived, (L) inferred. Figures marked "fw" come from framework's ledgers (`issues/*.jsonl`), computed today for 2026-11-08 to 11-22 unless a range is given. Other slots' maps were not read.

## Core finding

One loop drives most of the cost, and the proposals touch it at different layers.

- F1. The lane is busy, not idle. fw: 419 land attempts, 110 h of run time, median gap between attempts 8 s, 22 h of gaps under 1 h. In working periods the lane is about 83% used (M). One land takes about 11 min (median verify run 652 s, the suite itself 645 s). So lane capacity is about 5 leaves per hour and nothing upstream can raise it.
- F2. Half the lane's runs are wasted. fw: 278 of 573 merge-scope runs red (49%). 126 reds have one failing unit, 51 have two, 23 have three, 46 have no parsed name. 864 failures spread over 499 distinct units, and the top unit has 41. The reds are broad, not a few bad tests (M). That fits load and scratch as causes, as history pattern P1 says.
- F3. Reds follow host pressure. fw attempts by CPU pressure third: 38 of 138 red (low), 19 of 138 (middle), 63 of 138 (high). On 11-22 the median CPU and IO pressure per attempt doubled (6 and 13 against the usual 2-3 and 6-8) and 23 of 33 attempts went red (M, the middle third breaks a clean trend). 11-22 is the first full day after merge waiters stopped counting toward `max_active` (633db0ad) and after reruns were removed (66f90be9). Both raise load or reds (L on cause).
- F4. Framework runs its full suite for the first time inside the lane: `checks: cheap`, `merge_checks: verify`, `merge_covers: [cheap]` (framework `issues/config.yaml`) (H). So real leaf defects are found at the most expensive point by design. #149's figure (47% of resolved reds went green with no leaf change) means roughly half of reds are real. P1 can remove at most the other half.
- F5. No backpressure exists. `activeCount` leaves out `merge` and `failed` (src/next.ts:380-381), and no start looks at merge queue depth (src/next.ts:410-418) (M). fw 11-21: 179 leaf-hours waiting in merge, median stint 150 min.

Consequence for order: cut reds at the cause (#151, scratch, load), add the cheap rerun for what remains, then hold new starts when the lane is full. Stacking and sharding only pay after reds are low: a stack of 3 with a 25% red rate is green 42% of the time.

## M1. Proposals

### #148 scratch

| Item | True on main | Verdict |
|---|---|---|
| K1 | Yes (H). Only seats set `NODE_DISABLE_COMPILE_CACHE=1` (src/seat.ts:299). run-check copies it only if set (src/run-check.ts:41-50). The land unit's env lacks it (src/land.ts:40-44), so land checks run with the cache and leaf checks without. | Keep, first. Set it in run-check's always-set child env (src/run-check.ts:69-75) and delete the copy-if-set and the verify forward (src/verify.ts:882,902). One place, two parts removed. It also removes a land-only env difference. |
| K2 | Yes (H). `leafTempRoot` is `/var/tmp/akr-<uid>` (src/config.ts:375-380). Run roots are `run-XXXXXX` inside the leaf dir (src/run-check.ts:321). Seat `TMPDIR` is the leaf dir (src/seat.ts:298). | Keep, change shape. Only the run root moves. Do not reuse `/tmp/akr-<uid>`: the previous release sweeps it (src/reconcile.ts:1432-1433), which breaks rollback. Which tmpfs and when: fork Q2. |
| K3 | Yes (H). Red keeps the whole root with `.akrogon-kept` (src/run-check.ts:462-469). Kept roots go only when the leaf dir is dropped (src/reconcile.ts:1191-1222). Refused roots (`refusal.json`) have no remover at all (src/reconcile.ts:1157-1167) (M). | Keep the always-remove half: it deletes the marker, the refusal keep and reconcile's kept handling. The archive half is a fork (Q3). An exclusion list (node_modules, .git, Chromium) is framework knowledge inside akrogon. |
| K4 | No such gate exists. Admission has no memory, load or space reading (src/admission.ts:259-262). | Drop as written. 12 GB and 36 GB are framework's numbers, and a wait is a line, which the operator removed three times (history C3). Replace with a placement choice at run start, no wait (Q2). |
| K5 | Mostly already there (M). Reconcile drops a dead-owner run root by `.owner` pid and boot id (src/reconcile.ts:1188). The run guard already fires on wrapper death (src/scope.ts:70). | Change. Add the run root's removal to the guard's command, so a SIGKILLed run cleans up at its owner's end. The existing sweep then only needs to walk the second root. No new sweep. |

What K2+K3 break: paid capture drivers that write failure evidence under `os.tmpdir()` lose it again (LESSONS.md 2026-11-15 and 11-20, the reason for 980e92b2). That is the one real cost and it decides Q3.

### #149 lifecycle

- P1 rerun failing units. Mechanism true (H): a red exits through `repairExit` with no second head run (src/land.ts:213-241). The only second run is the base pass (src/land.ts:218-219). But akrogon cannot rerun a unit today: checks are opaque `sh -c <command>` (src/verify.ts:716), unit names are bare test titles with no file (src/verify.ts:280, src/flaky.ts:30-48), and no code builds a narrower command (M). Verdict: keep, change shape (Q1). The rerun belongs in `runOnce` in src/verify.ts, not in land.ts, because the verify worktree is removed in `finally` (src/verify.ts:847-850) before land sees the red. New fact that defeats the 11-21 removal reason (lane time): a unit rerun costs about a minute, not the 11 minutes the old whole-command rerun cost. Risk: a leaf that adds an order-dependent failure passes alone and lands, so main's flake rate rises. Cap by failing-unit count (3 or fewer covers 200 of 232 named reds) and count every save by unit name.
- P3 B repairs test expectations and proof commands. Rule true (H via reader): skills/check-issue/SKILL.md:79. fw since 11-01: check.repair exits to check.fix 221, merge 113, failed 15. 59% of merged leaves had at least one A fix round (fix_rounds 0:144, 1:134, 2:52, 3+:25). Verdict: keep, after the audit signpost 6 asks for. Same direction as stable decision S6.
- P5 merge priority. True and larger than stated (H, host read): `akrogon.slice` has `CPUWeight=20` (systemd/akrogon.slice:6), but its children have no cpu controller (`cgroup.subtree_control` is `memory pids`). So inside akrogon nothing is weighted: a land's threads compete one for one with every seat and leaf check. The user manager on this host is delegated `cpu memory pids`, not `io`, so `IOWeight` in a user unit does nothing here without a system change. Verdict: keep the CPU half as one static `akrogon-land.slice` unit with a high `CPUWeight`, used by the land service and its run scopes (src/land.ts:34,185, src/run-check.ts:340). Drop the IO half (needs a host change outside akrogon units). Leave 20 against `app.slice` 100 alone: it protects the operator's desktop, which signpost 1a ranks first. Breaks: code that expects the land inside the leaf slice (`stop`, `sliceKeepReason` at src/reconcile.ts:202-222).
- P6 lanes. Akrogon already runs several `merge_checks` members at once (src/verify.ts:738-740) (H). Splitting framework's one `verify` into members is a framework config change. Per-command reuse was removed on 11-01 for saving "six 2-second commands" (history C8). Verdict: drop from akrogon, seed the split to framework.
- P7 auto-leave failed. True (M): no automatic exit (src/phase.ts:427-430). Entries: 3 silent turns (src/next.ts:524-531), 3 lost seats (src/next.ts:567-573), a seat's `failed --reason`, a push error (src/land.ts:126-133). Verdict: hold. The base-red visits come from land reds that chart 1 targets, and a silent seat already gets 3 tries. A return-when-main-moves rule is the wait state the operator ruled out on 10-10 (history C7, S4). Re-measure after chart 1.
- P8 mechanism binding. Text only, no code enforces locks (M). plan-issue already says "A done-criterion locks only its observable result" (skills/plan-issue/SKILL.md:43). Verdict: keep as a wording fix in the chart-issues brief shape, in the review-rules chart. One case (117 min) is thin evidence.
- P9 bookkeeping reads. True (M): `readTimings` parses the whole file (src/timing.ts:96-101), twice per dispatched leaf (src/next.ts:703, src/timing.ts:142). `repoInventory` runs 12 times per repo on an idle wake and walks closed leaves (src/state.ts:245-248,268). All under the global lock (src/next.ts:1485-1517). 436b5179 already cut one read per repo. Verdict: keep, change shape: stop reading before caching. 87% of timings rows are `check_start`/`check_end`, which the wake never uses. The wake's own facts (capacity wait, visit start) can live in the leaf's `state.yaml`, which makes `timings.jsonl` write-only for the wake. Inventory reads `open` only where closed leaves are not needed.
- P10 warm worktrees. Drop (M). fw: the suite is 645 s of a 652 s verify run, and time outside verify runs is about 1.6 min per attempt. The gain is under 10% of lane time for a stateful part.
- P11 ledger fields. Change. The rerun record ships with P1 inside the receipt row. The failure cause needs no new field: B's choice is already a move in `log.jsonl` (check.repair to `failed` is main-caused, to `merge` on the same head is inconsistent, to `check.fix` is leaf-caused, skills/check-issue/SKILL.md:103-108) (M). Gate refusals are recorded nowhere (src/phase.ts throws). Add that row only if the review audit needs it.
- P12 test slice parent. Drop the reconcile half: it is a second sweep of names that carry no home id. Test slices are `akrogon-test-<pid>-<serial>.slice`, stopped in `afterAll` (tests/run-units.test.ts:47-51,103-106), so a killed test leaks them (M). Change the name so they are children of the test's own slice (`ownSlices`, src/scope.ts:105-109). They then stop with their parent.
- P13 small items. Keep: skill text stated once (the run-check recovery paragraph is at check SKILL.md:61,89 and implement SKILL.md:54,73, and the proof-command rule is referenced 11 times); delete repo `fix_rounds` from code (no reader, src/config.ts:63) or enforce it; the frozen-citation scope. Skip the micro-optimizations until P9's reads are gone.
- P14 stacking. Hold. History C5: five shapes in 14 days, 2,932 lines deleted. Only worth probing once the measured red rate is under about 10%.

### #150 and #151

- #150. The timer is right and the e2e test is stale (H). While the watcher works, the timer keeps only the newest unsent due and renumbers it (skills/watch-issues/scripts/timer.ts:166-177). The test holds status for `intervalSec * 2 + 5` (tests/e2e/watch-live.e2e.ts:832), which crosses two boundaries, so due 3 becomes due 4, then it asserts `due=3 sent` (:836-840). The unit test already expects `due=4 sent` (tests/watch-timer.test.ts:1045-1047) (M). Likely broken by df54b95d (L). Fix the test: read the first due sent after the hold from the screen and assert it went once, with no fixed number. Same edit in the shell and paid cells (:785-797, :960-995). The header comment at timer.ts:1-9 is stale. This e2e is not a merge check, so it does not affect lands.
- #151. True (H via reader, formula read). `leafSlice` hashes only `repo.name/slug` (src/scope.ts:7-9). The host step lists every loaded `akrogon-l*.slice` (src/reconcile.ts:153,1303), and a slice matching none of this home's leaves is stopped when it is empty (src/reconcile.ts:1345-1374). The process check is outside any lock, and the lock is per home (src/admission.ts:51-58). Smallest class removal: delete the unmatched-slice stop branch, so a home stops only slices it derives from its own leaves. That removes about 30 lines and the race. Add the home to the hash so two homes cannot derive the same name (Q4). The test-only wrapper tests/own-slices-systemctl.ts can then go. Also host-wide and unowned: `reset-failed` on `akrogon-run-*` (src/reconcile.ts:1377-1386), likely dead since run units carry `CollectMode=inactive-or-failed` (L).

## M2. Backpressure

- Merge waiters do not count: predicate at src/next.ts:380-381, and docs/reference/limits.md says the same (H). A leaf counts only with a live terminal (src/next.ts:397) (M).
- The caps commit is 8ef5c061, not 436b5179. Refill dispatches leaves whose last timing row is `wait reason=capacity`, oldest first (src/next.ts:860-871). Nothing reads merge queue depth before a start. `mergeQueue` is used only for the turn (src/next.ts:780,1015,1084) (M). So yes, refill starts new leaves while the queue is deep.
- A land holds only later run-check runs of its repo (src/admission.ts:126-134,180-196). Seats keep working and already-started runs continue (M).
- Is admission by queue depth simpler than P10 or P14? Yes: one predicate against a warm-worktree store or stacking code. It adds no throughput. It stops load and spend that cannot land.
- The 11-21 change removed the only backpressure. Its reason was real: the machine-wide cap let framework's waiters starve other repos. The new fact since 11-22 is the per-repo cap. Counting a repo's waiters against that repo's cap only throttles the jammed repo and nobody else (Q5).

## M3. Ownership

| Resource | Created | Removed | Tied to owner's end |
|---|---|---|---|
| run root, green or thrown | src/run-check.ts:321 | src/run-check.ts:467 | yes |
| run root, red | marker src/run-check.ts:466 | with leaf dir, src/reconcile.ts:1220 | no, sweep at leaf close |
| run root, refused | src/run-check.ts:361 | none found | never |
| run root, killed owner | | src/reconcile.ts:1188 | sweep |
| leaf temp dir | src/config.ts:396 | src/reconcile.ts:1191-1222 | sweep |
| compile cache | tools under `TMPDIR` | with the run root | with K1, not created |
| verify worktree and its node_modules | src/verify.ts:678 | `finally` src/verify.ts:847-850, fallback src/reconcile.ts:1035-1043 | yes |
| leaf worktree | src/next.ts:273-295 | src/reconcile.ts:651-653, :869 | sweep, on the wake a land fires |
| leaf slice | implicit via `--slice` | src/stop.ts:58, src/reconcile.ts:581,1341,1373 | sweep |
| run scope and guard | src/scope.ts:33-71 | src/run-check.ts:423, guard, src/admission.ts:236-238 | yes |
| test slices | tests/run-units.test.ts:47-51 | `afterAll` | no when the test is killed |
| run record | src/admission.ts:77-82 | src/admission.ts:303, guard | yes |
| `runs/locks/*` files | src/admission.ts:52-55,164 | none | never (tiny) |
| capture pair, check logs | src/run-check.ts:382-441 | folded, then packed (src/pack.ts:83-104) | yes |
| ledgers `issues/*.jsonl` | append | none, no rotation | never. fw timings is 30 MB |
| `akrogon-io-*` dirs | src/shell.ts:34 | src/shell.ts:63 | yes, but in `/tmp` for land and verify services with no sweep if killed (L) |
| releases | src/release.ts:56-74 | `pruneReleases` src/release.ts:152-170 | on deploy |

All rows (M) from the reader except run-check and land lines (H). The stores that grow without an outflow are red run roots, refused run roots and the ledgers. Everything else has an owner-end remover with a sweep behind it.

## M4. Other changes worth a pick

- X1. A's first-round review changes the route in 2% of leaves. fw since 11-01, 368 first-round reviews by A/B verdict: fix/fix 74, nits/fix 93, ready/fix 77, ready/ready 66, nits/ready 37, nits/nits 11, and A-only fix 8 (fix/ready 6, fix/nits 2) (H, from `log.jsonl`). B alone decides 98% of routes. Dropping A from check.review saves one of four seat turns on every leaf, on the pricier slot, and deletes the two-seat phase parts (`done`, `seat_done`, per-seat verdicts, the seat rule at src/routing.ts:49-51). Not measured: whether A adds Fix items in the 74 fix/fix cases. That is the audit to run first.
- X2. Rule text per prompt. check-issue is 4,566 words, implement-issue 4,502, lifecycle-rules 1,507, and every phase prompt orders a re-read of the skill, its references, brief and design (check SKILL.md:6) (M). fw had 2,571 prompts in two weeks. Stating each rule once is the cheapest spend cut that needs no rule change.
- X3. No spend figure exists anywhere in src (M). Seat turns per leaf are the only countable proxy (`prompt` rows, src/next.ts:478-486). The spend chart should use turns per merged leaf as its figure.
- X4. The wake is global. Every hc turn end runs a full `next --wake` over all 12 registered repos (src/listen.ts:93) (M). Scoping the wake to the leaf whose turn ended, with the full pass on resume only, removes most of P9's cost at the source. It needs a check of which duties ride on every wake (refill, reconcile), so it is a later fork, not chart 3.
- X5. Residue to delete (history P5): `reused` in the receipt schema (src/verify.ts:74,327), `members` and the outcomes `split`, `held`, `reuse`, `ejected` (src/attempts.ts:8,35), `Batch.decision` and three unwritten batch fields (src/state.ts:83,95-97), the unreachable merge branch at src/phase.ts:239, `issues/red-records.jsonl` with no reader, and `retiredLeafTempRoot` once rollback no longer needs it (M). Old ledger rows still carry those outcomes, so the schema change must keep parsing them.
- X6. The base pass (src/land.ts:143-168,218-219) runs the full command list on the base, 11 minutes inside the lane. Once a `rerun` command exists it can prove the same thing on the base in about a minute. Later, after P1 is measured.
- X7. The merge-slow alarm (docs/reference/checks.md "normal wall time": episodes, 14-day accepted closes, stored normals) is a large rule set that only writes a notice. Candidate for deletion if nobody acts on the notice (L, not traced in code).
- X8. Would I build it differently? The lane, the receipts and command-owned merge are sound and stable (S3, S5). What I would change is where reds are absorbed: environment causes fixed in the run layer, one cheap rerun as the only absorber in the lane, and no further lifecycle rules for flaky reds. Six of the fourteen reversal cycles are such rules.

## M5. Charts and order

Each fits one direct attempt. Dependencies are real code or measurement dependencies.

1. C1 `land-own-reds`: #151 (delete the unmatched stop, home in the hash), P1 with its receipt record, K1. Figure: red share of land attempts and same-head bounces per day, from `merge-attempts.jsonl` and `log.jsonl`. #151 first inside the chart, because it changes what akrogon's own verify sees.
2. C2 `run-scratch`: K2, K3, the K5 guard change and the evidence pick (Q3). Depends on K1 being live and on Q3. Figure: teardown-timeout units per verify, size of the temp roots.
3. C3 `lane-first`: P5 as `akrogon-land.slice`, and the queue-depth predicate (Q5). Depends on C1's figure as the baseline. Figure: CPU pressure per attempt (already in the attempts row) and merge wait per leaf.
4. C4 `wake-cost`: P9 as "stop reading", plus the X5 residue. Independent. Figure: wake pass wall time under the lock.
5. C5 `test-hygiene`: #150 and the P12 test-slice parent. Independent, small, can run any time after C1.
6. C6 `seat-rounds`: the review audit first (X1, P3), then P3, P8, X2 and maybe X1. Depends on the audit and on C1, which changes how many repair visits come from lands. Figure: seat turns per merged leaf.
7. Held, re-measure after C1-C3: P7, P14, X4, X6. Dropped: K4, P6 (seed to framework), P10, the IO half of P5, the reconcile half of P12.

## M6. Forks

- Q1. How does akrogon rerun a failing unit?
  - 1a. A per-check `rerun` command in repo config. Akrogon passes the failing names in a file and runs it once in the same verify worktree. No key means today's behavior. (recommended: works for any repo and test runner, and adds one key and one receipt field)
  - 1b. Akrogon builds `bun test -t <title>` from the `toolkits` setting. No repo change, but it fails for framework's script-based units.
  - 1c. Rerun the whole red command once. No config, but 11 lane minutes per red, which is the cost that removed reruns on 11-21.
  - With any option: cap on failing units (suggest 3), no rerun for `(no test name)` or `(log gone)`, each save recorded by unit name.
- Q2. Where does a run root go, and when?
  - 2a. A host setting in `~/.akrogon/config.yaml` naming a tmpfs run root. Absent means disk, as today. `init-akrogon` proposes it when the host has a large tmpfs. (recommended now: one optional path, no heuristic, cannot fail on a small PC)
  - 2b. Self-sizing: record the run scope's `memory.peak` at run end and use tmpfs when the last peak for that check fits the free tmpfs with margin, else disk. No fixed numbers and no wait, but an untested shape. Probe before taking it.
  - 2c. K4 as proposed: wait for 12 GB free inside a 36 GB budget. Not recommended.
  - Open with 2a: tmpfs pages count toward `akrogon.slice` `MemoryHigh=64G`. One framework land peaks at 11 GB. Undo figure: `memory.events` high count on the slice.
- Q3. What survives a red run?
  - 3a. Logs plus one evidence folder: run-check exports a path next to the check log, tests write what they want kept there, it is packed at close, and the run root is always removed. Framework's capture drivers adopt it through a framework seed. (recommended: matches the operator's 10-10 words "always cleaned up unless it's logs", and adds no heuristic)
  - 3b. K3's `tar | zstd` archive with an exclusion list, newest two per leaf. Needs no framework change, but the list is framework knowledge and will need tuning per repo.
  - 3c. Logs only.
  - Ordering risk with 3a: until framework adopts the path, a paid failed capture loses its transcript again. Either land the removal after the framework seed lands, or take 3b as a bridge.
- Q4. How does the home enter the slice name?
  - 4a. Non-default homes add the home path to the hash, the default home keeps today's name. No rename on the live install, no transition, rollback-safe. (recommended)
  - 4b. Every home adds it. Cleaner rule, but live seats sit in old-named slices at the switch: `stop` and B's dispatch recompute the name (src/stop.ts:58, src/seat.ts:264) and miss them.
  - 4c. A home prefix in the name and in the glob. Changes the cgroup path that tests hardcode (tests/leaf-slices.test.ts:438,522).
- Q5. Does the merge queue hold back new starts?
  - 5a. A repo's merge waiters, except the leaf being landed, count toward that repo's own `max_active` and not the machine cap. (recommended, after C1's figure is in, as a measured change)
  - 5b. A fixed depth threshold. One more tuned number.
  - 5c. Leave it and re-measure after P1.
- Q6. Does A keep its first-round review seat?
  - 6a. Audit a sample of the 74 fix/fix reviews for Fix items only A found, then decide. (recommended)
  - 6b. Drop it now on the 2% figure.
  - 6c. Keep it.
- Q7. Does the land run get its own slice?
  - 7a. Static `akrogon-land.slice` with a high `CPUWeight`. (recommended, CPU only)
  - 7b. Raise the leaf slice's weight for the length of the land and reset it after. Runtime state to restore.
  - 7c. Nothing until C1 and C2 are measured.

## Inputs

Read by me: INTAKE, both seed decisions, signposts, history-reversals, src/land.ts:20-304, src/verify.ts:690-759, timer.ts:155-189, watch-live.e2e.ts:826-843, docs/reference state-and-phases, checks and limits, both repo configs, the host config, LESSONS.md:50-60, host cgroup and mount state, framework `log.jsonl`, `merge-attempts.jsonl`, `verify-runs.jsonl`, `timings.jsonl`.
Read by Haiku readers with path:line returns (spot-checked where marked H): src/next.ts, admission.ts, state.ts, timing.ts, log.ts, attempts.ts, phase.ts, routing.ts, run-check.ts, scope.ts, seat.ts, config.ts, flaky.ts, batch.ts, verify.ts, parts of reconcile.ts, the four lifecycle skills, tests/leaf-slices.test.ts, tests/own-slices-systemctl.ts.
Not read: tests/ beyond those, src/status.ts, src/hc.ts, src/listen.ts beyond the reader's cites, src/timing-report.ts, review-B.md files (the audit), framework's test code, the merge-slow code.
