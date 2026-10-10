# red-main-hold, slot A notes (before reading B or C)

## Q1 when the hold clears
- Pick: clear when the fetched main tip changes; the next holder's normal run on the new main is the proof, and a red result there re-holds on the new sha. Operator can clear early with one explicit command. Reason: no extra gate run on the bottleneck. Cost: a flaky red on an unchanged main holds until main moves or the operator clears.
- Rejected: green proof before release (one extra full run per episode on the bottleneck; the holder rerun is that proof). Time-based clear (elapsed time says nothing about health; failed-leaf-routing and stuck-seat locks reject clocks).
- Evidence: src/next.ts:962 pause check at mergeTurn entry, the place to check the hold; src/phase.ts:644 rerun on restack. Framework 10-09: three holders red on 2ccc39534 until 264cc2f5b (#67).
- Pitfall: holder branches moved while held. Removed by checking the hold at mergeTurn entry before reconcileBatch builds a stack.

## Q2 who repairs main
- Pick: status prints "merge held: main red at <sha>, <command>, owner: operator". Small breakage: the holder's B fixes forward in its own leaf (merge-issue:55 already allows), which lands and clears. Larger: operator pushes to main or dispatches a fix leaf by explicit command, which pause semantics already allow (repo-pause Boundary).
- Rejected: auto-revert (could undo several owners' delivered work, B map P1 note). Automatic fix-leaf creation (no owner, invents work).
- Pitfall: hold with no visible owner stalls the night. Removed by the status line and the hold record naming sha and command.

## Q3 who judges the base comparison
- Pick: B judges, by the existing check-issue:61 rule (same command, args, scope, material conditions, cause not in the diff); the command owns the hold record and the skip. New ending in merge-issue:65.
- Rejected: command-only comparison (two red exits do not prove the same cause; needs declared inputs, check-reruns off route).
- Pitfall: B over-calls base red to dodge a Fix. Removed by recording both logs and the base sha in review-B.md and the hold record.

## Speed
- Removes the BASE share of bounces (9 of 34, seed classification) and the operator moves after them. Each avoided bounce saves one 11-35 min run on the bottleneck plus a check.fix round. On 10-09, 3 holders x about 12 min plus 2 failed check.fix rounds.
