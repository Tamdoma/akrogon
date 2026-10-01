# Proof tail: slot C blind round

Sources: emdash-launch pi session `2026-10-01T10-40-07-084Z_01a0f70c...jsonl`, `implementation/report.md`, `plan.md`, and the framework log joined to the live-replay, emdash-deploy-profile and satellite-review sessions. Times UTC. No web searches were run.

## 1. Where the tail's time goes

emdash-launch implement tail, 11:47 (last pick) to 14:21, 154m:

| Stage | Runs | Per run | Why rerun |
|---|---|---|---|
| Static bring-up | 4 (11:57, 12:00, 12:03, 12:06) | about 10m total (report.md:54) | fixture fixes between runs |
| Convert | 1 | about 15m | none |
| Gated launch | 7 | about 8m, plus 4 stranded-gate recoveries (report.md:55-56) | one defect found per run, fixed, rerun |
| First-boot | 2 | about 6m | ends `ok=false`, 6 findings |
| `framework:verify` | 3 (first start 13:41, pass 14:19) | about 12m | run 1 playwright import policy, run 2 secret-env index |

- F1. Every implement rerun followed a fix to the stage it reran. I found no re-proof of an unchanged stage in implement. The reuse rule (standing-design.md:12) was followed.
- F2. The cost is one defect per slow run. 9 fixes needed 7 launch runs and 3 verify runs. Other leaves show the same shape: live-replay ran its live script 6, 3 and 5 times over three passes (234m `failed`, 205m `failed`, 1146m), emdash-deploy-profile ran its deploy script 7 times, satellite-review ran `framework:verify` 3 times plus 3 resume scripts.
- F3. Cheap checks ran last. `framework:verify` first started at 13:41, 114m after the last pick. It needs no live result. Its two defects (commits `e945e76` and the registry fix) cost two more 12m runs at the very end.
- F4. Polling: 42 `sleep` calls, 104m in implement, and 18 calls, 56m, in check.fix. Sleep lengths are 170-290s, which suggests a tool timeout near 300s (unverified). Most of that is the command really running. The waste is the overshoot after the process ends. I could not measure it exactly. Upper estimate: half a poll (about 2.3m) per run end, about 20 run ends, so up to about 45m over both phases.
- F5. A was idle during every poll. No worker ran between 11:46 and 14:21. U8 was the only unit left and it needs the live result.
- F6. check.fix (14:32 on): one 31m wave of 3, two single workers (9m, 5m), then a new fixture `emdash-r10` at 15:32 with bring-up, convert, launch and first-boot again, then about 60m (15:58-16:56) on a Cloudflare cron tail. Bring-up and convert (about 25m) were re-proof of unchanged stages, forced because the first fixture was deleted at cleanup (plan.md B9, report.md:86-87).
- F7. A count bound does not shorten the total. live-replay ended `failed` twice and the third pass was the longest. Each failed pass restarts with the remaining defects still to find.

## 2. Questions

### Q1. What changes in A's proof loop?
- 1a (C, narrowed) Cheap first, then overlap. After the last pick A starts every `checks` command and every proof that needs no live result before or alongside the first slow run. While a slow run is in flight A starts any repair or unit that does not depend on its result. Consequence: defects that cheap checks can find surface before the slow runs, not after them.
- 1b (B) One repair and one rerun per criterion proof, then `failed`. Consequence: emdash-launch stops at launch run 2 (about 12:50) with 7 real defects unfound, and four dependents wait on a recovery.
- 1c A plan-level rehearsal: before the first live run, one local run of the same entry point across all units. Consequence: seam defects surface in seconds, but it needs a local harness that may not exist.
- 1d No change.

Recommend 1a. Reason: it is the only option backed by a measured loss (F3: 114m before the first `framework:verify`, two late reruns) and it adds no exit, count or clock.
- Expected gain on emdash-launch: about 25-35m of 154m. It does not remove F2.
- Against 1b: F7, and the 9 fixes were 9 different defects (report.md:29-33). red-criterion 2a already ends a pass whose criterion cannot pass inside the leaf.
- Against 1c: about 5 of the 9 defects look local (repo-relative handoffs, claim start path, seed path, post-close proof path, import receipt). That is my reading of commit titles, not a test. standing-design.md:10 already asks for the cheapest sufficient test. A new rule here is not proven by one leaf.
- Pitfall P1: a repair started during a slow run changes the code under proof. The run in flight then proves an old head. A must rerun every changed stage, which standing-design.md:12 already requires.
- Pitfall P2: `checks` share the worktree with the live run. A check that writes build output or `node_modules` can disturb the run. Unverified for framework.

### Q2. How does A wait on a slow command?
- 2a Wait on the process, not a fixed sleep: one blocking call that returns when the process exits or the tool limit is near, for example `timeout 280 tail --pid=$PID -f /dev/null; tail -n 8 <log>`. Consequence: A resumes within seconds of the run ending.
- 2b No change.

Recommend 2a as one sentence in implement-issue. Reason: F4, up to about 45m on this leaf, and it removes fixed sleeps without adding a clock.
- Pitfall P3: the 300s limit is inferred from sleep lengths. Confirm it in the pi bash tool before wording a number. The wording should name the behavior, not the command.
- Pitfall P4: `pgrep -f` name matching, used today, also matches the poll command itself. A recorded PID avoids that.

### Q3. Should the live fixture survive from implement into check.fix?
- 3a No change. Each pass builds and deletes its own fixture.
- 3b Keep the fixture until merge. Consequence: saves about 25m per fix round on this leaf, but the cleanup proof (B9) moves to merge and a stale fixture can hide defects.

Recommend 3a. Reason: one leaf, about 25m, and 3b changes a done-criterion's timing, which is a contract change for charting and not a skill wording.

## 3. Research

- Q1. Tier: primary data. Source: emdash-launch session, bash calls 11:47-14:21, and report.md:29-33,52-58,97-103. Finding: reruns were fix-forced (F1), cheap checks ran last (F3). Changed: narrowed my map's "start every unit" to "cheap checks first", because no unit was startable (F5).
- Q1. Tier: primary data. Source: framework `issues/log.jsonl` live-replay records 2026-09-28 and their sessions. Finding: two `failed` passes did not shorten the third (F7). Changed: firm against 1b.
- Q1. Tier: standing design. Source: `~/.claude/skills/chart-issues/assets/standing-design.md:10,12`. Finding: cheapest sufficient test and rerun-changed-stages are already rules. Changed: 1c needs no new rule.
- Q2. Tier: primary data plus model knowledge. Source: 60 `sleep` calls in the session. GNU coreutils `tail --pid` exits when the PID dies (model knowledge, not rechecked). Finding: fixed sleeps of 170-290s. Changed: added Q2, which was not in the brief.
- Q3. Tier: primary data. Source: session 15:32-16:00, plan.md "Restart boundaries" B9. Finding: bring-up and convert reran on a new fixture. Changed: recorded as 3b, not recommended.

## 4. Challenge check

- My recommendation gives about 25-35m plus up to about 45m of poll overshoot on a 154m tail. It does not get this leaf under 2 hours. The tail is mostly real discovery (F2), and wave-plan Q1 1a already accepts that.
- The overshoot figure is an estimate. If the real figure is a few minutes, Q2 is not worth a skill line.
- All of this covers about 6 of 47 long phases. If the operator wants one change only, wave-plan is the larger one and this fork can close as 1d.
- 1b would be right if the repeated defects were the same defect. Here they were not. The watch already acts on a seat that repeats one command with one result three times (watch-issues/SKILL.md:40).
