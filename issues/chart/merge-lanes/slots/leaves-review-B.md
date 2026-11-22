# Leaf drafts: slot B review

2026-11-21. Disagreements only. Code at akrogon `4f5e3fd2`. Each line gives the evidence and the fix.

## Across leaves

- L1. merge-red-exit removes the only maker of merge-scope base runs, and main-red-cover reads only those.
  - Evidence: the merge seat makes them today (`skills/merge-issue/SKILL.md` `### Shared endings`: a red with no cause in the diff "takes the retry and known-red judgment", which is `akrogon verify --known-red`). Red-exit Taken 3 bars a full suite in `check.repair`, and Taken 8, the base pass, is cut until N3. After merge-red-exit lands no step in the lifecycle writes a `compares` row at merge scope.
  - Result: a named main red sends each queued leaf to the operator-only `failed` stop, where today each lands. main-red-cover's criterion 1 then passes in tests and never fires in production.
  - Fix: hold merge-red-exit until N3 is answered. N3 is an operator-only exception to lock 5a, so A's autopilot pick cannot stand in. The other four leaves can go now. main-red-cover pays off at once while the seat path still makes base runs.
- L2. merge-red-exit needs `blocked-by: [main-red-cover]`.
  - Evidence: both own the red branch of `src/land.ts` `land` (`if (verify !== 0) return handOff(... wake: 'red')`). merge-red-exit's design says the cover "runs before this leaf's hand-off in `land`", and its criterion 8 makes the skills name "the main-red cover". Neither exists on main unless main-red-cover landed first.
  - Fix: add the entry, and name the consumed output in merge-red-exit's What: the covered-head branch in `land`.
- L3. Three designs carry a standing dissent inside the verbatim block and have no `## Held disagreements` section.
  - Rule: shapes.md `## Leaf files`, "`## Held disagreements` holds each finding against a decision that the operator kept or left unanswered", each entry opening "not a decision, the decision stands".
  - Where: merge-red-exit (B on Taken 2, push errors), main-red-cover (C on Taken 7, `flakyLines` titles), slow-alarm-baseline (C on extras Taken 2, green-only and drift check). All three are unanswered by the operator.
  - Fix: add the section to each, state "unanswered".

## merge-red-exit

- L4. No criterion proves the seat path is removed. `phaseCommand` still takes a slot's `merged` and `check.fix` for a leaf in `merge` (`src/phase.ts` `phaseCommand`, the `leaf.state.phase === 'merge' && (requested === 'merged' || requested === 'check.fix')` branch), and `routing` keeps `merge.next: ['merged', 'check.fix', 'failed']`. Criterion 4 tests only the command's own window. Fix: add "a slot-run `akrogon phase` request for `merged` or `check.fix` on a leaf in `merge` is refused". Add `phaseCommand` and `landClaim` (its stale-run message reads `owner`) to owned surfaces.
- L5. Not decided: the slot-less `akrogon phase <leaf> merged` in `merge`. It calls `batchPush` with `tested` false, and `--check` calls `batchCheck`. Fix: one `Open for the plan` line saying whether the operator form stays.
- L6. Criterion 2's "rebase conflict" has two sites and names none. One is the turn start in `mergeTurn` (`staged.ok` false or `applyTop` false, saved as `applied: true` with no `top`). The other is the restack after a refused push (`src/land.ts` `land`, `pushed.kind === 'rebase'`, today `handOff(..., {})`). Fix: name both in the criterion.
- L7. Criteria 1 to 3 say "in the same `akrogon next` pass". The exit happens inside the `akrogon land` unit, which wakes the line itself (`handOff` and `landedWake` both call `mergeWake`). Fix: "the land run's own wake starts the next holder, with no other command run".
- L8. Missing owned surfaces, each of which describes the removed path:
  - `skills/implement-issue/SKILL.md` ("A repair requested from merge starts at the rebased head recorded in `review-B.md`").
  - `skills/check-issue/SKILL.md` `## check.review` ("or the rebased head B recorded at merge"). Criterion 8 names only `## check.repair`.
  - `docs/use/merge-and-announce.md` (the `wake=red`, `wake=gate`, `wake=push` table).
  - `src/AREA.md` ("hands the attempt to B with `wake=`").
- L9. Criterion 8's proof says "existing skill-text tests in `bun test` stay green". That is a repo-health clause, and `bun test` is already a blocking check. Fix: drop the clause. Point the reading at the design's own copy of Taken 3, since the design must be self-contained.

## main-red-cover

- L10. The design adds a second reader "beside `newRedUnits`" with a different rule for when a red on main is resolved. `newRedUnits` resolves on the command passing on a later landed run. The cover also resolves when the command fails without that unit. The main-red notice and the cover can then disagree about the same unit. Fix: an `Open for the plan` line, one reader for both or a stated reason for two.
- See L1 and L2.

## flaky-merge-flips

- L11. Wrong consumer claim: `src/status.ts` does not read `akrogon flaky`. The only readers in `src/` are the `flaky` case in `src/akrogon.ts` and `src/verify.ts` importing `failedTests`. Fix: drop `src/status.ts`.
- L12. Missing owned doc: `docs/reference/checks.md` says `akrogon flaky` lists checks "that went red and then green on the same tree". Fix: add it beside `files.md` and `commands.md`.

## merge-seat-cap

- L13. Criterion 3 and the owned surfaces name init-akrogon `max_active` text that does not exist. No file under `skills/` contains `max_active`. That path came from my own waiting-seats note and is wrong. The texts that state what is counted are `docs/reference/limits.md` ("The limit counts live leaves across every registered repository"), `docs/use/run-work.md` (its `max_active` paragraph and the flowchart alt text, with `docs/pictures/dispatch-order.svg`), `docs/reference/config.md` and the `seatCommand` error. Fix: replace init-akrogon with `limits.md` and `run-work.md` in the criterion and the surfaces.
- L14. Missing owned doc: `docs/reference/files.md` lists the wait kinds ("`wait <reason>`: time spent waiting on `repo_pause`, `parked`, `prerequisite` or `merge_turn`"). Fix: add it, with `capacity`.

## slow-alarm-baseline

- L15. "The `slow` object keeps its shape" cannot hold together with "retried by the next checked run".
  - Evidence: the send test keys on `first.run` (`decideSlow` `send`), and `foldShown` reads `run.slow.first!.run` on any row whose `slow.notice` is `pending`. The run after an `accepted` close has no `first`, so a retry recorded there breaks `foldShown`. The closing row has one `notice` field, which may already hold the open notice's state.
  - Consequence: the state of the accepted notice needs its own place. `slow` is a `z.strictObject`, so a new key means a ledger holding it does not parse under an older akrogon, as `docs/reference/files.md` already says for `failures`.
  - Fix: drop the keeps-its-shape claim, and move "where the accepted notice's state is stored" to `Open for the plan`. Add `src/AREA.md` to owned surfaces. Its verify line states today's close rule and "retried by the next in-episode run".
- L16. Criterion 3 does not say whose runs. "Its last 20 eligible runs" must be the episode's own rows (`slow.first.run` equal to the episode's first run, plus the run under test). Today's `window` in `decideSlow` is the ledger's last 20. Under that reading the runs from before the jump hold the median down and the first run under the threshold closes the episode, which is the bug. Taken 2b's "tested on an eligible run" is also missing from the criterion and the What. Fix: state both.
- L17. Criterion 4 does not say how the 14 days are measured. Fix: from the first flagged run's `end` to this run's `end`, both read from the ledger, never the clock. The test then needs no time control.

## None

- ISSUE.md, every readiness.yaml, and the state drafts apart from L2.
