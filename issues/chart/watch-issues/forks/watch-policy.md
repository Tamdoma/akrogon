# Watch policy

## Question

### Q1 · Does one `/watch-issues` invocation watch the leaves present when it starts, or every leaf in the repo including ones handed off later?
Recommended A: capture the current open leaves of the registered repo at the first fire and act only on that set with targeted `akrogon next <slug>`; a new handoff needs a new opt-in. B: whole repo dynamically with `akrogon next --all`, which can launch work the operator never saw.

### Q2 · Every 20 minutes or every 2 minutes?
Recommended A: 20 minutes (36 fires per 12 h; overnight 33 of 36 fires found nothing). B: 2 minutes (360 fires, ten times the tokens, reaction window the overnight run never needed).

### Q3 · Is the skill one tick started by the native `/loop 20m /watch-issues`, or does it create and own its own cron job?
Recommended A: one tick, scheduling by `/loop`; the first fire finds its job with CronList (exactly one job whose prompt is `/watch-issues`, otherwise notify and stop) and records the id in the ledger for the final CronDelete. B: the skill calls CronCreate itself and adds a second start/stop path.

### Q4 · May a fire recover a failed leaf on its own, or only run `next` and notify?
Recommended A: targeted `next` freely; one recovery per leaf per watch with `akrogon phase <slug> <failure.phase>` only when the recorded reason is understood, the obstacle is gone and every seat is quiescent; a human prerequisite or an unclear reason is notify-only; a second failure is notify-only. B: never leave `failed`; notify only.

### Q5 · When does the watch end?
Recommended A: every captured leaf merged, or nothing can progress without the operator after one notification, or operator cancels; the fire deletes its own job; 7-day expiry is the cap; no renewal. B: only on cancel or expiry, observing a known blocker all night.

### Q6 · Snapshot script with diffs, or a small ledger?
Recommended A: a ledger file in the lead session's scratch directory holding cron id, captured leaves, known anomalies, notices sent and recoveries done; observation is `akrogon status` plus `herdr agent list` read fresh each fire. B: a tick script that snapshots and diffs everything, as overnight.

### Carries
- Locks: no core watcher; herdr only, no webhooks; never kill a working process; never open `.env`; manual dispatch is the norm and this skill is the operator's rare opt-in exception (operator 2026-09-19).
- Related: `../../seat-prompt-delivery/forks/delivery-retry.md` (one attempt per pass; the watcher's `next` is the "next manual pass"), `../../../closed/noninteractive-leaf-execution/failure-attention/brief.md` (failed notice owner).

## Findings
See `../slots/map-merged.md` and `../slots/map-rebuttal-B.md`. Rebuttal points taken into the recommendations: screen sameness is supporting evidence only (F1); the fire must identify and delete its exact job (F2); only read-only commands run under a Bash timeout, a lifecycle mutation is never cancelled and an interrupted one is re-read before any further action (F3); `cause: blocked` marks every seat-declared stop, so notify-only for blocked is a policy choice, not a fact (F4).
- Research (better-than-training): https://code.claude.com/docs/en/scheduled-tasks.md read 2026-09-19: `/loop 20m /review-pr 1234` runs a skill on a fixed interval; jobs are session-scoped, restored on `--resume`, expire after 7 days, fire only while idle, jitter up to half the interval under an hour; skills with `disable-model-invocation: true` arrive as text and do not run. CronCreate tool schema read the same day.
- Research (better-than-training): overnight history, session 71fb72b4 scratchpad `watchdog/history.md`, 36 fires, findings at fires 1, 4 and 31.
- Research (better-than-training): `src/routing.ts:35-39`, `src/phase.ts:198-217, 234-245`, `src/next.ts:170-209, 348-428, 585-616`, `src/state.ts:126-145`, `src/install.ts:11-19`.

## Taken
2026-09-19 operator, verbatim: "1 - It should be watching everything that I start. For example, I might start a whole epic and then when the new epics start being created in tabs, it should take care of all of them. But only the things that I start. However, when I do start them they should all be watched | 2a | 3 - There should be only one skill, /watch-issues. We need to create this skill. When this skill activates, the skill also contains the scripts folder according to the naming conventions and patterns across the board that we have inside of Acrogon. Push back on this if you don't think this is a good idea. | 4 - It can restart the failed leaf as many times as necessary in order to make the work move forward. Remember the intent is to have the same thing as me. This is replacement for me at times when I'm away. The goal is not to have it active at all, because the goal is to make sure that the system works on its own, most of the time, which it already is. But sometimes I just can't afford to lose a night or lose some time. For example, if something gets blocked or it doesn't push through. In those cases I ill activate the watcher. | 5a - Basically when everything that I started is done or when I tell it to stop and that I will take over | 6a - A small notes file. Maybe that is not necessary at all because of the context compaction. I'm trying to create the least amount of movable parts and the least amount of complexity as possible. Only introduce new files and mechanisms is absolutely necessary."

Recorded (with B final check `../slots/final-check-B.md` F1-F5 taken):
- Q1: every leaf under `issues/open` of the registered repo, re-read at each fire. Handoff is an operator door, so the open tree is exactly "what I start"; leaves of an epic dispatched later are included. Repo-scoped `akrogon next --all` from the registered root is allowed. Foreclosed: a captured set, a per-run manifest.
- Q2: 20 minutes.
- Q3: one skill `skills/watch-issues/` with `SKILL.md`, `package.json`, `tsconfig.json`, `scripts/observe.ts`, `scripts/observe.test.ts` (convention `skills/broadcast-issue`). The skill owns its job: `/watch-issues` in a Claude Code lead session at the registered root creates the job when none exists for that root, prompt `/watch-issues tick <root>`; `/watch-issues tick <root>` is one check and never creates a job; `/watch-issues stop` deletes that root's job. A tick never recreates a deleted or expired job (B F5). Foreclosed: `/loop` as the documented start, a second skill.
- Q4: recovery from `failed` as many times as the work moves forward, judged from `failure.reason`, the pane and the leaf artifacts, with every required seat quiescent and the state re-read before the move (B F2). "Moves forward" is read from `issues/log.jsonl`: a recovery whose next move for that slug is back to `failed` from the same phase did not move forward; two such cycles in a row end recovery for that leaf and notify (B F1, existing record, no ledger). A human prerequisite is never recovered. Foreclosed: killing, send-keys, `phase failed` by the lead, state edits.
- Q5: stop when `issues/open` holds no leaf and the inventory was readable, or when every remaining leaf is failed on a human prerequisite whose notice was shown; a merged leaf still under open gets one `akrogon next` (completeOwner) and its error reported (B F3). Foreclosed: renewal past 7 days.
- Q6: no ledger. Session context carries recent fires; after compaction, history unknown means no recovery claim, only what `issues/log.jsonl`, `failure` records and `failure.delivery` show (B F1, F4): a human-prerequisite failure whose `delivery` is not `shown` is re-notified by the fire, one whose delivery is `shown` stays silent. Foreclosed: snapshot script, history file.
