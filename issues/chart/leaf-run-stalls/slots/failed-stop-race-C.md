# failed-stop-race round, slot C (blind)

This round settles whether a seat can move a leaf out of `failed`. It matters now because red-criterion 2a makes `failed` the stop for an unmeetable criterion, and on 2026-10-01 a stop held for 0.9 seconds.

## Evidence (read 2026-10-01)

- E1. Framework `issues/log.jsonl:1203-1204`: `check.fix -> failed` slot A at 04:52:31.027Z from the watch pane session, then `failed -> check.review` slot A at 04:52:31.961Z from seat A's pi session. Line 1205: review ran again and B filed `fix` at 04:59:58Z.
- E2. `src/phase.ts:185` allows the move because `routing.failed.next` lists every active phase (`src/routing.ts:35-39`). `src/phase.ts:199` skips the slot check when the leaf is failed. `src/phase.ts:201` cannot catch it because `done` was reset on entry to failed (`src/phase.ts:98`).
- E3. Calls run under one lock (`src/phase.ts:280`). This is not a data race. Seat A acted on a phase it read minutes earlier, and the command has nothing that tells a stale intent from a recovery.
- E4. Side effect: leaving `failed` sets `fix_rounds` to 0 (`src/phase.ts:110-111`). Log 1204 shows `fix_rounds: 0`, so the leaf got a full two-seat initial review again (`src/routing.ts:43`) and a fresh repair cap. The accidental exit erased the round count too.
- E5. Every seat call in the skills carries `--slot`: plan-issue SKILL.md:43,51,63, implement-issue SKILL.md:52,60, check-issue SKILL.md:55, merge-issue SKILL.md:39. Every documented recovery has none: docs/guide/problems.md:23, cheat.md:84, phases.md:69, state.md:101, in-practice.md:67, and the watch at skills/watch-issues/SKILL.md:39.
- E6. History: 17 exits from `failed` in the framework and akrogon logs. 15 have `slot: null`. The 2 with a slot are today's race and `migrate-charts` on 2026-09-13 (framework log line 351, slot B, from a pi seat session). No skill tells a seat to leave `failed`.
- E7. `tests/phase.test.ts:1110-1128` covers recovery without `--slot`. No test covers a slot-carrying exit from `failed`.

### 1 · Should `akrogon phase` refuse a call with `--slot` when the leaf is `failed`?

A seat finishing its pass calls `akrogon phase <slug> <next> --slot A`. If the leaf was stopped a moment earlier, that call today restarts it (E1). The answer decides whether a stop holds until someone recovers it on purpose.

Research: better-than-training · `src/phase.ts:185,199,201`, `src/routing.ts:35-43`, read 2026-10-01 · the command accepts any slot's move out of `failed` and nothing distinguishes a late seat call from a recovery · shows the fix belongs in `transition`, not in a skill sentence.
Research: better-than-training · the skills and guide lines in E5, and the logs in E6 · `--slot` already separates seat calls from recovery calls in every written instruction and in 15 of 17 real recoveries · makes 1a a rule the system already follows, with no new flag.
Research: practitioner · Martin Kleppmann, "How to do distributed locking" (martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html, read 2026-10-01) · a paused client writes late without knowing its lease ended, and the fix is that the storage side rejects the stale write (fencing token) · the refusal must live in the command that owns state, not in the seat. It is also why 1b is the exact fix and 1a the cheap one.

- **1a (recommended)** One guard in `transition`: when `state.phase` is `failed` and `--slot` was given, throw with the recorded failure reason and the text "resume without --slot". The late seat call fails, the seat reports the real result in its footer, and the stop holds. Cost: one condition, one test, no skill or doc change (E5). It wins because it uses a distinction every caller already makes.
- **1b** Compare-and-set: every seat call names the phase it believes it is finishing (`--from check.fix`), and the command refuses a mismatch. This is the exact stale-write fix and also catches a stop-and-recover that happens inside one pass. Cost: a new flag, and every `akrogon phase` line in 4 skills and the guide changes.
- **1c** Skill wording only: seats re-read state before the phase call. Leaves the window open between the read and the call. Rejected by E3.
- **1d** No change, and the operator stops the seat pane before marking the leaf failed. Depends on operator order every time. The door's own v1 instruction got this wrong (fork Findings).

Pitfalls:
- 1a rests on a convention. A seat that omits `--slot` passes the guard. In single-seat phases the command infers the slot (`src/phase.ts:198`), so an omitted flag works today and nobody would notice. The skills always pass it (E5).
- 1a does not cover stop then recover inside one seat pass. Example: stopped at `check.fix`, the operator recovers to `check.fix`, and the old seat's late `check.review --slot A` is then accepted as normal. Only 1b closes that. The watch refuses to recover while a required seat is busy (watch-issues SKILL.md:39), which narrows it.
- The refused seat is left with a finished pass and a failed leaf. The error text must carry the failure reason, or the seat may retry or try the call without `--slot`.
- E4 is a separate question (should recovery reset `fix_rounds`). It is not part of this fork. Under 1a it only happens on a deliberate recovery.
- The watch recovers "failed otherwise" leaves without the operator (watch-issues SKILL.md:39). The Question says "only an operator recovery". 1a keeps the watch path. A stop the operator wants held must carry a reason the watch classes as an operator decision (watch-issues SKILL.md:38).

Probe (temp repo, no real panes, as tests/phase.test.ts does):
1. Fixture leaf at `check.fix` with a clean, non-empty worktree.
2. `akrogon phase <slug> failed --reason "operator stop" --slot A`. Expect `moved failed`.
3. `akrogon phase <slug> check.review --slot A`. Today this prints `moved check.review` (reproduces E1). Under 1a: non-zero exit, stderr names the reason, state still `failed`, `fix_rounds` unchanged, no log line.
4. `akrogon phase <slug> check.fix` with no slot. Expect `moved check.fix`.
5. Repeat step 3 with `--slot B` and with `merge --slot B --verdict ready` to show the refusal comes before the verdict rules.
Limits: the probe proves the command, not that every harness passes `--slot`.

Reply `1a`, or a free-text answer.

Challenge check
- "The convention is not an identity." True. `--slot` says what the caller claims, not who it is. 1b is stronger. I still recommend 1a because the chart's destination forbids new moving parts where one condition closes the observed case and both historic cases (E6).
- "Was migrate-charts on 2026-09-13 a legitimate seat recovery that 1a would now break?" Unknown. I did not read that leaf's history. If a seat recovery was intended there, it conflicts with the lifecycle rule that seats send no questions and a failed leaf waits for the operator.
- "Should the operator's stop itself be slot-less?" Not possible today: entering `failed` from a two-seat phase needs a valid slot (`src/phase.ts:199`). That stays as is.
- Not verified: I did not run the probe. Steps 3 and 5 are predictions from reading `transition`.
