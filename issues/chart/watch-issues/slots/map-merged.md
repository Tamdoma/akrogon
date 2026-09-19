# Merged map · watch-issues

One skill file `skills/watch-issues/SKILL.md`, no core code, no installer change (`src/install.ts:11-19` discovers it). (both)

## Cases that remain
- C1 (both) leaf waiting for a pass: idle seats, phase needs dispatch, event missed or dropped (`src/next.ts:585`). Action: targeted `akrogon next <slug>`; the command rechecks done, busy, prompt grace, dependencies and slots (`:350-360, 470-478`).
- C2 (both) stale busy marker on an idle seat: same targeted `next`; observeBusy clears it (`:180-189`).
- C3 (both) failed leaf. failure-attention already notifies and renames the tab once. Recovery `akrogon phase <slug> <failure.phase>` is legal from failed with no slot (`src/routing.ts:35-39`, `src/phase.ts:200`) and resets the whole phase for both seats (`src/phase.ts:95-112`). (B) `cause: attempts` also covers fix-round exhaustion (`src/phase.ts:234-245`), so the cause enum alone never justifies recovery. (B) `cause: blocked` is a human prerequisite: notify with the required action, never recover.
- C4 (both) seat busy a long time: notify only after a bounded pane read shows the same screen across two ticks; never kill, never send keys. (B) busy age is not progress evidence; a productive child wait is left alone.
- C5 (both) dispatcher error, lock contention: record and notify; never launch a second `next` while one is in flight (R3).
- C6 (both) all scoped leaves merged: end the loop.
- (B) Delivery failures: `issues/open/seat-prompt-delivery` is handed off, not deployed; live code still loops (`src/next.ts:348-428`). The skill assumes only what the command guarantees today.
- Gone (both): questions from seats (b24717e, b35ed04), artifact-in-worktree (#18), env prompts (env-file-rule). No old workaround is copied into the skill.

## Forks
- Q1 scope (B): named run's captured leaf set vs whole repo dynamically. B recommends the captured set with targeted `next`; A had assumed repo-wide `next --all`. Merged recommendation: captured set, because `next --all` can launch leaves handed off during the absence.
- Q2 interval (both): 20 min recommended over 2 min; 36 vs 360 ticks per 12 h; overnight 33 of 36 ticks idle. Jitter for sub-hourly loops is up to half the interval (docs).
- Q3 trigger (A, research after B's map): `/loop 20m /watch-issues` is native Claude Code (scheduled-tasks.md: "You can also pass a skill as the prompt, for example `/loop 20m /review-pr 1234`"); the skill is one tick and owns no cron. B recommended the skill creating and owning a CronCreate job with recorded id. (both) Claude Code only; SKILL.md refuses to claim a watch on pi or codex; restored on `--resume`, 7-day expiry, idle-only firing.
- Q4 recovery authority (both): A: targeted `next` alone; one recovery per leaf per watch out of failed only when the cause is understood, the obstacle is gone, `failure.phase` is known and all seats quiescent; recurrence notify-only. B: notify-only for failed. (B) lead-declared `phase failed` stays outside default authority.
- Q5 stop (both): operator request, every captured leaf merged, or nothing can progress without the operator after one notification; 7-day expiry as hard cap; never auto-renew. (B) also an operator-named end time for the absence.
- Q6 record (A: tick script with snapshot diff; B: small decision ledger, no script, no diff). Merged recommendation: B's ledger; `akrogon status` plus `herdr agent list` read fresh each tick is the observation, the ledger holds cron id, scope, known anomalies, notices sent and recoveries done, so one blocker does not notify twenty times.

## Pitfalls carried
- (both) flock serializes passes (`src/next.ts:596`, `src/state.ts:126-145`); herdr calls have no deadline, so a hung herdr holds the lock: tick commands run under a Bash timeout.
- (B) refresh state before every action; an old judgment is not current after an event pass.
- (both) `unknown`/`blocked` can be the subagent signal (#21): status only together with an unchanged screen.
- (B) notification syntax `herdr notification show "<title>" --body "..." --sound request`; failure-attention owns failed notices; no tab rename from the skill.
- (B) never copy pane text that could hold credentials into the ledger.
- (B) empty issues/open is not completion; look the captured leaves up in closed.
- (both) compaction: the skill file is re-read on every fire; the ledger is the only cross-tick memory.
