# Report: cost-rules

Base `c9b619c6` (origin/main at implement start; branch already on it, no refresh needed). Head `58dd949`.

## Changes

- `652d5214` tests: reset-cancel, unreadable-record and attended docs cases (plan pass).
- `3afe5bb2` U1 (worker, cherry-picked): `peer-wait.ts` exports `claudeTranscript` (extracted from `claudeTurnOpen`, behavior unchanged); `door-reset.ts` gains `recordPath`, `operatorInputSeen` over the post-boundary byte slice, `superseded` at `wait-turn-end` and `recheck`, `record unreadable` with reason inside the child, queue-time boundary capture with `refused` stderr exit, `DOOR_RESET_BOUNDARY` env handoff to the detached child.
- `bb4a87ef` U2 (worker, cherry-picked): SKILL.md new `## Handover` section (shared trigger/steps/resume/reset-cancel/kinds), Drain move-on names it, Autopilot keeps its differences, Open records fresh-A seat+span; shapes.md Mode record gains attended entries, instructions field and pending Destination; questions.md + SKILL.md created-peer sentences state the `{"seat":"C","kind":"pi","argv":[]}` default and the batched final-shape check.
- `97f47f8e` tests: fix stale `writeSessionRecord` call (tsc error in the plan-pass commit), `Test-Change` trailer.
- `58dd949` tests: prettier wraps only, `Test-Change` trailer.

## Proofs

- C1-C4: `akrogon run-check --name merged -- bun test tests/door-reset.test.ts --timeout=30000` → 37 pass / 0 fail on `bb4a87ef`; re-green on `97f47f8e` (`check final-tests: 0`, `check-final-tests-1793012143013-2722546.log`). Planned per-criterion filters were run by workers (`check u1: 0` minus the docs case; `check u2: 0` docs case).
- C5/C6: skill-text criteria, verified by diff review of `bb4a87ef` (both created-peer paragraphs carry the C default; both final-shape paragraphs carry the batched check; `peer-create.ts` untouched).
- `akrogon verify` on `58dd949`: format/test/typecheck all green (`verify leaf 58dd949: green`, run `be596bb2`).

## Run history

- `check u1: 0 check-u1-1793012068784-2347050.log`; `check u2: 0 check-u2-1793011689502-181217.log`; `check merged: 0 check-merged-1793012110339-2564573.log`; `check final-tests: 0 check-final-tests-1793012143013-2722546.log`.
- First `akrogon verify` on `97f47f8e` ran red: `format` red (prettier drift in the test file — real defect, fixed in `58dd949`) and `test` red with 13 timeout failures while host load was ~70 (sibling leaf's D7 load experiment); retry at the same load stayed red and `--known-red` judged `fail` (head/base red sets differed). After the load cleared, `akrogon verify` on `58dd949` ran fully green. Logs: `check-test-1793012320424-2765645.log`, `check-test-retry-1793012680363-108017.log`, `check-test-1793012944676-1131545.log`, `check-test-1793013480695-3855899.log`.

## Plan deviations

- `waitTurnEnd` reuses the child's initial `agent list` as its first poll (list read moved to loop end); the timing-B tests pin input to the recheck as designed and all pass. Same observable contract, one fewer read.
- `naiveInputSeen` temporary edits from planning were reverted before the product commit, as planned.

## Known limitations

Carried from the design: input between the last check and the send is uncaught; codex mid-turn input is caught only via a later `task_started` or a role-`user` message; claude bare interrupt does not cancel; `/clear` wipes scrollback. No unverified criteria.
