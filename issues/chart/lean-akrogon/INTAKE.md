# Intake: lean-akrogon

## Scope

Shared opening map for the session's handed work: Tamdoma/akrogon#148, #149, #150, #151 and the operator's note (optimize akrogon for any PC; review two months of reversed decisions; fewer moving parts; fast, predictable merges; lower LLM spend). A consolidates into category charts after the map. Flaky-test intake candidates are listed under Agent findings.

## Provenance

- GitHub: Tamdoma/akrogon#148
- GitHub: Tamdoma/akrogon#149
- GitHub: Tamdoma/akrogon#150
- GitHub: Tamdoma/akrogon#151
- Operator: /chart-issues message, 2026-11-22T17:54Z (door t126)

## Source: Tamdoma/akrogon#148

# Leaf run scratch lives on disk-backed /var/tmp and red runs keep their whole folder: 51 GB kept, 163 s tree removals time out framework lands, land runs leave ~340 MB compile cache each

Source: Tamdoma/akrogon#148
URL: https://github.com/Tamdoma/akrogon/issues/148

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-22)

- Run scratch moves to RAM (tmpfs). Do not move it as things are today: first stop run folders from piling up, then move to RAM.
- Goal: the setup that makes merges on this PC fastest overall, with the fewest failures, without overloading the host.
- This was filed after both watch consultants (Claude Fable, agy) agreed on the shape. Their plan is in the background section below and is not locked.

## Observation

Measured on 2026-11-22 on the operator's host (123 GB RAM, 62 GB tmpfs `/tmp`, `/` is btrfs `compress=zstd:3` on dm-crypt) by the framework watch case `~/.akrogon/watch/framework/consults/repair-round-bound-1/` (turn-3-agy.md, turn-11-fable.md, turn-8-fable.md):

- `/var/tmp/akr-1000` held 51 GB (btrfs-allocated; 35.0 GB apparent). 29.4 GB (84%) was in 214 `run-*` folders marked `.akrogon-kept` (red runs). 3.6 GB was in the 2 live runs. Every framework folder mapped to an open leaf. This was not merged-leaf leftovers.
- Inside kept red runs: `verify-history-free-*` 7.65 GB, `node-compile-cache` 4.82 GB (325-474 MB per red verify), `fixture-*` 4.23 GB, `akrogon-suite-*` 4.41 GB, `astro-baseline-migration-*` 2.74 GB, `landing-chain-proof-*` 2.72 GB. The human-readable evidence is usually under 5-50 MB per run. One kept folder of 1.58 GB and about 127,000 files is 156 MB as one zstd archive once `node_modules`, the compile cache, `.git` and Chromium folders are left out.
- Removing one 55,241-file site install took 163 s under `/var/tmp` during a framework land run. The same removal took 0.3 s on tmpfs at host load 113.
- Teardown hooks removing trees on disk were 6 of 20 failing units in one framework verify and 16 of 29 in another. These were all timeouts, with no assertion failure.
- One `framework:verify` run folder peaks at 11.0 GB and 580,149 files (sampled every 40-60 s) and ends at 1.6 GB. The files are full copies (link count 1).
- Run folders hold Chromium `.org.chromium.Chromium.*` files (38 in one live run), so Chromium's shared memory sits on btrfs over dm-crypt.
- Seatless land runs leave `node-compile-cache` (about 340 MB per run) in TMPDIR.

## Location

- `src/config.ts:359-374` (`leafTempRoot` fixed at `/var/tmp/akr-<uid>`, override `AKROGON_LEAF_TEMP_ROOT`; `retiredLeafTempRoot` is `/tmp/akr-<uid>`, which the host sweep deletes)
- `src/run-check.ts:44,62-76` (env), `:440,455-456` (`.akrogon-kept` on nonzero exit, from 980e92b2 / #145)
- `src/seat.ts:299` (`NODE_DISABLE_COMPILE_CACHE=1` for seats only), `src/land.ts:38-42`, `src/verify.ts:879` (only forward it)
- `src/scope.ts:70` (`startRunGuard`), `src/reconcile.ts` (sweeps)
- systemd `akrogon.slice`: `MemoryHigh=64G`, `MemoryMax=96G`, `MemorySwapMax=0`
- Read in installed release `~/.akrogon/releases/fdc5acdd4ea4/src`. Its `src/` matches the akrogon checkout per agy, but this was not diffed by the watch.

## Reproduction

Run framework leaves and lands for a day with `max_active` 9-12. `du -sh /var/tmp/akr-1000` grows by about 1.6 GB per red run. Under load, framework teardown hooks that remove site installs or skills copies time out, and the land goes red.

## Expected behavior

Test scratch costs little to create and remove. Red-run evidence stays readable without keeping multi-GB trees. Temp never piles up into RAM or disk pressure.

## Urgency

High. Slow tree removal on disk is a main source of framework land reds (Tamdoma/akrogon#147, 12 of 13 lands red on 2026-11-22). Workaround in framework: smaller copies and explicit hook timeouts (framework 81731f5c46, 3082fabc72). Simply pointing `AKROGON_LEAF_TEMP_ROOT` at tmpfs today would add about 30 GB of unswappable shmem to `akrogon.slice` and repeat the 2026-10-14 fault (c6981701).

## Suspected cause

- Main: run TMPDIR sits on btrfs+zstd+dm-crypt, where per-file create and unlink is slow (c6981701 moved it there on 2026-10-14 because leftover tmpfs files counted as slice memory and held admission closed. That admission memory reading was dropped the same day, `src/admission.ts:224`).
- Contributing: 980e92b2 keeps the entire red run folder until the leaf closes, so neither placement is cheap. Land runs do not set `NODE_DISABLE_COMPILE_CACHE`.
- History: 5b2f4d0f (2026-10-02) had moved temp to RAM because disk temp made headless Chromium captures hang.
- Whose view: agent (watch and both consultants).
- Not inspected: how often kept red folders are actually read by fixers (access times are polluted by sweeps). The peak of leaf-scope checks other than a full verify.
- Related reports: Tamdoma/akrogon#147 (open, land reds and run admission; the load half), #145 (closed, introduced keeping red run temp), #49 (closed, leaf TMPDIR on disk). Searched Tamdoma/akrogon all states for "tmpfs temp" and "compile cache", plus the account's issues since 2026-11-20.

## Proposed, not decided (watch consultants Claude Fable and agy, 2026-11-22)

Both agree on the shape. Where they differed, Fable's sizing and archive are written here, and agy's alternative is noted.

1. K1, do first and alone: set `NODE_DISABLE_COMPILE_CACHE=1` in every run env (run-check, land, verify), not only in seats.
2. K2: the run-folder TMPDIR of checks, verifies and lands goes on tmpfs under a root other than `/tmp/akr-<uid>` (that name is the retired root the host sweep deletes, unless that is changed). Leaf and seat temp, logs and evidence stay on disk.
3. K3: always remove the tmpfs run folder at run end, green or red. On red, first write one `tar | zstd` archive of the folder (without node_modules, compile cache, .git and Chromium profiles) next to the check log. Keep the newest two per leaf. agy's alternative: an `AKROGON_EVIDENCE_DIR` on disk that tests write evidence into. Fable prefers the archive because it needs no framework change.
4. K4: size admission by scratch space. A verify-scope run starts only when tmpfs has about 12 GB free inside a run-scratch budget of about 36 GB (three full verifies). This is based on the measured 11 GB peak, not the end size.
5. K5: the run guard and reconcile remove orphan run folders when the owner is gone.
6. K2, K3 and K4 ship together. K2 alone repeats the October fault.
7. Framework side, separate: shrink the per-test full clones and site installs (peak 11 GB, predicted under 4 GB), and make tests remove what they create.
8. Predicted, not measured: tmpfs use stays inside the budget under `MemoryHigh=64G`, Chromium capture hangs stop, and teardown-hook timeouts stop.

## Source: Tamdoma/akrogon#149

# Framework leaves spend most of their time in merge and in repair hand-offs, not in seat work: 1,089 h in merge vs 365 h implement, 62 h same-head bounce loops, ~133 h B-to-A hand-offs (audit 2026-11-22)

Source: Tamdoma/akrogon#149
URL: https://github.com/Tamdoma/akrogon/issues/149

Origin repo: Tamdoma/akrogon

Unverified intake.

## Operator decision (Ivan Juras, 2026-11-22)

- Goal, in the operator's words: "I want Akrogon to be fast, lean, merge things fast, and also use the computer in an optimal way so it doesn't get overloaded while making sure that none of the pros or testing ceremony gets in the way."
- File every audit finding that improves akrogon's lifecycle together, as this one report. P1 (rerun the failing units inside the land run) comes first.
- Not in scope: the land-red ownership work already in #147, and the temp placement in #148.

## Observation

A read-only audit on 2026-11-22 by the framework watch and three consultants (Claude Fable: lifecycle; agy: run and host; codex gpt-6.1-sol: process gates) over framework `issues/log.jsonl`, `merge-attempts.jsonl`, `verify-runs.jsonl`, `timings.jsonl`, `review-B.md` files and the installed release `~/.akrogon/releases/fdc5acdd4ea4`. Case folder: `~/.akrogon/watch/framework/consults/repair-round-bound-1/` (turn-4-agy.md, turn-5-agy.md, turn-8-review.md, turn-13-fable.md, turn-25-watch.md).

- Leaf time by phase (10-13 to 11-22): merge 1,089 h, implement 365 h, check.fix 188 h, failed 140 h, check.review 87 h, check.repair 66 h. Seat work itself is fast (A review median 1.4 min, B 3.2 min, dispatch 3.6-8 s).
- Merge stints since 10-10: 891 h waiting in the queue against 243 h of the leaf's own land runs. One leaf per land run. Batches with members stopped after 2026-10-19 (0 of 413 attempts since 11-08).
- Land runs: 381 of 1,148 red (33%), using 84 of 243 lane hours. Since 11-15, 58 of 124 resolved merge reds (47%) later went green with zero leaf changes (same tree or same patch_id).
- Since release 66f90be9 (11-21), every red land exits to check.repair with no rerun. Before it, a second run in the same attempt went green in 172 of about 539 first-red attempts (32%). Same-head bounces since then: 75 cases, 62 h, median 29 min. On 11-22, 15 of 22 bounces returned with the same head.
- B hands every test-expectation and proof-command correction to A (`skills/check-issue/SKILL.md:79`). Sample of 100 handed items in 60 November reviews: 65 test expectation, 31 proof command, 3 brief or design, 1 other. 39 were one line or one path (three were a missing `./`). check.fix entered from check.repair: 466 visits, 105.6 h, plus about 27 h of B re-checks.
- `failed`: 154 visits, 140.5 h. Of these, 18 visits (11.4 h) were base red, 15 (17.1 h) had no seat report, and 2 (2.6 h) lost the seat. None of those needs an operator decision.
- check16-reads-imports was held 117.7 min on the same head because its brief named the exact `require.resolve` call that an outcome-preserving repair replaced (framework `log.jsonl:8189,8253`).
- `akrogon.slice` has `CPUWeight=20` while `app.slice` (agent harnesses, terminals, Chrome) has `CPUWeight=100`. No IOWeight on either.
- `readTimings` parses the whole 29.9 MB `timings.jsonl` at 398 ms per call, about 38 times per `next --wake`, under the global lock. `repoInventory` walks 1,097 closed and 19 open leaves at 146 ms per call, 25+ times per wake, and on every `run-check`.
- Every verify makes a fresh worktree with a full `bun install --backend=copyfile` (1.9 GB `node_modules`; 34 GB across 17 worktrees). `setup` exited non-zero 2 times in 3,339 runs. 6% of recent framework commits touch `package.json` or `bun.lock`.
- 91 base comparison runs took 7.2 h, each running the full `merge_checks` on main.
- 145 of 171 loaded user slices are `akrogon-test-*.slice`. Akrogon suite processes from finished test runs were still alive after 30+ minutes in `app.slice`.
- The ledgers record no gate outcome and no failure cause in a field a script can read. The cause of a bounce lives only in `review-B.md` prose.

## Location

- `src/land.ts:79-95,179-229` (red exit, no in-run rerun); `src/verify.ts:341-377` (failing unit names, `:370` nameless failures return undefined), `:200-208,696-758` (receipts and per-command reuse), `:678-687,847` (verify worktree setup and removal), `:1114-1116` (base comparison)
- `skills/check-issue/SKILL.md:79,103-107`; `skills/implement-issue/SKILL.md:36`; `src/phase.ts:238-251,427-430,466-471,640-667`
- `src/next.ts` (wake pass, `readTimings` and `discover` calls, global lock at `:1416`), `src/timing.ts:96-128`, `src/state.ts` (`repoInventory`), `src/run-check.ts:171`
- `src/admission.ts:244-257`; systemd `akrogon.slice`; `tests/run-units.test.ts:48`; `src/reconcile.ts:367-386,1297`
- `src/config.ts:53` (`fix_rounds`, read but never enforced); `src/log.ts:34-64`
- Read in the installed release, not diffed against the akrogon checkout by the watch.

## Reproduction

Run framework with `max_active` 9-12 for a day. Merge holds most leaf time, red lands bounce to check.repair with unchanged heads, and B's lists route one-line test and proof-path fixes back to A. Frequency: daily. Figures above.

## Expected behavior

A leaf spends its time in seat work, not in queue waits, repair hand-offs or operator waits with nothing to decide. A land run fails only for the code under test, and the host is not overloaded. Not provided beyond that.

## Urgency

High. On 2026-11-22, 12 of 13 framework lands went red and the repo was paused twice. Workaround: operator pauses, manual recovery of failed leaves, a lower `max_active`.

## Suspected cause

- Main: the merge lane is serial and loses whole turns to red runs that are mostly not leaf defects, and since 66f90be9 no rerun happens inside the land run.
- Contributing: review rules route mechanical test and proof fixes through an extra A round. `failed` has no automatic exit for causes needing no decision. Land tests get a low CPU share against the agents. Bookkeeping reads grow linearly with history.
- Whose view: agent (watch and three consultants). Spot-checked: the cgroup weights, the leaked test slices and the merge and lifecycle figures.
- Not measured: what share of B's first-round Fix findings are product defects versus record gaps (70% of first rounds go to repair), and whether A's first-round review adds findings B lacks.
- Related reports: #147 (open, land-red ownership and run admission), #148 (open, temp placement), #145 (closed, keep red run temp), #81 and #83 (closed, locked mechanisms), #142 (closed, trailer parser). Searched Tamdoma/akrogon all states for "rerun failing units", "test expectation", "readTimings", "CPUWeight", plus the account's issues since 2026-11-20.

## Proposed, not decided (framework watch with Claude Fable, agy and codex, 2026-11-22)

Ranked by measured cost. Each item names the smallest change that removes the class.

- P1. Rerun only the failing units once inside the land run before exiting. Green lands the leaf, and a red on the same unit exits as today. For nameless failures, use the test file name. This restores the 32% in-attempt save that disappeared with 66f90be9.
- P3. B repairs test-expectation and proof-command items itself, with the `Test-Change:` trailer and red and green runs in its record. Hand-off to A stays for brief or design changes, new live actions and model choices. Evidence: when A did these fixes, its repair added a new defect in 6 of 60 re-checks, and B's own product-code repairs already go to merge with no second reader. This changes a review rule and needs the operator's decision.
- P5. Give merge verify a higher CPU and IO share than leaf checks and agent harnesses (a dedicated sub-slice, and an akrogon.slice weight that is not 5x below app.slice).
- P6. Shard `merge_checks` into a few named lanes. Reuse green lanes per command on the same tree, retry only the failed lane, and run base comparisons only for the failing lanes. This needs a framework config split too.
- P7. Leave `failed` automatically when no decision is needed: return to merge once main moves past a base-red commit, and restart a phase once with a fresh seat after no report or a lost seat.
- P8. A brief or design locks behavior, compatibility, security and grants. An exact mechanism binds only when the operator requires it and says why. A reviewed, outcome-preserving mechanism replacement needs no new approval.
- P9. Cache timings, log and inventory once per `next` pass, scan only `issues/open` where closed leaves are not needed, and append to `verify-runs.jsonl` instead of rewriting it.
- P10. Keep one or two warm verify worktrees per repo (detach to the sha, `git clean -fdx -e node_modules`). Rerun setup only when the lockfile hash changes.
- P11. Write each guard outcome and the reviewer's already-required failure cause (leaf, main, environment, authorization) to the event log, so a script can count gate value and leaf-caused land reds per unit.
- P12. Run akrogon test units under one parent test slice with a runtime cap and teardown, and let host reconcile stop dead `akrogon-test-*` slices.
- P13. Small items: scope frozen-path Test-Change citations to paths still changed against the merge base; enforce or delete `fix_rounds`; state each skill rule once (the run-check recovery paragraph appears four times, fetch and rebase five); lighter run-check wrapper spawns and offset reads in `waitPass`; one shared `/proc` snapshot per reconcile pass; skip the `buildStack` worktree when no rebase is needed.
- P14. After P1-P6 make lands reliably green, verify two or three waiting leaves stacked and push all on green, falling back to one leaf on red.
- Dropped after checking: re-running `cheap` on already-verified trees (the reviewer measured 0.65 h of exact duplicate greens). Dropping A's first-round review is not proposed until the A/B overlap is measured.

## Source: Tamdoma/akrogon#150

# watch-live standin cell red on base: timer never sends due=3 behind the due=2 hold (head and base both fail)

Source: Tamdoma/akrogon#150
URL: https://github.com/Tamdoma/akrogon/issues/150

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

`watch standin cell: criteria 1-9 and 12 end to end` in `tests/e2e/watch-live.e2e.ts` fails: the
standin watcher never receives the `due=3` tick line. The timer screen shows `due=2` held
behind a busy watcher (`hold due=2: watcher working`), then `due=4` onward sent; `due=3 sent`
never appears, so `sentTurn(tier, timer, 3, ...)` throws after its window. The free standin
cell otherwise runs end to end — this is a tick-drop flake/bug in the cell or the timer
script, not an environment problem.

## Location

`tests/e2e/watch-live.e2e.ts` (test 'watch standin cell', `sentTurn` helper at line ~263 and
the held-tick block near line 836), exercised with
`AKROGON_E2E=watch-live AKROGON_E2E_KIND=standin AKROGON_E2E_SHAPE=root WATCH_TICK_SECONDS=10
bun test ./tests/e2e/watch-live.e2e.ts --test-name-pattern 'standin'`.

## Reproduction

Seen on head `f3181752` (leaf `ai-budgets/budget-rules` implement pass) and on base
`d8957dad` (AKROGON_BASE) in a detached worktree: three consecutive runs, all red with the
same `due=3` gap. Failing excerpt (head run): `hold due=2: watcher working` then
`due=4 sent` … `due=13 sent`, no `due=3 sent`; error `timer screen has no due=3 sent line`.

Kept logs (leaf `issues/open/ai-budgets/budget-rules/implementation/`):
- head run 1: `check-c4-wlive-standin-root-1795366960312-449033.log`
- head retry (same command, same result): `check-c4-wlive-standin-root-r2-1795367111823-660859.log`
- base run at `d8957dad` (same result): `check-c4-standin-base-1795367369277-1123062.log`

## Expected behavior

The held tick runs once after the busy check and `due=3` is sent exactly once, or the cell's
wait matches the timer's drop behavior. On the failing path the run shows one of: `due=3
dropped` or `due=3 sent` — the screen showed neither.

## Urgency

Blocks any leaf that needs a green watch-live standin cell as criterion proof on this base.
Workaround: none known; the same command is red on head and base.

## Suspected cause

`timer.ts` drops or skips the `due=3` tick while the `due=2` hold is still resolving — the
hold screen shows `due=2` still working when `due=3` is due, and no drop line is emitted, so
the tick may be lost silently rather than reported. No supported hypothesis beyond that;
`tests/e2e/watch-live.e2e.ts` and `skills/watch-issues/scripts/timer.ts` read. Agent view.
Related reports: none found (searched Tamdoma/akrogon open issues for "watch-live",
"standin").

## Source: Tamdoma/akrogon#151

# Host reconcile stops other akrogon homes' empty leaf slices on a shared user systemd, killing seats that just joined them (seen as a seat cgroup ENOENT in verify)

Source: Tamdoma/akrogon#151
URL: https://github.com/Tamdoma/akrogon/issues/151

Origin repo: Tamdoma/akrogon

Unverified intake.

## Observation

During the 2026-11-22 repo-caps landing verify, the test "a wake after tab loss re-dispatches seats into the same slice and the next pass keeps it" failed with a dispatch error for leaf `lost-tab`: `ENOENT: no such file or directory, open '/proc/<pid>/cgroup'`, read at `src/seat.ts:333` right after the seat started. It passes alone.

The user journal from that run shows the wake seat for `lost-tab` (slice `akrogon-l715c9dae38b1`) started at 17:46:37.106, stopped at .109, and its slice removed at .118. Around it were runs of slice removals in sorted hash order, the order the host step walks.

The test's stand-in seat never exits on its own (`tests/stand-in.sh:62` loops on stdin), so something outside the test stopped the slice.

A second, unexplained failure in the same suite fits the same pattern, though unproven: in `tests/door-reset.test.ts` "agy: the reset helper runs its stages in order …", the helper was killed by a signal right after logging `started`. A SIGKILL after `started` reproduces that exact failure. No sender was found in 60+ loaded runs.

## Location

akrogon host reconcile in a `next` pass: `src/reconcile.ts` around 1297-1368 (the loop over loaded `akrogon-l*.slice` units). Seen through `akrogon verify` (full suite, `bun test --parallel=4 --no-isolate`) on a host where the operator's live akrogon also runs.

## Reproduction

Intermittent. One failure in today's verify runs (land-reds/repo-caps). Reproduced on purpose, 3 of 10 runs: during the wake, a temporary loop stopped the lost-tab slice as soon as it was empty, 0-0.3 s in. Another reproduction: a real `leaf-slices` pass with an empty foreign slice loaded stopped that slice 3 of 3 times.

## Expected behavior

A `next` pass's host step stops only the leaf slices of its own akrogon home. Seats of other homes on the same user systemd (test homes, a second install) are never stopped.

## Urgency

High for landings. Any verify running while the operator's live akrogon wakes (every agent turn end) can lose a seat mid-test, and that red costs a retry or a repair round. The same applies between test files: `tests/leaf-slices.test.ts` runs 4 real `next --all` passes against the real systemctl.

Partial workaround on branch test-races (not yet landed): a test-only systemctl wrapper limits `leaf-slices` passes to their own case's slices. It cannot stop the live install from doing the same thing.

Related ordering risk: Tamdoma/akrogon#149 P12 proposes letting host reconcile stop dead `akrogon-test-*` slices too, which widens what one home stops on the shared manager.

## Suspected cause

The slice names are global, so ownership is decided only by matching this home's own leaves. `leafSlice` (`src/scope.ts:7-8`) names a slice `akrogon-l` plus `sha256("<repo name>/<slug>")[:12]`, with nothing identifying the akrogon home. The host step (`src/reconcile.ts:1322-1368`) walks every loaded `akrogon-l*.slice` on the user manager. A slice that matches none of its own home's leaves is kept only when it is in `badSlices`, is the process's own slice (`ownSlices`, `src/scope.ts:105`), the leaf inventory had errors, there is a live run record of this home (`liveRuns`), or the slice holds a process (`sliceHasProcess`, `src/reconcile.ts:181`). Otherwise `stopSlice` (`src/reconcile.ts:222-227`) stops it.

The process check and the stop are separate steps. `stopSlice` holds `withAdmissionLock`, which is per `AKROGON_HOME` (`src/admission.ts:51`), so another home starting a seat into that slice between check and stop is not excluded. Contributing condition: a slice is briefly empty when a seat is replaced (closeTab empties it, then the wake seat joins), which is exactly the window seen in the journal.

The other home in today's failure was another test file's home (`tests/leaf-slices.test.ts`, real `next --all` at lines 352, 373, 410, 885). The live install doing the same thing is inferred from the same code path, not observed in a log.

Whose view: agent (A of the test-races direct chart, from a subagent's journal reading and reproductions).

Files read: `src/reconcile.ts` 181-228 and 1297-1368, `src/scope.ts` 7-8 and 105-109, `src/admission.ts:51`, `src/seat.ts:333`, `tests/leaf-slices.test.ts`, `tests/stand-in.sh:62`.

Not inspected / would disprove: no journal capture of the live install stopping a test slice. A journal showing the live install's `next` stopping an `akrogon-l*` slice of a running verify home would confirm the live case. The door-reset helper's slice membership was not checked, so its link to this is unverified.

Related reports: Tamdoma/akrogon#149 (P12 widens host stops to `akrogon-test-*`; same host step), Tamdoma/akrogon#137 (closed, different: repeated seat starts after reboot). Searched Tamdoma/akrogon, all states, "slice stop seat" and "leaf slice reconcile" (limit 10), plus own reports since 2026-11-20.

## Source: operator /chart-issues 2026-11-22T17:54Z

Okay, I just pulled all the issues. Look at all the ones you want to chart and see if there are any new ones. We need to be very careful about this one because this is. We must optimize the framework to work as optimally as it can on any PC. You will use slot B consultant, which is Fable 5.2 high effort, and you will use slot C consultant, which is AGY neon high. You already have them turned on, so you don't have to open them. Find all the issues, consolidate them into the categories, and start charting them out. After you chart them out, you will execute them yourself, and you will have slot D, which will be GPT 6.2 Sol as the reviewer. It's very important to think about this and also tell this to consultants from a systems thinker perspective. See if these are good recommendations, and also take a look at if there are any other optimizations we can do. Look at the entire history of the past two months when building Akrogon. See all of the stuff where we reverted the decisions that brought them back and then reverted them back to the old decision. The intent is always to have the most elegant, minimalist framework that doesn't have too many moving parts, where the merges are really fast and efficient and predictable, and where the money spent on LLMs is optimized. Spend some time on this when charting because this is really important. Akrogon is the basis for everything we do. Even if some parts are architecturally not good enough, you can ask the consultants if they would do it differently. Everything is open if it moves the needle faster, more efficient, better quality with less errors and mistakes. Do this on full autopilot mode, but keep me informed by drawing mental model diagrams on what will be done and why. Don't presume any knowledge on my end, use elid mode.

## Agent findings

- Decision sections in #148 and #149 count: author ivanjuras, permission admin, lastEditedAt null, 0 body edits, pull 2026-11-22T17:54:08Z. Taken at import as forks/seed-148-decision.md and forks/seed-149-decision.md.
- #149 decision puts #147 work and #148 temp placement out of #149's scope; #147 landed today as 61b2d50b (land holds its repo; check.repair sends only leaf-caused reds to check.fix), which ruled out an in-land rerun. #149's taken decision says P1 (in-land rerun of failing units) comes first, so the decision supersedes that part of #147's design (seed decision outranks an earlier A pick; #147's no-rerun rule came from an earlier operator lock, the merge-lanes chart, read at map time).
- Landed today and relevant: repo-caps 436b5179 (per-repo max_active, capacity refill), test-races faf55ddd (one worktree lock; two test races), land-reds 61b2d50b.
- akrogon flaky (2026-11-22T17:50Z): "agy: the reset helper runs its stages in order and fresh A gets the start prompt on a new transcript" 12 failures (cause unproven; helper killed by a signal after `started`; possibly #151); "named target equivalence" cases 2-3 each; "an open episode pins the normal..." 3; "no session, several sessions..." 5 (fixed in faf55ddd); "two simultaneous base runs" 3 (fixed in faf55ddd); "dispatch never adopts another session terminal" 4. Intake candidates.
- akrogon status: no failed leaves listed for akrogon at open.
