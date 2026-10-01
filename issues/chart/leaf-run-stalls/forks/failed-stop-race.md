# A seat's late phase call undoes an operator stop

## Question
Q1. Should `akrogon phase` refuse to move a leaf out of `failed` when the call comes from a seat (carries `--slot`), so that only an operator recovery can resume it?

### Carries
- red-criterion Q2 2a relies on `failed` holding until the operator acts.
- docs/guide/problems.md:20-25: operator recovery is `akrogon phase <slug> <phase>` with no `--slot`.
- docs/guide/cheat.md:83: seats enter `failed` with `--slot A`.

## Findings
- Observed 2026-10-01 (framework issues/log.jsonl): the watch-framework pane ran `akrogon phase emdash-conversion failed ... --slot A` at 04:52:31.027Z. Seat A's in-flight check.fix pass then ran its own `phase check.review --slot A` at 04:52:31.961Z, and the command accepted it. The leaf left `failed` 0.9s after the stop, and B was dispatched to review with C1 still red.
- src/phase.ts:199 skips the required-slot check when `state.phase === 'failed'`, and `done` is reset on the move into failed, so any slot can move a failed leaf to any active phase.
- The door's v1 instruction to the watch pane wrongly assumed this call would be refused.

Exchange: blind rounds ../slots/failed-stop-race-B.md and failed-stop-race-C.md. Merged below.
- (A,B,C) Not a data race. Calls run under one lock (src/phase.ts:280). The command accepts a seat's stale finish because `routing.failed.next` lists every active phase (src/routing.ts:35-39) and phase.ts:199 skips the slot check.
- (B) Reproduced on current code in a test fixture: `phase stop-race failed --slot A --reason ...` then `phase stop-race check.review --slot A`, both exit 0, final phase check.review. Fixture removed.
- (C) The accidental exit also reset `fix_rounds` to 0 (phase.ts:110-111, log line 1204), so the leaf got a full two-seat review and a fresh repair cap.
- (A,B,C) `--slot` already separates the two callers. Every seat call in the skills carries it (plan-issue :43,51,63, implement-issue :52,60, check-issue :55, merge-issue :39,47). Every documented recovery omits it (problems.md:23, cheat.md:84, phases.md:69, state.md:101, in-practice.md:67, watch-issues SKILL.md:39), and so does every recovery test (tests/phase.test.ts:996-1038,1111-1128). (C) 15 of 17 real exits from failed had no slot. The 2 with a slot are this race and migrate-charts on 2026-09-13 (framework log line 351, seat B).
- Practitioner (C): Martin Kleppmann, "How to do distributed locking" (2016): the store that owns the state must reject a late writer, not the writer itself. This places the guard in `transition`.
- Merged recommendation (A,B,C) 1a: in `transition`, when `state.phase === 'failed'` and an explicit `--slot` is given, throw before any state, log or herdr effect. The error names the recorded failure reason and says "resume without --slot". Test `explicitSlot`, not the inferred slot. Entering `failed` with a slot stays as is. Recovery without a slot keeps its worktree checks. (B) Add one line beside recovery in problems.md and phases.md. (C) No doc change is needed.
- Alternatives rejected: 1b `--from <phase>` compare-and-set (C) is exact and also catches a stop and recover inside one seat pass, but it adds a flag and changes every skill line. Seat re-read wording leaves the window open. Operator-order rules fail, as the door's own v1 showed.
- Limits (A,B,C): `--slot` states intent, not identity. A seat that omits it passes. A stop then deliberate recovery inside one pass is not covered, and the watch refuses recovery while a seat is busy (watch-issues SKILL.md:39), which narrows that case. The `fix_rounds` reset on recovery is out of scope.
- Probe after implementation (B,C): stop, then a late `--slot` call fails with state, counters and log unchanged and no tab rename. Run it with A and B against every legal target for both blocked and attempts causes. A no-slot recovery still works. Then run `bun test tests/phase.test.ts` and the required checks.

Rebuttals (../slots/failed-stop-race-rebuttal-B.md, -C.md)
- (B) The error must not teach the seat to bypass the guard. Its wording: "Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved." (problems.md:18-25, watch-issues SKILL.md:39). Taken into 1a.
- (C R1) The watch is a second way out. It recovers a "failed otherwise" leaf without a slot once the seats are idle (watch-issues SKILL.md:39). It never recovers a reason naming a credential, permission, operator decision or external step (:38). An operator stop holds against the watch only when its reason names the operator action, which red-criterion 2a and implement-issue SKILL.md:31 already require. Limit recorded.
- (C R2, checked by A) migrate-charts 2026-09-13: seat B failed implement at 21:25:37 (log 335) and resumed it with `--slot B` at 21:46:53 (log 351), with no skill line telling a seat to do so. Under 1a that resume would need the slot-less operator form. Whether it was operator-directed is unverified.
- (B,C) One recovery line each in problems.md and phases.md. No disagreement remains.

## Taken
Q1 1a. In `transition`, when `state.phase === 'failed'` and an explicit `--slot` is given, refuse before any state, log or herdr effect with "Leaf is failed. A seat cannot resume it. Operator recovery omits --slot after the blocker is resolved." plus the recorded reason. Entering `failed` with a slot is unchanged. Recovery without a slot, by the operator or the watch (watch-issues SKILL.md:38-39), is unchanged. One recovery line each in docs/guide/problems.md and phases.md. Operator reason: "I want to be removed as much as possible from the entire process." 1a keeps the watch's slot-less recovery and adds no operator duty.
