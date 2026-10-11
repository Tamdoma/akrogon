# Bar

## Question
Q1. What is measured (busy episode since the seat went busy, phase duration since the last phase move, or session age) and against what threshold (fixed 60 min STALL_MS, or a per-leaf estimate)? When does the notice reset (phase change, idle, session replacement)?

### Carries
- busy_since survives progress and phase moves except failed/merged (src/phase.ts:152-153); notified state is per seat letter (src/state.ts:80-81). #75 estimate line lives only in the handoff review, not leaf files.

## Findings
- (B) In #78 check.fix lasted ~4h23m (consumer log 2310-2340); busy episode, phase duration and session age differ.

- (A,B) Keep busy episode, fixed 60 min, once per seat until idle/done/no agent (src/next.ts:220-260, src/phase.ts:142-153); add phase to the notice text and label the number "busy episode", not time in phase (B R5). Rejected (A,B): phase duration, session age, per-leaf estimate, reset on phase change. Notes: slots/busy-A.md, slots/busy-B.md.

## Taken
