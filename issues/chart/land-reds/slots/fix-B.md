# Fix shape: land-reds, slot B (blind)

Short answer: load beside the land run is the akrogon cause. The nameless rule is not a cause and changing it would not have helped. The damage (failed leaves, unrelated commits) came from one check.repair bullet. Fix: one admission rule plus a text change. No change in src/verify.ts or the judgment code in src/land.ts.

## Q1 Cause and symptom

Pick: condition 2 (load) is the akrogon cause. Condition 1 is true in code and is neither cause nor fix. A third thing did the damage: the check.repair red-exit bullets have no place for a red that is neither leaf-caused nor a main red.

Evidence:
- E1 Condition 2 holds. `withAdmission` in src/admission.ts writes `state: holder.full ? 'waiting' : 'live'`. Framework `issues/config.yaml` has no `full` key (removed 2026-10-24, framework commit 22bd7438b2), so every framework run starts at once.
- E2 Other framework check runs overlapping a land window (framework `issues/timings.jsonl`, `check_end` rows without `attempt`, summed run seconds): green lands 11:24 and 12:46 had 85 s and 39 s. Red lands 13:54, 14:15, 14:30, 14:40, 15:01 had 1042, 1517, 648, 402, 358 s. `merge-attempts.jsonl` cpu stall follows: 25 on green, 40 to 69 on those reds.
- E3 The akrogon repo's own runs sat inside three of those red windows (539, 227, 333 s, each with a `test` suite) and inside neither green window.
- E4 Load is not the whole story. Reds 11:38 and 12:18 had 120 s and 147 s of overlap and cpu like a green run. Those were the leaf's own defect and the framework `renderers/1.99.9` race.
- E5 Condition 1 holds. `uncoveredMainRedUnits` in src/verify.ts returns `undefined` at the first failure that fails `named()`, and `land` calls `taken8Trigger` only when the result is defined. That is lock Taken 7 and 8 working as written.
- E6 A base pass would not have cleared these reds. Of five same-head red pairs since 11:38 (heads 6b495172, be439a84, 7f7661bf, 7e115b3a, 993c9d5b in `verify-runs.jsonl`), only 7f7661bf repeated a unit, and both repeats were nameless hook timeouts. A base pass under the same load is green or red on other random units. `knownRedReceipt` judges both `fail`, and a green base then sends the leaf to `check.fix` with "green on main" confirmed. So it costs one more suite on the line and blames the leaf harder.
- E7 The damage path is text. runner-names-unbound-route `review-B.md`: "The repeated-red rule sends the two units to Slot A even though the first pass's isolated retries passed", then commits 95cfceb3cd and c834d36321. repair-round-bound and review-capture-by-unit took `failed` for "an uncovered main test race".

Rejected: "condition 1 is the cause" (E6). "Both equally" (E5 is a lock doing its job).
Pitfall: `(unnamed)` is not always a timeout. The 15:12 `(unnamed) hooks:selftest` is an ENOENT in test setup. One cause (`renderers/1.99.9`) is stored as a named title, `(script) hooks:selftest` and `(unnamed) hooks:selftest` in three runs. No name rule can sort these.
Unasked: how much of the stall comes from seat and harness processes that never pass through `run-check`? Nothing records it. E2 and E3 cover admitted runs only.

## Q2 Load

Pick: the land run holds its repo. A run that arrives while a land run holds its repo waits until that land ends. Everything else stays as it is: runs already started finish, and the land starts at once.
- H1 `land` in src/land.ts wraps its loop in one hold from src/admission.ts: an ordinary run record (`check: 'land'`, the attempt id, not `full`) alive for the whole attempt. It covers the head run, the base pass and a restack rerun with no gap between them. Liveness and stale cleanup reuse `live` and `sweepStale`.
- H2 `AdmissionHolder` and the record gain one optional `attempt`. `checkedRun` in src/run-check.ts already has it. One predicate: a run is held back when a live hold of its repo has another attempt and an earlier `since`.
- H3 Every run that is not `nested` makes its start decision under `lineLock(repo)`, in the loop `awaitLineTurn` already has. That loop already reads `cancelled`, so `stop-run` cancels a held-back run with no new code.
- H4 The line's queue skips held-back runs. Without this a held-back `full` waiter sits ahead of the land's own `full` check and neither ever starts.

How it composes:
- `full` line: unchanged order among runs that arrived before the hold. The land's own `full` check takes its turn among them as today. In this repo (`full: [test]`) a land still queues behind suites that were already waiting.
- Nested runs: `withAdmission` returns `nested` before any wait, so a test that calls `run-check` inside an admitted run never waits. No run ever waits for a run it started.
- Seat `run-check`, leaf `akrogon verify`, `verify --holder` and chart-direct runs of the same repo: held back when they arrive during a land. That closes red-exit Taken 9's open item without framework config.
- Starvation: the `since` test bounds every wait to one land. A run that arrived before a second hold starts when the first ends.
- No deadlock: the land never waits for anyone, so no cycle can form.
- `next.ts` reads `liveRuns`, which counts waiting records, so a seat whose run-check is held back is not counted as a silent end.

Rejected:
- R1 Land waits for live runs to drain. It adds a land wait inside the line, a real deadlock (a `full` run started by a live unlisted run, which `nested` sends to its own turn), and it skews merge-slow and attempt pressure. Framework runs are short: 73 runs in 1517 s, 4 over 60 s. Add it only if reds persist.
- R2 Framework `full: [cheap, verify]` only. It works today with no code, but it also makes leaf `cheap` runs wait for each other, misses seat run-checks under other names, and every repo would need the same hand tuning. The framework dropped `full: [verify]` on 2026-10-24.
- R3 Per-check hold (each land check takes the line). The gap between two land checks lets waiting runs in.
- R4 Deriving the hold from `state.batch` plus `landAlive`. No new record, but admission would parse every leaf state and call systemctl on each poll.
- R5 cgroup weights for the land unit. The user manager delegates no io controller by default and the stall is io-heavy. Not verified on this host.
- R6 Counting merge leaves toward `max_active` again. It undoes operator pick 6a and still leaves runs beside the land.

Pitfalls:
- P1 The hold record's `unit` must not name `akrogon-land-<attempt>`. A relaunched land reuses the attempt, and `sweepStale` stops the unit of a dead record, so it would kill the live relaunch.
- P2 A held-back run can block a seat's tool call for one land (9 to 14 min in the framework). Unlisted runs never waited before. A killed waiting run is harmless and reruns.
- P3 When the hold clears, every held-back run starts within one poll and overlaps the next land's `setup`.
- P4 A hung suite now holds every run of its repo until the land dies.
- P5 A hand run in the merge holder's worktree carries the batch attempt through `leafFields` and counts as part of the land.

Unasked: should the hold be per host? E3 shows another repo's suites inside three red windows. The operator chose per repo for the `full` line on 2026-10-26. The hold's key is one filter, so I pick per repo and flag this for the operator.

## Q3 Judgment

Pick: text only, in skills/check-issue/SKILL.md `## check.repair`, the three bullets after "On a `red` merge exit". Locks 3, 7 and 8 stay.
- J1 Name the third kind. A failing unit with no cause in the leaf's diff that passes B's narrowest rerun on the leaf head is `inconsistent` (the word `skills/lifecycle-rules.md` already uses). It is neither leaf-caused nor a main red. B returns the leaf unchanged, on a repeat too.
- J2 The `check.fix` bullet applies only to a failure B judges leaf-caused. "The same unit" needs a real test title on an unchanged head. A nameless or timed-out failure is never the same unit, which is #134's finding. Today a nameless repeat goes to A with no base evidence, while Taken 3 asks for base-green evidence on a named repeat.
- J3 The `failed` main-red stop needs a unit that is red outside the land run: red on its narrow rerun on the head with no cause in the diff, or red on a base receipt. An `inconsistent` unit never takes it.
- J4 One clause: no commit for a failure with no cause in the leaf's diff goes on the leaf branch.

Limit check: an unchanged return lands nothing. The leaf still needs a green or covered land run, so no leaf adds a failure to main.

Rejected:
- Base pass on nameless repeats (the seed's reading, agy recommendation 5): E6, and it compares placeholders, which Taken 7 refuses.
- In-land rerun: breaks 5a and doubles line time under the same load.
- Seatless requeue when every failure is a timeout line: a keyword standing in for B's judgment, already rejected in Taken 3 (3 real reds requeued).
- A count of allowed returns: a count standing in for judgment.

Pitfall: J1 has no bound. A suite that flakes on a quiet line sends each leaf round again at one land plus one B turn each. `akrogon flaky` records the flips (Taken 5) and nothing notifies.
Unasked: should repeated `inconsistent` land reds raise one repo-level notice, as `merge-slow` does?

## Q4 What else

Pick:
- docs/reference/checks.md `## What runs where`: the `full` paragraph says a run never waits "for checks not on the list". Add the hold and the `waiting for <repo>/<leaf> land` line.
- skills/merge-issue/SKILL.md `## The land run`: one sentence on the hold. `### Red verify judgment inside land` is unchanged.
- src/status.ts: the run line table reads `lineRuns`, which keeps only `full` records. Include the hold and held-back runs, or the board shows nothing while seats wait.
- `stop-run`: no change. The hold's scope is empty because land runs in a service, so no seat can cancel it.
- `merge-slow` and attempt pressure: no change, because the land does not wait.

Remove: the automatic second-red trigger in the check.repair bullet (J2 replaces it). Nothing in code. `full` stays, because it still orders leaf suites among themselves.
Rejected: showing covers or pressure in status (Taken 9, still off route). Not akrogon's: the `renderers/1.99.9` race, the 19-job concurrency and hook timeout budgets belong to the framework.
Unasked: does any test quote the check.repair bullet text? I did not search.

## Tests (red before, green after)

In tests/run-permit.test.ts, with a hold kept by a helper process until a release file appears:
- T1 A run-check of the same repo that starts under a live hold prints the waiting line, starts no command, and starts once the hold record is gone. Break: remove the predicate.
- T2 A run already live when the hold starts finishes, and the hold starts at once.
- T3 With a `full` config, a check carrying the hold's attempt starts ahead of a held-back listed waiter, and the waiter starts after the hold ends. Break: remove H4, the test hangs.
- T4 A run of another repo and a run nested in an admitted run start at once under the hold.
- T5 A run that arrived before a second hold starts when the first hold ends while the second is live. Break: drop the `since` test.
- T6 `stop-run` cancels a held-back run, and a killed hold stops holding anything back.

In tests/merge-red-exit.test.ts:
- T7 During a fixture land run a leaf run-check waits, and the same-attempt relaunch is not stopped by the sweep of the first hold (P1).
No test for the skill prose. Order of work: H1 to H4 with T1 to T7 first, then J1 to J4, because the hold removes the load and the text stops the damage from the reds that remain.
