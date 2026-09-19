# Implementation report: Brief 1 failed stop machinery

All 7 criteria verified by new tests under the changed-tests command. Scenarios use temp repos and real git via tests/helpers.ts. No real panes, herdr socket, or GitHub.

## Changed files and reasons

- src/state.ts: added optional strict failure object (cause, phase, slot, reason, delivery) and Failure export. Needed for typed failure records.
- src/routing.ts: added failed to next of plan.positions, plan.rebuttal, plan.synthesis, implement, check.review, check.fix, merge. Added check.fix to failed.next. Enables immediate stops and failed restart to fix.
- src/akrogon.ts: added reason option to phase verb and passed values.reason to phaseCommand. Exposes --reason flag.
- src/phase.ts: phaseCommand parses --reason, transition guards reason misuse, bypasses rebuttal check for failed, runs stop path before worktree checks, skips requireClean only for blocked restarts, records attempts failure on fix cap, commitMove writes or clears failure and clears busy fields on failed or merged. Uses reason as string in stop path because tsc does not narrow the two-check pattern; behavior matches brief.
- README.md: phase row adds [--reason <text>] and notes --reason declares a stop into failed.
- tests/command-reference.test.ts: contracts.phase adds [--reason <text>]. Keeps CLI contract in sync.
- tests/phase.test.ts: renamed failed-exits test to allow check.fix. Added 6 tests for criteria 1-6.
- tests/state.test.ts: added failure round-trip and strict-rejection test for criterion 7.

## Tests run

Command (from worktree root):
AKROGON_BASE=43ef0f7a7cb8908df33a734bbdee406b1563d408 bun test --changed="$AKROGON_BASE"

Result: 164 pass, 0 fail across 5 files.

```
tests/phase.test.ts:
(pass) failed exits by command reset attempts and allow check.fix
(pass) stop from implement on dirty worktree records blocked failure and clears busy fields
(pass) stops land in failed immediately without phase advance and validate slots
(pass) blocked restart skips clean check and removes failure while attempts restart refuses dirty
(pass) failed routing and reason misuse are guarded
(pass) merge to merged clears busy fields
(pass) fix cap records attempts failure
tests/state.test.ts:
(pass) failure record round-trips and rejects unknown keys
164 pass
0 fail
2293 expect() calls
Ran 164 tests across 5 files.
```

Typecheck: bunx tsc --noEmit exits 0.

## Known limitations

None known.

## Unverified criteria

None.
