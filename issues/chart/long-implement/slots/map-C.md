# Map C: Tamdoma/akrogon#51 (leaf phases over 2 hours)

Method: framework `issues/log.jsonl` (1243 records) joined to the pi session file named in each record, plus the 917 worker transcripts named in `subagent_wait` results. Each gap between two session events is charged to the later event (tool result = tool time, assistant message = model time, user message = waiting for a prompt). All times UTC. Scripts were scratch and are deleted.

## 1. Root cause

F1. Long phases are active work, not hangs. Time split of the 47 implement phases over 120m that have a session file (190h):

| Share | Where |
|---|---|
| 55% | A waiting on workers (`subagent_wait`) |
| 12% | A's own model time |
| 9% | A polling a long command with `sleep 200-290` |
| 10% | A parked, waiting for a prompt |
| 11% | unclassified (gaps before non-message session events: provider switch, session lead-in) |
| 3% | other shell |

F2. Workers run one at a time. 752 of 851 `subagent_wait` calls name one worker. Measured from transcript start and end times, 206 worker-hours took 189 wall-hours: mean concurrency 1.09. `implement-issue/SKILL.md:38` and `worker-protocol.md:11` allow waves of 3.

F3. Phase length is unit count times serial worker time. Spearman of implement minutes against worker spawns is 0.74 (n=244).

| Spawns | Phases | Median | Over 120m |
|---|---|---|---|
| 0-1 | 72 | 9m | 4% |
| 2-3 | 82 | 22m | 5% |
| 4-6 | 56 | 54m | 21% |
| 7-9 | 26 | 164m | 81% |
| 10+ | 8 | 265m | 88% |

Worker duration: median 8m, p90 32m, max 274m. 89% of worker time is model time (`devin/swe-2-max`, thinking high, about 0.25 min per turn). Tests, installs and builds are not the cost.

F4. The serial order is not forced by dependencies. Sub-briefs of serial leaves say "Chunks that must land first: none" (site-nav 6 of 8 briefs, concurrency 1.10. emdash-kit "no prerequisites" on most units, concurrency 1.11). The cause is the fallback "one at a time when unsure" (`SKILL.md:38`, `worker-protocol.md:11`) plus a plan that carries only an "ordered file/criterion checklist" (`plan-issue/SKILL.md:55`). The plan never states which units are independent, so A is always unsure.

F5. Counter-example on the same repo: emdash-launch ran 7 units as waves W1(3), W2(3), W3(1) in 54m of waiting (13 + 26 + 15). The 7-9 spawn median is 164m.

F6. Second archetype, A's proof tail (about 6 of 47: emdash-launch, live-replay x3, emdash-deploy-profile, satellite-review). emdash-launch workers were done at 11:46. A then spent 2h35m alone: 104m in `sleep 280; tail log` polls of a live convert, launch and three `framework:verify` runs, with 9 in-branch fixes, each followed by a full live rerun. Its check.fix repeats this: one 31m wave, then live bring-up, launch, first-boot and cron-tail reruns, and repair briefs R6, R6b, R7, R8 written 15:08-17:00.

F7. Third archetype, parked seat (10%): portal-activation 433m, manifest-lint 320m, blueprint-phase-split fix 322m (all 2026-09-12, before `--exclude-tools request_user_input`), live-replay 302m (09-29). Rare since.

F8. check.fix over 60m (9 phases, 20h): 40% workers, 28% parked, 19% model, 9% polling. Same three causes.

F9. Other repos: akrogon 0 of 83 implement phases over 120m, pi-extensions 0 of 21, clinique-la-roya 9 of 97, boulevard 2 of 15. The problem is concentrated in framework, where leaves have 7+ units.

F10. Correction to leaf-run-stalls M0 ("implement time barely tracks insertions", 50 leaves): on 244 phases Spearman against insertions is 0.79. Size in units predicts duration.

Coverage by merged leaf-run-stalls leaves:
- Addressed: red criterion outside `checks` (red-criterion 1a, 2a), provider death (10-minute retry, one rerun), late seat call after `failed`, split when a dependent consumes a part.
- Not addressed: F2-F4 serial workers (the 55%). F6 repeated full live reruns by A. The stall notice not firing under watch.

## 2. Material forks

Q1. Challenge the "no clock" lock? Recommend no.
- For: 19% of implement phases exceed 2h and nothing ends them. Four leaves waited on emdash-launch.
- Against: F1 shows about 80% of that time is a model generating or a real command running. A ceiling would kill working passes and add a rerun. The parked share (F7) is already handled by `akrogon next` re-prompting an idle seat after the 2-minute grace (`src/next.ts:194`). A clock treats the symptom of F2.

Q2. Who decides wave membership? Recommend the plan. `plan.md` groups the checklist into waves from owned paths and real prerequisites. Reason: the plan author already knows file ownership, and `plan-issue/SKILL.md:61` already says a dependency is named "only when execution actually requires ordering".

Q3. Keep "one at a time when unsure"? Recommend remove it. A unit runs alone only when the plan records a prerequisite or a shared path. Reason: the fallback is the measured cause of concurrency 1.09.

Q4. Raise wave width above 3? Recommend no change now. Reason: width 3 is unused today. Measure after Q2 and Q3 land.

Q5. Bound A's in-branch repair loop by a count (#117)? Recommend no new bound. Reason: emdash-launch's 9 fixes were 9 different defects found by the live run, so a count would fail a productive pass. `fix_rounds: 3` (`src/config.ts:33`) and red-criterion 2a already end unproductive passes. A count is not a clock, so the lock would allow it if the operator wants it.

Q6. Extend the stall notice to the watch path (#116)? Recommend no. `observeBusy` runs inside `next` (`src/next.ts:393,451,495,560`). The watch runs no `next` for a busy leaf, so `notified=` stays empty. The watch already reads every busy pane each 20-minute fire and judges it (`watch-issues/SKILL.md:40`). A desktop notice adds an operator duty, against "removed as much as possible". Lock stall-notifier-removal keeps the notifier as is.

Q7. Should a live end-to-end criterion live in its own leaf? Open, lean no. Reason: leaf-split found the four dependents need the whole live launch, so a split frees nothing. The cheaper fix is Q8.

Q8. Should A hand a slow proof to a worker and poll less? Recommend one wording change: while a proof command sized minutes or more runs, A starts every unit or repair that does not depend on its result. Reason: 104m of emdash-launch's tail was A sleeping on one command at a time.

## 3. Proposed mechanism

M1. The plan's checklist is the wave table. Three wording edits, no code, no state field, no clock.
- `plan-issue/SKILL.md:55`: replace "ordered file/criterion checklist" with a checklist grouped into waves. Each unit lists owned paths and the units that must land first. Units with disjoint paths and no prerequisite share a wave.
- `implement-issue/SKILL.md:38` and `worker-protocol.md:11`: A launches each plan wave whole, up to 3 at once, with one `subagent_wait` naming all of them. Delete "one at a time when unsure". A serial unit needs a recorded prerequisite or shared path.
- check.fix (`SKILL.md:66`): repair briefs follow the same rule. Findings with disjoint paths repair in one wave.

Expected effect: a 9-unit leaf goes from 9 serial workers (median 164m for 7-9 spawns) to 3 waves gated by the slowest worker in each. emdash-launch measured 54m for 7 units. This removes the cause of most of the 48 long phases.

Cost:
- C1. Cherry-pick conflicts when the plan's path ownership is wrong. `worker-protocol.md:27` already covers a conflicting pick.
- C2. Three workers share one provider. Rate limits or a 503 hit a whole wave. The 10-minute retry and one rerun apply per worker.
- C3. Token use per leaf is unchanged. Spend per hour rises.
- C4. It does nothing for F6 (A's live proof tail). Q8 covers part of that. The rest is real work.
- C5. Wording only, so compliance is probabilistic. Check it from the log after a week: mean worker concurrency per leaf should rise from 1.09.

## 4. Practitioner questions and pitfalls

P1. Why did A wait on one id at a time even with independent briefs? Unverified. Before handoff, read one serial session (site-nav) at the first spawn and confirm it is the skill fallback and not a limit in tamdoma-subagents.
P2. Each worker installs dependencies in its own worktree (`worker-protocol.md:11`). Three concurrent `bun install` runs share one cache. Not measured as a cost today (installs are under 1% of worker time).
P3. `subagent_wait` returns when all named workers end, so a wave lasts as long as its slowest worker. 99 of 917 workers ran over 30m and hold 85 of 206 worker-hours. Plan units should be similar in size inside a wave.
P4. `worker-protocol.md:11` cherry-picks serially and runs lane changed tests after each pick. That stays. It is minutes.
P5. Shared live fixtures (Cloudflare account, one test site) are a "shared test resource" in `brief-template.md:21`. Units sharing one must not share a wave. The plan must record it.
P6. The `sleep 280` polls use `/tmp/c8/...` and `/tmp/*-r10.log`, against the `$TMPDIR` rule (`SKILL.md:25`). Separate defect, new intake.
P7. `src/next.ts:193` `STALL_MS` and `:560` are correct as written. The seed's "no alert" is the watch path not calling `next`, not a bug in `observeBusy`.
P8. Do not judge the change by phase wall time alone. Queue and parked time (F7) would hide it. Use worker concurrency from transcripts.

## 5. Research tiers

- Operator: "I want to be removed as much as possible from the entire process." and the 10-minute idle limit (leaf-run-stalls CHART.md, provider-death.md). Both argue against a notice and for a structural fix.
- Primary code and data: every figure in section 1 comes from framework `issues/log.jsonl`, the pi session files and worker transcripts, read 2026-10-01. File:line cites are from the akrogon checkout at `2b796e9`.
- Practitioner, from prior charts: DORA "Working in small batches" and Google "Small CLs" (leaf-split.md). They support fewer units per leaf. F3 gives the local number.
- Model knowledge, no searches run: Amdahl's law (speedup is capped by the serial part, here A's proof tail in F6). Anthropic's multi-agent research write-up reports large wall-time cuts from parallel subagents at higher token spend. Unverified here.

## Bottom line

Do not add a clock. Leaves are slow because 7 or more workers run one after another when most could run three at a time. Make the plan state the waves and delete the "one at a time when unsure" fallback.
