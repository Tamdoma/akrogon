# Map B: paid-budget

Code read on main at 814a2387. (H) marks what I checked on this host on 2026-11-23. Docs, skills and tests were listed by a Haiku agent. I spot-checked the lines the pick depends on.

## Short answer

- The cap, the ledger, the lock and the `--sessions` flag all exist to count against a stored number. With no stored number, none of them has a job. Delete all four.
- A budget is then two numbers the seat passes to the test on the command line. The test enforces them. akrogon keeps nothing.
- The record for the first guess already exists: `issues/timings.jsonl` holds every past run of a check by name, with exit and duration.
- One rule line is the real change: a run stopped by its own budget is not a red, so the seat raises and reruns.

## 1. Every place, and what it becomes

Code:
- P1 `src/config.ts:31-40` `paid_budget` key: delete. See Q5 for the host file.
- P2 `src/budget.ts` whole file (cap check :56-75, ledger read :22-42, lock :55, append :76-85): delete.
- P3 `src/run-check.ts:33, :219, :243, :318, :335-336, :349-352`, `src/usage.ts:45, :66`, `src/akrogon.ts:329` (`--sessions`): delete.
- P4 `src/config.ts:133-134` (a repo config may not set `AKROGON_SESSIONS` or `AKROGON_SESSION_MINUTES`): keep. It stops a standing budget in a repo file.
- P5 `src/state-home.ts:17` `budget.jsonl` in the move list: delete. `src/AREA.md:5, :14`: change.
- P6 `tests/e2e/tier.ts:41-49` `reservedSessions(planned)`, called at `kinds.e2e.ts:92`, `watch-stop.e2e.ts:110`, `watch-consults.e2e.ts:152`, `watch-live.e2e.ts:933`: keep, comment changes (Q2). `watch-consults.e2e.ts:153-159` minute deadline: keep.

Tests:
- P7 `tests/budget.test.ts`: delete, except T16 (:574, a nested run-check inherits neither name), which stays in another file. `tests/config.test.ts:993, :1011`: delete. `:975`: keep. `tests/state-home.test.ts:116`: delete. `tests/command-reference.test.ts:32`: change.

Docs:
- P8 `docs/reference/limits.md:25`: delete. `config.md:33, :53-57`: delete. `commands.md:51`, `checks.md:50`: change. `files.md:107-112`: delete.
- P9 `docs/use/autopilot.md:21, :37`, `docs/use/plan-work.md:32` (the door's `paid_budget` needs row): delete those clauses.

Skills:
- P10 `skills/lifecycle-rules.md:7` ("Add `--sessions`", "A reservation refused for the ceiling ends the pass `failed`"): replace with the rule in section 5.
- P11 `skills/lifecycle-rules.md:9` (after a paid launch goes red, no further paid launch): keep, plus one clause (K3). `:11` "cut short by the ceiling or time limit": drop "ceiling".
- P12 `skills/check-issue/SKILL.md:31` last sentence ("outside the grant or the ceiling stays an operator blocker"): drop "or the ceiling".
- P13 `skills/check-issue/SKILL.md:69` (join to `budget.jsonl`, "A paid run with no reservation ... is a Fix"): change (R2).
- P14 `skills/implement-issue/SKILL.md:27, :52`, `skills/plan-issue/SKILL.md:31` ("launch reservations", `--sessions`): change to "budget and reason".
- P15 `skills/chart-issues/SKILL.md:12, :49, :71, :73`, `assets/autopilot.md:9` (door probe waits on the `paid_budget` row): delete. The door picks its probe's budget like a seat.
- P16 `skills/chart-issues/SKILL.md:75`, `assets/shapes.md:367, :371-372, :382` (standing grant entry cites `paid_budget`): keep the entry, change three text fields. `tests/chart-shapes.test.ts:32` still passes.
- P17 `skills/watch-issues/consultant-brief.md:27`, `docs/use/watch-while-away.md:30` ("spend past a recorded grant" as an operator stop): change (Q4).

Not a money limit, no change: worker turn budget (`skills/implement-issue/worker-protocol.md:23`), `akrogon.slice` ceilings, admission.

## 2. What a budget failure is

- K1. Today, the cap: `Missing paid_budget` (`src/budget.ts:57`) or `paid session budget: ... over the rolling 24-hour total` (:65-74). Nothing starts. Gone with P2.
- K2. The test's own count guard: `refusing paid cell: plans <p> sessions, AKROGON_SESSIONS=<n>`, exit 1, nothing launched (`tests/e2e/tier.ts:44-46`). Free. The message gives the number to use.
- K3. The test's own deadline: `watch-consults exceeded its <m>-minute session deadline`, exit 1, sessions spent (`tests/e2e/watch-consults.e2e.ts:157`). The exit code is the same as a red test. Only the log line tells them apart.
- K4. Not a budget failure: the seat's tool call times out while the run waits for admission. Run `ba0c332c` reserved 8 and launched 0 (H). With no ledger this costs nothing.
- No framework code reads either name (H). There the budget is a note. The only stops are the test's own timeouts.

Raise and rerun: the seat reads the kept log, sees K2 or K3, and runs the same command with larger numbers. No machine marker is needed, because the reader is a thinking agent and the test already names its limit. `lifecycle-rules.md:9` blocks this today, since K3 is a red. It needs the clause "a run stopped by its own budget is not a red under this paragraph".

## 3. The first guess

- `budget.jsonl` rows are `{at, repo, slug, run, sessions}` (`src/budget.ts:7-13`). No check name, no minutes, no duration, no result, no sessions used. 3 rows on this host, one leaf (H).
- `issues/timings.jsonl` `check_end` rows hold `name`, `exit`, `duration_ms`, `run`, `phase` (`src/timing.ts:55-62`). Framework history (H): `wf-rec-buffalo` green at 17.5 and 17.8 min, red at 15.8 min. `seo-rec-*` green from 4.0 to 8.2 min.
- Sessions used are recorded only by the test (`paid-sessions.json`, `watch-consults.e2e.ts:432-437`) and the seat's report.
- Smallest change: no code. One sentence in `lifecycle-rules.md`: before a paid run, `grep '"name":"<check>"' issues/timings.jsonl`, take the longest green, double it for minutes, and take sessions from the test's planned count plus spare. With no history, guess generously.

## 4. What could break

- R1. Runaway reruns. A test that hangs for a product reason looks like K3. The seat raises, it hangs again, each time paid. Brake in Q3.
- R2. Review at `check-issue/SKILL.md:69`. "No reservation is a Fix" stopped `geo-pages-own-stem`, and the repair was three reservations with 7 paid launches, $9.49 (framework `review-B.md:657`). New text: review compares sessions in the kept evidence with the budget and reason in the seat's record. A gap is a note for the next guess. Paid activity the artifacts do not explain stays a Fix, repaired in the record, never by a fresh paid run.
- R3. Old ledgers. `budget.jsonl` stays on disk and nothing parses it. Timing rows do not change, so the strict row schema (`src/timing.ts:49-62`) is not touched.
- R4. Strict machine config (`src/config.ts:23-24`). After P1, a `config.yaml` that still has `paid_budget` fails every akrogon command. This host has it at lines 46-49 (H). See Q5.
- R5. Old readiness files and closed leaves show `--sessions <n>` in commands. They are history. A replay of one fails on the unknown flag.

## 5. Shape and forks

Shape, three parts:
1. Delete P1, P2, P3, P5 and their tests and docs.
2. The seat passes the budget in the command: `akrogon run-check --name <x> -- env AKROGON_SESSIONS=<n> AKROGON_SESSION_MINUTES=<m> <test>`. Seats already pass other values this way.
3. One paragraph in `lifecycle-rules.md` replaces the reservation text: size from timings, be generous, write n, m and the reason in the record file, and on a budget stop raise and rerun with no operator.

Forks:
- Q1. How the budget reaches the test. O1 `env` in the command, akrogon holds nothing (pick). O2 keep `--sessions`, add `--session-minutes`, write both on the timing row. That marks paid runs for review, but an older build then reads the whole timings file as empty (`src/timing.ts:96-105`). O3 keep `budget.jsonl` as a record. It is a second file with no reader.
- Q2. The count guard (P6). O1 keep (pick). It fails before any spend and names the number. O2 drop the comparison. Then a too-small n goes unnoticed.
- Q3. Brake on reruns. O1 each raise at least doubles, and a second budget stop at the same point with no new evidence is a red under `lifecycle-rules.md:9` (pick). O2 no brake.
- Q4. Reach of 3b on operator grants. O1 counts and spend bounds in any grant go to the seat. Account, target and effects still need the operator, and "spend past a recorded grant" leaves the watch stop list (pick). O2 only harness-account sessions.
- Q5. The host stanza. O1 the door deletes `paid_budget` from `config.yaml` in the same step as installing the build (pick, it is N1's end). O2 accept and ignore the key for one release.
- Q6. "Nested runs". I found no money or usage limit on a nested run, only non-inheritance (P7 T16). It holds under Q1 O1, because a nested run-check builds its own environment. Pick: nothing to change. Ask the operator only if something else was meant.
