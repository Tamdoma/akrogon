# Map B: merge-lanes

Slot B, 2026-11-21. Source read at akrogon `eb4d64e9`. Ledgers read 2026-11-21 19:40Z: framework `issues/merge-attempts.jsonl`, `verify-runs.jsonl`, `log.jsonl`, `timings.jsonl`, window 2026-11-14T00:00Z to 11-21T18:25Z. Numbers come from my own scripts over those files unless a path is given. Outside pages were fetched 2026-11-21. Earlier-chart lines were extracted by a helper and I re-read the two my recommendations rest on (merge-turn `forks/turn-release.md` Q3, `forks/merge-order.md` Q2).

## Headline

- H1 The line is suite-bound, not policy-bound. Verify is 91% of attempt time (68.0 of 74.5 h). Handover between holders is 8 s median. Rebase, setup, gates and push together are under 4%.
- H2 5a as a pure reorder does not move the 1a metric. One suite at a time and receipts keyed by tree (`src/verify.ts:154-162`, `872-877`) mean the red leaf's retest still costs one full line turn after it returns. What 5a can really remove from the line is 7.5 h of 74.5 h (10%): seat reading time 3.9 h and base runs 3.6 h. Everything else depends on forks S, R, P and M below.
- H3 5a without a main-red answer is worse than today. During 11-15 to 11-17 one test red on main failed 41 runs. Under 5a every leaf would fail, leave and return, and the known-red command it needs is refused off the line (`src/verify.ts:448-451`). M2 must land before or with 5a.
- H4 6a removes the only backpressure on a repo's own production. Journey time is 77% queue wait (247 of 320 h), so a longer queue raises the 1a metric for every framework leaf unless the service rate rises.

## F. Findings from the ledgers

- F1 248 attempts: 201 merged, 47 red. Line busy 74.5 h, so 22.2 min of line per landed leaf. A clean attempt (one green run) is 11.9 min median: 132 attempts, 26.8 h, 36% of busy time.
- F2 Journey, first `to: merge` to `to: merged` in `log.jsonl`: n=198, median 71.7 min, p90 205, max 493. Own attempt time median 14.1 min. Waiting median 48.9, p90 185. Leaves in merge at attempt start: median 3, p90 9, max 12.
- F3 Attempt shapes (G green, R red, b base run): merged G 132 (26.8 h), merged RG 52 (24.2 h, median 26.0 min), red R 28 (6.5 h), red RR 11 (3.8 h), merged RRb 11 (6.1 h, median 32.6 min), red RRb 6 (3.4 h), other 8.
- F4 112 of 248 attempts had a red run. Line time from first red run end to attempt end: 25.0 h (34% of busy). Inside it: reruns, 21 base runs (3.6 h), seat gaps red-run-end to next-run-start (3.9 h, median 65 s, one 123 min outlier).
- F5 After a first red: next run green on the same tree 43 (flaky by `src/flaky.ts:65` definition), green on a changed tree 10 (B repaired in place), red on the same tree 28, red on a changed tree 1. Rerun-green odds 53 of 82 (65%). Fresh first-run green 136 of 248 (55%).
- F6 147 red head runs, 30.2 h. 86 fail one unit. 234 distinct failing units; 5 units fail in 5 or more runs. `skills-typecheck-switch > the fixed-list lesson is retired...` 41 runs (11-15: 12, 11-16: 6, 11-17: 23). `verify-aliases` 13. `satellite record keeps the prior fixture` 9. Only 42 of 147 red runs are fully explained by the 5 recurring units.
- F7 Exits from merge: 201 merged, 46 `check.fix`, 2 failed. `check.fix` round trip back to merge: median 5.9 min, p90 12.8 (n=46). Leaves with 2 or more merge entries: 38, journey median 86.5 vs 62.8 for one entry, p90 260 vs 198.
- F8 Non-verify time per attempt: start to first verify (fetch, `buildStack`, land launch) median 6 s, sum 0.8 h. Last verify end to attempt end (gates, push) median 6 s, p90 1.5 min, sum 1.8 h. Setup command inside verify median 0.8 s, sum 0.09 h. Worktree plus record overhead per run median 2.5 s. Admission wait 4 ms.
- F9 Handover: next attempt starts 7.9 s median after the previous ends (211 gaps). Only two gaps over 60 s had other leaves waiting (37 min 11-18 09:55Z, 24 min 11-18 18:39Z), and both hold merge `check_start` events in `timings.jsonl`, so they are unrecorded attempts, not idle line.
- F10 Live 2026-11-21 19:43Z (`akrogon status`, `hc ls`): 6 framework leaves in merge, each with 2 live seats (pi A, codex B), 11 of 12 idle. `checker-command` 11 h 08 m in merge, fix rounds 3, TURN 5. Counted against `max_active: 12` (`~/.akrogon/config.yaml`): 6 framework plus 2 akrogon.
- F11 Host: idle seat RSS about 0.37 GB (pi) and 0.27 GB (codex) (`ps`). Framework worktrees 12 GB for 7 (1.7 GB each). `akrogon.slice`: CPUWeight 20, MemoryHigh 64 GB, MemoryMax 96 GB, no CPU quota (`systemctl --user show`). Framework sets no `full` key (`issues/config.yaml`), so no admission line covers its suite (`src/admission.ts:224-228`); akrogon sets `full: [test]`.
- F12 A `max_active` refusal leaves no trace: `allocate` returns null (`src/next.ts:414`), dispatch records wait reason `none` (`src/next.ts:761`), and `waitReasonSchema` has no capacity value (`src/timing.ts:22`). How often the cap blocked another repo cannot be counted before or after 6a.

## 5a. A failed merge leaves the line

### Today's path

`land` runs verify (`src/land.ts:86`). Red calls `handOff` with `wake: 'red'`, owner `seat` (`src/land.ts:63-77`). The leaf stays holder because a leaf with a batch record sorts first (`src/turn.ts:120`). `mergeTurn` prompts B (`src/next.ts:950-952`). B reads the log, then by skill reruns `akrogon verify --attempt` in the line, may repair and rerun, may run `--known-red` (head rerun plus a base suite), then `merged` or `check.fix` (`skills/merge-issue/SKILL.md` "attempt top", "Shared endings"; `skills/lifecycle-rules.md` "Red check with no cause in the leaf's diff"). A red holder can hold the line for three suites (RRb median 32.6 min, F3).

### Consumers of the state 5a changes

- `src/turn.ts:112` stopped-holder exception, `:120` batch-first sort.
- `src/next.ts:932` reconcile loop, `:946-961` holder branches, `:751-754` (a merge leaf that is not the holder is never prompted), `:862-920` `reconcileBatch`.
- `src/phase.ts:921-928` (`merged` and `check.fix` refused unless holder), `:930-948` batch paths and the red attempt record, `:226-229` fix round count, `:230` stamp, `:725-733` `landClaim`.
- `src/verify.ts:448-451` (`--attempt` needs a merge leaf holding that attempt), `:880-896` known-red flow.
- `src/status.ts:115` TURN column.
- Skill text: `skills/merge-issue/SKILL.md`, `skills/lifecycle-rules.md`, `skills/check-issue/SKILL.md`, `skills/watch-issues/SKILL.md:38`. A seat following stale text would call a refused command and stall.

### Forks

- S. Where is the red leaf while off the line?
  - S1 Stay in `merge` with a mark that drops it from `mergeQueue`. Creates the state "in merge, not in the queue" and touches every consumer above.
  - S2 Recommended. The command moves it `merge -> check.repair` and clears the batch record. `check.repair` is already B's repair phase with exits `merge`, `check.fix`, `failed` (`src/routing.ts:39`), and its move back needs a green leaf receipt (`src/phase.ts:443-444`, cheap stage 14.5 s per merge-slow-alarm `INTAKE.md:29`). The queue, the holder guard, dispatch and status then need no special case because the leaf is not in merge. Each failed round becomes a `log.jsonl` row, which is what metric 1a counts. Changes: `routing.merge.next`, `land.ts` red ending, the check-issue repair text for a merge-red entry.
  - S3 Send every red to `check.fix`. Wakes A on flaky reds (43 in the window), so token cost grows. Breaks a hard limit.
- R. What is the retest?
  - R1 Recommended base. None off the line. B judges from the kept log. No cause in the diff sends the leaf back to merge, and its next turn is the retest.
  - R2 Allowed on top of R1. B reproduces with the narrowest failing command through `akrogon run-check`, the route A already has in `check.fix` (verify-waste `forks/receipts.md` Q4, operator "yes, amend it"). Could spare up to 28 second reds (5.1 h, F5). Limit: reds that only appear under full-suite load pass narrowly (verify-waste `INTAKE.md:25`: 36 red logs, all 120 s timeouts in `hooks:selftest`).
  - R3 Full suite off the line. It is a second concurrent suite, so it waits on N2. Its receipt is reusable only if main did not move.
- P. Where does the leaf return?
  - P1 Back of the queue (today, `src/phase.ts:230`; operator 2026-10-05 "3a", "Foreclosed: keeping the first stamp", merge-turn `forks/turn-release.md` Q3). A red then costs depth times 22 min: 66 min at median depth, 200 at p90. GitLab, Zuul and Bors all do this.
  - P2 Keep the first stamp. The leaf loses one turn, not the queue. Risk: a leaf that keeps failing takes every other turn.
  - P3 Recommended. Keep the first stamp when the leaf returns with no code change by A, new stamp after `check.fix`, and a new stamp after the second kept return in one entry. The 2026-10-05 reason was never inserting into a recorded batch; batches were removed in `6e7a33ff` (2026-10-19). Shopify keeps position and removes after repeated failures.
  - This fork decides the tail of metric 1a. The mean barely moves either way (F5 odds are close).
- K. How is a flaky red told apart?
  - K1 Recommended. Seat judgment as today, moved off the line.
  - K2 Command-side from the flaky list (`src/flaky.ts:89`). Covers at most 42 of 147 red runs (F6). Saves tokens where it hits. Needs a bound.
  - K3 Chromium CQ retries the failed shard and reruns failing suites without the patch. Needs a narrow command akrogon cannot derive for an arbitrary repo.
  - K4 Blind retry. Adds a wasted turn to each real red: at least 28 attempts, 5.6 h in the window.
- M. A red that is main's fault.
  - M1 Today. Each leaf pays a rerun and its own base run, because `knownRedReceipt` accepts only a base run linked to that head (`src/verify.ts:212-214`). 17 RRb attempts took 9.5 h.
  - M2 Recommended. One base-red observation covers every later head: a head whose every failing named unit is an unresolved red on main lands in its first turn, no rerun, no new base run. `newRedUnits` already computes "unresolved red on main" for the notice (`src/verify.ts:296-345`). Same bar as base-red `forks/red-base-policy.md` (known reds pass; accepted cost that a new break inside an already-red unit can land). Would have cut the 17 RRb attempts from 9.5 h to about 3.4 h.
  - M2 sub-fork: where the one base pass runs. In a line turn (no second suite), or beside the line (waits on N2).
  - M2 sub-fork: nameless failures still need the seat's two-log read (`skills/lifecycle-rules.md`).
  - M3 Hold the line while main is red. Foreclosed: `--red-on-base` deleted in `dc2e2b0c`; operator 2026-10-10 "why does it have to wait for the main?" (base-red `forks/red-base-policy.md:33`).
- G. Do gate refusals and conflict (solo) turns also leave the line? Small: gates and push total 1.8 h, rebase 0.8 h (F8). Under S2 the same move covers `wake=gate`. A push error stays, since it is not the leaf's fault.

### Cost of 5a against the declined 5b

Member receipts repay only the red member on a same-tree rerun (verify-waste `forks/receipts.md` Q1; `src/verify.ts:503-570`). Under 5a the return is on a rebased tree, so that saving never applies. Framework has one `merge_checks` member today, so nothing is lost yet. If suite-lanes adds members, 43 same-tree reruns per week would have paid one member instead of a full suite.

## 6a. Waiting merge leaves stop counting

### Code and consumers

`activeCount` counts every unfinished leaf with a live terminal (`src/next.ts:387`), or every unfinished leaf of a repo whose session is unreadable (`:389-393`). Its one consumer is `allocate` (`:414`), reached from dispatch (`:760`), `seatCommand` (`:1170`) and `broadcastPass` (`:1063`). A leaf with a live seat is never refused (`:413-414`). The 2026-10-05 decision it replaces: waiting leaves keep tab and slot, "Foreclosed: uncounted waiting tabs, closing tabs", with the reason "wait is at most one run, B keeps review context" (merge-turn `forks/merge-order.md` Q2). Waits are now 48.9 min median, and since 2026-10-19 B is prompted only on red (merge-stacks `forks/stack-fate.md:46`).

### Forks

- A1 What stops counting?
  - A1a Recommended. Leaves in phase `merge` are left out of the count in both branches, including the unreadable-session branch. Under S2 a red leaf is in `check.repair`, so it counts again while B works, with no extra rule.
  - A1b Close both seats at merge entry, so the existing predicate needs no change. Frees 0.65 GB per leaf. A red (45% of attempts) then starts a cold seat. Token effect unknown: measure in `issues/token-ledger.yaml` before choosing.
- A2 What bounds the queue now? Nothing. GitLab states "The number of queued merge requests is unlimited" and bounds only parallel pipelines; Zuul holds changes beyond its window without running jobs. The operator took 6a over a per-repo cap, so I propose a sensor, not a cap: queue depth and oldest wait are already in `akrogon status`.
- A3 Host load. Up to 12 working leaves now run beside the merge suite, and their checks have no line (`src/admission.ts:224-228`). On 2026-10-24 load 113 on 32 threads came with 4 of 21 verify runs green (host-run-load `INTAKE.md`). The slow alarm is the only sensor and its rolling median absorbs steps (`src/verify.ts:367-369`). The 6a leaf needs a before and after reading of merge verify median and red rate.
- A4 Measurement. Add a capacity wait reason so refusals are countable (F12). Without it 6a's done-criterion can only be a synthetic test.
- A5 Disk. Each waiting leaf holds a 1.7 GB worktree. An unbounded queue grows it.

## Other line costs and what akrogon can cut without a second suite or batching

| Cost | Size in window | Cut by |
|---|---|---|
| Green suite time | 39.0 h, 11.7 min median | suite-regrowth (handed off) |
| Red runs | 30.2 h, 147 runs | M2 (main-red share), R2 (some second reds); the rest is framework flakiness, 229 units failing under 5 times |
| Seat reading on the line | 3.9 h | 5a |
| Base runs on the line | 3.6 h | M2 |
| Gates, push | 1.8 h | S2 removes the seat-driven landings after a red; the rest is 6 s median |
| Fetch, rebase, launch | 0.8 h | nothing worth it |
| Handover | 8 s median | nothing |
| Setup, worktree | 0.35 h | nothing |

Not available: reuse of a green run when main moved only in `issues/` (merge-turn `forks/issues-only.md`). Receipts match on the whole tree (`src/verify.ts:122-124`), and in a busy line main always moves in code.

## 2a and N2

- N1 What two suites would be used for under "each leaf alone": testing the next leaf on top of the holder's tested top while the holder runs (GitLab trains, Zuul gating). If the holder lands, the next leaf's rebased tree equals the tested tree and the receipt is reused (`src/verify.ts:872-877`). Gain bound: the holder is green 55% of the time (F5), so two suites at the allowed 1.25x slowdown land 1.55 leaves per 1.25 suite times, a 24% gain at the limit and 55% with no slowdown.
- N2a What akrogon needs to act on a pass: a second attempt record per repo, a speculative `built_on` (the holder's top, not main), and a discard path when the holder goes red. That is a chart of its own. `mergeTurn` assumes one holder throughout (`src/next.ts:940-1043`).
- N2b The probe needs a pinned baseline: the green merge median of the 20 runs before it, recorded in the fork. The alarm's `normal_ms` moves.
- N2c The probe reading is optimistic if taken before 6a lands, because 6a raises background load. Take it with the working-leaf count recorded.
- N2d What waits on N2: R3, a base pass beside the line, and speculative testing. Nothing else here waits.

## failed-merge-resume

It fixes a stale batch record when a failed merge leaf moves back to merge (`src/phase.ts:216`, `src/next.ts:873`). It is in implement now (`akrogon status` run line, 19:43Z). No fork here depends on its outcome. Any leaf here that edits `mergeTurn`, `reconcileBatch` or the batch handling in `commitMove` must build on it. Under S2 the red hand-off clears the batch, so the state it guards arises less often; under S1 both would edit the same record fields. Its invariant (a return to the line starts a new attempt on the current base) is the one 5a needs, and `mergeTurn` already meets it when no batch is recorded (`src/next.ts:974-1009`).

## Proposed split

- L1 `main-red-share` (M2). A head failing only unresolved main reds lands in its first turn with no rerun and no new base run. Check: command-boundary test, plus the ledger shows no RRb shape for a covered leaf. No dependency.
- L2 `red-leaves-line` (5a with S, R, K, G). A red land run ends the turn, the next attempt starts in the same wake, the red leaf's seat works off the line, and no merge-scope pass can start for a leaf that is not the holder. Check: test that the next leaf's `batch` event precedes the red leaf's seat prompt. Depends on L1 (H3) and on failed-merge-resume landing.
- L3 `return-place` (P). A leaf returning with no code change is listed ahead of later arrivals, bounded. Check: `akrogon status` order test. Depends on L2.
- L4 `waiting-off-cap` (6a, A1, A4). Merge-phase leaves do not count, and a capacity refusal is recorded. Check: with the cap filled by one repo's waiting leaves, another repo dispatches. No dependency.
- L5 `slow-baseline` (carried from suite-regrowth `forks/suite-cuts.md` Q5). The alarm compares against a baseline a slow step cannot absorb. No dependency. It is the sensor A3 and N2b lean on.
- Off route with trigger: speculative next-leaf testing, only if N2 passes.
- No new ledger is needed for metric 1a: `log.jsonl` and `merge-attempts.jsonl` already give first entry, rounds and landing (F2, F7).

## Q. Questions the brief does not ask

- Q1 Who else writes main? Four attempts were restacked after a refused push (shapes GG, RGG), and the 3-day red was in a test that reads `learnings/LESSONS.md`, which doors push directly. A queue guarantees only what goes through it. If that incident came from a direct push, the largest red source (41 of 147 runs) is outside the line.
- Q2 Does 1a mean the average journey or the worst ones? P turns on it.
- Q3 Is automatic known-red landing with no seat read acceptable for named units? The base-red policy was A's pick, not operator words.
- Q4 After suite-lanes, how many `merge_checks` members does framework have? It sets what 5a gives up against 5b.
- Q5 What arrival rate does framework reach with the cap freed? The line clears 2.7 leaves per hour at 22 min each and was busy 16 to 18 h on three days. If arrival exceeds that, only suite time and red rate help.
- Q6 Keep or close waiting seats (A1b): which costs fewer tokens on a red wake?

## R. Pitfalls over the work's lifetime

- R1 5a with P1 starves red-prone leaves (`checker-command`, F10).
- R2 5a with a kept stamp and no bound lets a load-only flake alternate at the head of the line.
- R3 5a before M2 turns a main-red incident into a full-queue cycle with no legal known-red route (H3).
- R4 6a lengthens the queue, branches age, more rebases conflict, and each conflict is a seat-held solo turn.
- R5 6a raises load under the merge suite; a slower or flakier suite costs more than the seats gain, and the alarm will not show it (L5).
- R6 Any off-line full run is wasted once main moves (receipts by tree).
- R7 Skill text is a consumer. The leaf that changes the red path must change `merge-issue`, `lifecycle-rules`, `check-issue` and `watch-issues` together.
- R8 After a `check.fix`, `check.review` needs only B (`src/routing.ts:50-52`). More returns through `check.fix` mean more single-reviewer passes.

## Sources

- GitLab merge trains, https://docs.gitlab.com/ci/pipelines/merge_trains/ : a failed MR is removed and must be re-added; later pipelines restart; "The number of queued merge requests is unlimited"; default 20 parallel pipelines.
- Zuul gating, https://zuul-ci.org/docs/zuul/latest/gating.html : a failed change is dropped and those behind are retested; window 20, halved on each failure; "unreliable tests in one project queue don't affect the window of other project queues".
- Bors-NG README, https://github.com/bors-ng/bors-ng/blob/master/README.md : a single-PR batch that fails "gets kicked back to the creator".
- Chromium CQ, https://chromium.googlesource.com/chromium/src/+/HEAD/docs/infra/cq.md : "Retry each shard that has a test failure"; failing suites rerun without the CL, and a failure there is ignored as broken on tip of tree; median cycle target under 40 min.
- Shopify, https://shopify.engineering/successfully-merging-work-1000-developers (2019-11-14): position kept; removal "when the number of successive failures exceeds the failure tolerance" (3).
- Not read: GitHub merge queue docs (404) and Uber SubmitQueue (404, 403). Nothing here rests on them.
