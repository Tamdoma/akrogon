# May the watcher restart a stuck seat?

## Question
Q1 · In an unattended seat, what happens when a subagent needs a folder outside the seat's own worktree?
- A Approve by rule a worktree of the same repository (the unit worktrees akrogon creates), fail fast with the existing error otherwise, and pass the tool signal to any remaining confirm.
- B Keep asking a human, but serialize the dialogs and pass the signal.
Q2 · For hangs with no known cause, may the watcher restart a seat after a time limit?
- A No. Keep the no-clock rule, fix known hang causes at the source, and an unknown hang waits for the operator.
- B Yes. The operator-started watch may use a time limit (about 1 h without session activity), and one akrogon restart verb stops the whole seat and relaunches its phase once.

### Carries
- seat-stall-detection (2026-09-18): no clock, poll or watchdog anywhere. pi-extensions owns admission faults.
- watch-issues Never list: no killing an agent process.
- #35 operator intent: "be absent entirely, with the watcher as a full replacement".

## Findings
Full rounds: [A](../slots/restart-hung-seat-A.md), [B](../slots/restart-hung-seat-B.md), [C](../slots/restart-hung-seat-C.md), [merged](../slots/restart-hung-seat-merged.md), rebuttals [B](../slots/restart-hung-seat-rebuttal-B.md) and [C](../slots/restart-hung-seat-rebuttal-C.md).
- Cause (A,B,C): `tamdoma-subagents/tools.ts:96-98` awaits an outside-root confirm with no signal. Child cwds were sibling unit worktrees (`...-u1`). pi has one dialog slot, so parallel confirms replace each other and the lost ones never settle (B,C). Session logs show both seats ended on parallel spawns and were restarted by hand at 07:37Z (C).
- Q1-B leaves the hang: one confirm still waits for a human who is not there. It only makes esc work. (C rebuttal) B holds that unattended operation does not authorize silent approval. A and C answer with a rule limited to the same repository.
- Silence cannot prove a hang. Only a time limit catches hangs with no known cause. (B,C) The seat-stall-detection lock accepted that silent hangs stay invisible. #35 states the opposite intent.
- A restart needs more than a kill: herdr has no stop verb, pids lack birth identity, detached worker shells can outlive pi, unit worktrees keep partial work a fresh session may redo, and recovery must exclude concurrent dispatch. (B,C)
- C orders restart after the source fix because it makes akrogon a second lifecycle authority, which seat-stall-detection argued against.
- #32 and #35 are one family but need separate fixes. (B,C)
- Q1's fix lives in pi-extensions, so the handoff splits across the pi-extensions and akrogon repos.

## Taken
2026-09-28, operator: "1a, 2a"
- Q1-A: in an unattended seat, tamdoma-subagents approves by rule a child cwd that is a worktree of the same repository, fails fast with the existing error otherwise, and passes the tool signal to any remaining confirm. Reason: the seat never waits on a human it was launched without. Foreclosed: serialized dialogs that still wait (B).
- Q2-A: no time limit and no restart verb. The no-clock rule of seat-stall-detection stands. Known hang causes are fixed at their source, and an unknown hang waits for the operator. Reason: simplest, and both reported hangs are fixed at the source. Foreclosed: silence-triggered restart (B), and the watch-issues Never list stays unchanged.
- Q1 scope, operator 2026-09-28 at handoff review: "1". The rule applies in every session, attended or not. No confirm dialog remains, and no attended/unattended detection is added. Reason: nothing new to build or break, and a subagent in another repo is started from inside that repo.
