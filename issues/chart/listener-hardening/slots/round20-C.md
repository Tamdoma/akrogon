# Round 20, slot C: cleared w- watchers keep ticking

Short answer: the premise is wrong. The old akrogon never kept a cleared watcher quiet. `/clear` has never stopped the cron job, in the herdr era or now. What is new is a second tick source, the listener wake through the `akrogon.watch` label, which added 16 ticks today on top of cron's 20.

## Q1: what the old akrogon did

Nothing. Before the hc port (`git grep -i watch 6efbd57e^ -- src`) the only `watch` in src is a file-watch field in status.ts. The old skill (`git show e82ef65a^:skills/watch-issues/SKILL.md:12-18`) is cron only: job identity is the exact prompt, "it ends only on `/watch-issues stop`, session loss or the job's own expiry", `tick` never creates a job, `stop` deletes it. No label, no wake, no target selection: the cron fires inside the watcher's own process, so nothing picked a target.

And the cleared watcher kept ticking then too. `~/.claude/projects/-home-ivan-Work-infra-tamdoma-framework/f9309d6f….jsonl` (Claude Code 2.1.310, herdr era): record 4 is the operator's `/clear` at 2026-10-27T19:00:06Z, the first scheduled tick follows at 19:05:03Z, and 228 scheduled ticks run through 2026-10-30T21:45Z with zero operator `/watch-issues` starts in the file. Same shape in `b4e9e6bf` today (clear 09:03:26Z, first cron tick 09:23:11Z, 8 ticks, no start).

## Q2: cron survives /clear, in every version here

Yes. The CronCreate store is per process: the binaries for 2.1.284, 2.1.310 and 2.1.317 all carry "in-memory only, dies when this Claude session ends" (2.1.284: "in-memory session store (session-only jobs)"), and no `scheduled_tasks.json` exists under `~/.claude` or the framework repo. `/clear` opens a new conversation in the same process, so the job lives on. Proof for t6: its claude process started 2026-11-03 13:44:32 local (`ps -o lstart`), the sessions record `~/.claude/sessions/3437925.json` names be339658 with the same `procStart`, and job `5161d1f8` first appears in `480f6019….jsonl` at 2026-11-03T12:45:42Z, the conversation that process opened with. The same job id fired after every clear since: `b4e9e6bf` (clear 09:03Z), `0c515ceb` (clear 11:59:00Z, tick 12:03:11Z), `51af12b2` (clear 12:13Z, 20 ticks), `be339658` (clear 19:02:19Z, tick 19:03:11Z). Both ticks the operator saw right after clearing today were cron, not wakes: the job fires at :03, :23, :43.

So the operator was clearing w- agents in the herdr era as well (f9309d6f, 3e5cd221 Oct 6-10) and cron kept going. w- agents existed then: those files hold hundreds of `/watch-issues tick` turns.

## Q3: the regression and the smallest change

What changed is the tick rate, not the survival. In `51af12b2` (today 12:13Z to 19:02Z): 20 cron ticks (`turnOrigin: scheduled`) plus 16 typed ticks `/watch-issues tick /home/ivan/Work/infra/tamdoma/framework` with `origin.kind: human` at 13:30, 14:52, 15:31, 15:49, 16:03, 16:14, 16:20, 16:29, 16:56, 17:01, 17:14, 17:34, 18:14, 18:17, 18:50, 19:00. Those are `wakeWatcher` sends (`src/hc.ts:570-595`) from the listener (`src/listen.ts:80-92`, every seat event), `next` busy (`src/next.ts:188`) and phase failed (`src/phase.ts:218`), aimed by the label the skill sets (SKILL.md:16) and only `stop` removes (SKILL.md:18). The label is on the hc terminal (t6 created 2026-10-30, argv `/usr/bin/bash`), so it also outlives the claude process: a new agent started in t6 would get the tick typed in. Before Nov 7 none of this existed.

Smallest change back to old behavior: delete the wake path. `wakeWatcher` and the watch lock (`src/hc.ts:570-595`), the listener wake (`src/listen.ts:78-92` and its call), `src/next.ts:188`, `src/phase.ts:218`, `watcherLine` (`src/status.ts:739-745`), and the label sentences in SKILL.md:14,16,18. Cron only, exactly as before. It does not make `/clear` stop the watch, because that never worked; the skill's stop is `/watch-issues stop` (SKILL.md:18, same in the old skill :18).

Door A's candidate (a tick that is the first prompt of its conversation deletes the job and the label): no code, but it makes `/clear` mean stop, against SKILL.md:14 "the watch never self-deletes" (ad500813 added that rule on purpose), it relies on the model judging "first prompt" (a compaction continuation also starts with one tick), and it still costs the one tick that lands after the clear. If the operator wants `/clear` to end a watch, that rule is the only place to put it. If the operator wants the old behavior, delete the wake path and type `/watch-issues stop` instead of `/clear`.
