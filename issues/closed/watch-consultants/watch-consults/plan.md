# Plan: watch-consults

Seat A synthesis, 2026-11-21. Blockers `consultant-seat` and `failed-merge-resume` are merged into this worktree. Grant: `readiness.yaml` `grants[0]` (N1+N1a), bound 6 harness sessions that receive a prompt for the leaf, watchers and consultants each counted, each ended within 15 min; trust entries, core state and session records cleaned after.

## Read-first

- `issues/open/watch-consultants/watch-consults/{brief,design}.md` — locked consult-loop items 1–11 and fix-and-config items 1, 2, 2′, 3, 3′/3″, 5, 7′, 8, 8′.
- `skills/watch-issues/SKILL.md` — Judge notify branches (the consult trigger site), Never, Invocations, Reply.
- `skills/watch-issues/scripts/{timer,stop,start,tick,observe,hc,repo}.ts`.
- `src/seat.ts` (`startWatchConsult`, `launch` — child of caller, `outlive: false`, `firstTask` proof), `src/akrogon.ts:130-160` (`seat --watch-consultant`), `src/hc.ts` (`watchConsultName`, `run` parent/outlive flags).
- `src/config.ts` (`globalSchema.slots.consultant`, `globalHome`, `within`), `src/verify.ts` (`verify --holder` → merge-scope `verifyCommands`, `runOnce` emits `.env` + setup), `src/run-check.ts` (`merge_checks` refusal, `leafTarget --holder`), `src/routing.ts`, `src/phase.ts` (`moveGuards`, `transition` — `check.review` receipt gate applies to `X → check.review`, not to `failed → check.fix`), `src/reconcile.ts` (`leafSeats` label filter), `src/next.ts` (`emitEnvFile`, `createSparseWorktree`), `src/log.ts` (cycle records), `src/notice.ts`.
- `tests/watch-timer.test.ts` (rig), `tests/hc-fixture.ts`, `tests/e2e/watch-tier.ts`, `tests/e2e/watch-live.e2e.ts`.
- `issues/chart/watch-consultants/` forks (signposts, consult-loop, fix-and-config) and `seats.yaml`.
- `learnings/LESSONS.md` relevant lines: run slow runs in the foreground (2026-11-15); run-check hides the desktop bus — pass the real bus to a launch needing a keyring (2026-11-07); keep capture evidence outside the run's TMPDIR (2026-11-15); paid-driver steps on model text need a non-empty fallback (2026-11-15); dry-run fixture steps before the paid launch (2026-11-14).

## Decisions

- D1 Case folder and signature live in `skills/watch-issues/scripts/consults.ts`, three verbs: `dir <root>` prints `<stateHome>/watch/<repo>/consults` and exits 1 with `inside the watched repo` when that path resolves under `repo.root` (answers the design's open `globalHome` question: `stateHome` = `$AKROGON_HOME` else `~/.akrogon` when it holds `config.yaml`; a `toolRoot` fallback can only happen when the machine has no state home, and the within-repo refusal then still holds); `new <root> --anchor <slug|unknown> --cause <cause|unknown> --phase <phase|unknown> --command <text|-> --leaf <slug>...` creates `<consults>/<anchor>-<seq>/`, computes the signature (base = `git rev-parse <remote>/<default_branch>` after the caller's fresh fetch; heads = `git rev-parse HEAD` in each named leaf's `state.yaml` worktree, branch ref when absent), writes `signature.json`, prints the folder; `match <root> <same flags>` recomputes the current signature and prints `open <dir>` / `closed <dir>` / `clear` — `closed` when an identical signature sits in a case whose `status` file says closed. The Judge calls `match` before starting a case and `new` after it has the root cause.
- D2 `merge_checks` outside an attempt: **existing `akrogon verify --holder <case>` from the case worktree CWD** — `verifyCaller` resolves the holder, scope is `merge`, `runOnce` builds the verify worktree, emits `.env` and runs `setup` then all checks + `merge_checks` under the existing receipt serialization. No new `src/` entry: the design's condition ("when no skill-only route runs merge_checks under the serialization") is not met. `repo.config.env` reaches the fix tree only through this path — the case worktree itself holds no `.env`; a direct reproduction of the failing command is the command itself, nothing new. This resolves the second open question with zero code.
- D3 Resume target (3′/3″): `check.fix` when `failure.phase` is `merge`, `check.repair` or `check.review`; else `failure.phase`. `failed=unknown` reads the `from` of the last `P → failed` record in `issues/log.jsonl`; none → the peers pick from the leaf's artifacts and record why, or close with signature `unknown` + one non-attention notice. The open `check.review` receipt question dissolves: `check.review` is never a target (3″), so no green receipt is needed — `failed → check.fix` has none in `transition` (verified in `src/phase.ts`: receipt gates sit on `X → check.review` and `check.repair → merge` only).
- D4 Timer verifies the consultant via `--prefix` passed by `start.ts` (resolves the third open question; the alternative, deriving it from the timer's own name, needs nothing extra either — `--prefix` is explicit and one flag).
- D5 Verified consultant = live terminal named `<prefix>-watch-consult` with labels `akrogon.watch-consult=<repo>` and `akrogon.repo=<repo>` and `parent` = the verified timer's `parent` (the watcher address) in `stop.ts`, the timer's `--watcher` in `timer.ts`. A live named terminal failing verification is `conflict`, mirroring the timer-name conflict. `stop.ts`: verified timer kill+rm first, then verified consultant kill+rm; output `stopped <timer>` then `stopped consultant <address>` only when one closed; absent consultant (and absent timer) tolerated — `stopped` alone still prints; a foreign-repo `akrogon.watch-consult=<other>` is never touched.
- D6 `timer.ts` `poll`: on each crossed boundary, `dueCount += 1`; if `dues` holds an entry with `sent === null` it is updated to the latest `dueCount`, else a new entry is pushed — the queue holds at most the sent due plus one unsent latest due. Sent-due bookkeeping (resend once, drop) is unchanged. On every self-exit (any `poll` returning `exit`), the timer sweeps its verified consultant (`hc kill` + `hc rm`, tolerating `not_found`) before printing `exited`; this covers the criterion-6 surviving-terminal shape and `watch-issues stop`/`tick stop` for free.
- D7 `SKILL.md`: Judge — the notify-only branches (human-prerequisite/defect, `failed=unknown`, recovery cap) now open one consult per root cause per consult-loop items 1–11 and fix-and-config 1/2/2′/3″/5; a new `## Consult` section carries the loop (signature gate via `consults.ts`, brief, `akrogon seat --watch-consultant --task`, turn files `turn-<n>-{watch,consultant}.md` + `hc send`, 180 s `hc wait --children any --json` loop with no give-up, silent-stop nudge then close+replace ≤1/tick, settle by smallest permitted check, end states + notices, stop-mid-case). `Never` gains `kill and remove the watch's own verified consultant` (replacing the terminal clause's scope) and `Answer a seat` reads `Answer a leaf seat`. `Invocations` records that unmatched wakes and late `<hc from>` turns are recorded and ignored. `Reply` gains the case path. New `skills/watch-issues/consultant-brief.md` is the consultant's brief template (limits: fix-and-config 1, 2′, S3 stops, never `issues/`, `.env`, `state.yaml`; return fields). `docs/use/watch-while-away.md` `## What stays yours` is rewritten: the watch consults and recovers except the listed stops.
- D8 E2e cell (criteria 1–2): watcher = `pi devin/swe-2-max low` with `--skill <leaf skill>` and the task in argv (no skill-discovery doubt); consultant = the tier `slots.consultant` recipe `agy neon high` (the N2 default the door will install); leaf seat A = `codex gpt-6.1-sol low`. Staging: `BROKEN` file committed to main; repo `checks.test` and `merge_checks.merge` both `sh -c 'test ! -f BROKEN'`; leaf seeded `phase=failed`, `failure={cause:blocked, phase:check.review, slot:A, reason:"merge verify red on main: test fails (BROKEN marker on main)"}`, worktree on `main`, `fix_rounds=1`, and `issues/log.jsonl` carrying `check.review→failed`, `failed→check.review`, `check.review→failed` (two unproductive cycles → notify-only → consult trigger). Sessions per run: 3 (watcher, consultant, resumed leaf seat); bound 6 → one full retry. `startWatchTier` gains `opts.startProofMs` (real consultant's `firstTask` needs more than the 3 s fixture default) and `opts.repoConfig` (the staged checks). The watcher's env forwards `DBUS_SESSION_BUS_ADDRESS` of the real session bus so the agy consultant keeps its keyring login inside `run-check`'s `/nonexistent` bus (lesson 2026-11-07).
- D9 `observe.ts` needs no change: `leafSeats` filters on labels `akrogon=1` + `akrogon.repo` + `akrogon.leaf=<slug>` (`src/reconcile.ts:399`); the consultant carries no `akrogon.leaf`, so nothing reaches `formatLeaf` — an unlabelled-leaf terminal is invisible, never misformatted (design's open question answered by code path, no test needed).
- D10 Model-choice lines (criterion 2 and criterion 3's choice records): no test, no text match — the cell's function checks only (files exist, signature parses, named turn files exist); the reviewing seat reads `case.md` and the turn files. Criterion 7's proof is the skill text itself, read by the reviewing seat; unproven noted in the criterion.

## File/criterion checklist — waves

Wave 1 (three units, disjoint owned paths, no shared fixture):

- **U1** `skills/watch-issues/scripts/timer.ts`, `skills/watch-issues/scripts/start.ts`, `skills/watch-issues/scripts/stop.ts`, `skills/watch-issues/scripts/hc.ts` (`isVerifiedConsultant` beside `isVerifiedTimer`), `tests/watch-timer.test.ts`. Shared test resource: `tests/hc-fixture.ts` read-only (each test own throwaway core).
- **U2** `skills/watch-issues/scripts/consults.ts`, `skills/watch-issues/scripts/consults.test.ts`.
- **U3** `skills/watch-issues/SKILL.md`, `skills/watch-issues/consultant-brief.md`, `docs/use/watch-while-away.md`.

Wave 2 (prerequisite U1–U3 landed — the cell runs the product):

- **U4** `tests/e2e/watch-tier.ts` option (already added with the tests), `tests/e2e/watch-consults.e2e.ts` (already added). The paid run itself is the criterion proof seat A executes, not a worker task — see criterion 1.

Docs affected, one line each: `skills/watch-issues/SKILL.md` (rewritten per D7), `skills/watch-issues/consultant-brief.md` (new), `docs/use/watch-while-away.md` (`## What stays yours` rewritten), `tests/AREA.md` (one line for the new e2e cell if the file lists cells — U4 checks), `skills/AREA.md` (one line if it enumerates watch-issues scripts — U3 checks; otherwise no change).

## Implementation notes

- 2026-11-22 (check.fix 2): D6 coalescing also applies on the poll that first sees the head due delivered (its turn advanced and its receipt set), not only on busy polls: boundaries passing between the last busy poll and that poll belong to the same backlog (verify run 1795335431683 sent due 5 with due 6 queued). Check: `bun test ./tests/watch-timer.test.ts --test-name-pattern 'missed while the head due'`.
- 2026-11-22 (check.repair, F1): C4 and consult-loop item 10 cap unsent dues while the watcher works. When an idle poll queues several elapsed boundaries, the next busy poll discards all but its latest unsent due and preserves the sent head.

- 2026-11-22 (check.fix, review-B Handed to A): D6 refined is corrected — brief C4 and consult-loop item 10 put no first-turn limit on "while the watcher works", and the initial `watch-issues <root>` turn can hold a consult before any due is sent (live run 1795303796269). Corrected rule: while the watcher's status is neither idle nor done, a crossed boundary updates the queue's unsent due to the latest number instead of queueing another; an idle watcher keeps per-due entries, so the resend-once-then-drop path is unchanged. The frozen `each due runs one check` busy expectation is corrected to this rule (brief C4). Check: `bun test ./tests/watch-timer.test.ts --test-name-pattern 'each due|coalesce|unreceipted|receipt without'`.
- 2026-11-22 (check.fix): D5's stop output is two lines, as fix-and-config item 8 and brief C5 state: `stopped <timer>` then, on its own line, `stopped consultant <address>`. The frozen stop case's combined-line expectation is corrected (brief C5). Check: `bun test ./tests/watch-timer.test.ts --test-name-pattern 'stop closes'`.
- 2026-11-22 (check.fix): consult-loop item 4's "wake JSON `from` field" reading — hc's wait JSON carries `from` on a `reason: message` wake (hc schema: "the sender's address (the text is already in your input)"); when the wait returns `reason: children` first, the message lands as the next input inside `<hc from="<address> <name>">`, the same hc sender record (live run watcher-screen.txt lines 8 and 17). SKILL.md names both; the sender is never taken from the message text. No locked decision changes.
- 2026-11-22 (check.fix): the attended cell checks C1/C2 outcomes by product state — the consultant terminal is removed (`hc get` not_found), the remote default branch advanced fast-forward from the staged base (`git merge-base --is-ancestor`), at least two non-attention notices, every turn file named in a send on the watcher's screen exists with one send each way, and `case.md` and `status` are captured after the case ends (`status` closed or resumed). Check: the cell under A1's run.

- 2026-11-22: Consult-loop item 7 requires stop to end the timer and consultant without a successor. Serialize the watch's existing seat launch and stop using one repo-scoped lock, and verify the pinned timer inside that lock before launching.

- 2026-11-21: D4 refined — `--prefix` is optional on `timer.ts`, not required: several frozen `watch-timer.test.ts` cases launch the timer directly without it, and a required flag exits them `bad argv`. `start.ts` always passes it; without it the exit sweep has no name to verify against and is skipped.
- 2026-11-21: D5 refined — the watcher address comes from the verified timer's `--watcher` argv value in `stop.ts` (never `timer.term.parent`: the test shim strips `HC_TERMINAL_ID`, leaving parent `null` while the argv always carries it) and from `args.watcher` in `timer.ts`.
- 2026-11-21: D6 refined — coalescing applies to dues accrued while the watcher still works its first turn behind a sent, receipted head (`watcher.turn === 0` and `rcpt >= dues[0].n`): the frozen `each due runs one check` and resend tests require dues accrued in any later shape to keep their own entries and drain. "While the watcher works" in consult-loop item 10 is the watcher's first busy turn under this reading; dues accrued during a consult on a later turn drain as their own checks — a known narrowing, recorded for review.
- 2026-11-21: D1 refined — `signature.json` `heads` values are strings; a leaf with no git worktree records `'-'` (the plan's `null` did not fit the frozen `z.record(z.string(), z.string())` schema), and no branch-ref fallback is computed. Head resolution uses `git worktree list --porcelain` (basename = slug), never a `state.yaml` walk: `tests/state-inventory.test.ts` forbids a second state reader, shown red by `verify` on `check-test`.
- 2026-11-21: the coalesce planned test's setup was non-deterministic (the hold flag raced due 1's status call); corrected to write the flag once the start check's status call ran — a planned-test expectation correction under the test rule, `Test-Change:` on the commit.
- 2026-11-21 (resumed pass, grants[1]): D8 refined under the operator's O1 (signposts N1b) — slots a/b in the cell are the tier stand-in (`fake --model work`), so a run spends 2 paid sessions (pi watcher, agy consultant) and grants[1]'s bound 4 allows two tries; the case end closes the consultant before `akrogon phase`/`akrogon next` (SKILL.md Loop end and Resume), and the cell asserts the consultant is gone when the leaf is first seen out of `failed`, then waits for the stand-in seat A. No locked decision changes: design item 8 sets no order between the close and the resume.

## Criterion proofs

### Criterion 1 (live run) and criterion 2 (choices + record)

- Boundary: the attended e2e run — a real `pi` watcher in the `akr-e2e-watch` tier meets the staged failure, starts the `agy neon` consultant via `akrogon seat --watch-consultant`, exchanges turn files over `hc send` inside its turn, receives the pushed base fix, resumes the leaf (`akrogon phase` + `akrogon next` → a codex seat A starts), writes `brief.md`/`case.md`/`signature.json`/turn files under `<AKROGON_HOME>/watch/akre2e/consults/<case>/`, notices non-attention, closes the consultant.
- Proof command: `akrogon run-check --name watch-consults -- env AKROGON_E2E=watch-consults AKROGON_E2E_ROOT=<fresh /var/tmp dir> AKROGON_E2E_OUT=<leaf>/implementation/watch-consults-e2e WATCH_TICK_SECONDS=15 bun test --timeout=720000 ./tests/e2e/watch-consults.e2e.ts` — foreground, evidence under `implementation/` outside the run TMPDIR.
- Product failure it catches: the watch keeps notify-only (no consultant), the exchange never happens, the leaf stays `failed`, or a stray attention notice/session leaks.
- Size: ~4–10 minutes green. Rerun trigger: any diff in `skills/watch-issues/` or `tests/e2e/`. Model-facing inputs: the SKILL.md text and consultant brief; recording: `AKROGON_E2E_OUT` screens + the case folder; real consumers replaying it: none — the live interaction itself is the evidence (criterion states no recording substitutes).
- Red shown at plan: `check plan-e2e-consults: 1` log `implementation/check-plan-e2e-consults-1795288434747-1007309.log` — "no consultant started" after 150 s (wait knob `AKROGON_E2E_CONSULT_WAIT_MS`), 1 paid pi session, tier absent afterward.
- Grant count: `grants[0]`, bound 6 sessions; count so far 1 (this red run's pi watcher, ~2.6 min, ended by `stopWatchTier`); unit = harness sessions that receive a prompt.
- Criterion 2 function checks live inside the same cell (signature parses, `brief.md`/`case.md`/turn files exist, consultant name/labels/parent, notices non-attention). Choices (root cause, fix, resume target, agreement) are the models' own; the reviewing seat reads `case.md` and the turn files. Unproven: choice quality on other failures.

### Criterion 3 (signature gate)

- Boundary: `consults.ts` `new`/`match`/`dir` against real git fixture state — the mechanical gate the Judge consults before opening a case.
- Proof command: `akrogon run-check --name consults -- bun test ./skills/watch-issues/scripts/consults.test.ts` (also inside `bun test scripts` via `tests/watch-issues-scripts.test.ts`).
- Catches: a changed base/HEAD/cause/phase/command wrongly reported `closed` (loop suppressed while the failure actually moved), an `unknown` anchor not matching `unknown`, or a case root written inside the repo (the forbidden record location, consult-loop item 3).
- Conditions traced: "same signature as a closed case → no consultant" — case: `match` prints `closed <dir>` (the Judge's gate input; the suppression itself is Judge text, D7/D10). "case ends on technical exhaustion/disagreement → leaf stays failed + one non-attention notice" and "operator stop → one attention notice" — skill-text outcomes (D7), read by the reviewing seat under criterion 7's pattern; no case is faked for them (a model choice, D10).
- Red shown: `check plan-consults: 1` log `implementation/check-plan-consults-1795288170678-909645.log` — all four tests exit 1, script absent.
- Size: seconds. Rerun: `consults*` diff.

### Criterion 4 (due coalescing)

- Boundary: `timer.ts` `poll` on the real-core rig; the busy watcher holds a `status` call across three boundaries.
- Proof command: `akrogon run-check --name watch-timer -- bun test --timeout=30000 ./tests/watch-timer.test.ts --test-name-pattern coalesce`.
- Catches: a burst of queued dues after a long turn (the rejected drain-every-due pitfall).
- Conditions traced: "at most one unsent due, latest boundary" — same test: `due=2`, `due=3` never sent, `due=4` sent once and receipted. "the sent due is held" — the coalescing change touches only `sent === null` entries (traced reason); the sent-due resend/drop path is already covered by this file's `unreceipted due`/`receipt without a watcher turn` tests, which rerun in the leaf's `test` check.
- Red shown: `check plan-watch-timer: 1` log `implementation/check-plan-watch-timer-1795288209570-926637.log` — `due=2` sent (all dues queued today).
- Size: ~15 s. Rerun: `timer.ts`/`tick.ts` diff.

### Criterion 5 (stop sweeps the consultant)

- Boundary: `stop.ts` on the real-core rig.
- Proof command: `akrogon run-check --name watch-timer -- bun test --timeout=30000 ./tests/watch-timer.test.ts --test-name-pattern "consultant after"`.
- Catches: a leftover consultant after stop (outlives the watch), wrong output order, a foreign-repo consultant wrongly killed.
- Conditions traced: "timer first, then consultant" — output-order assertion. "absent consultant treated as closed" — first half, plain `stopped` with no second line. "verified only" — the foreign consultant stays live; shown red by a temporary name-stem sweep that killed it (`hc get t4: not_found`), discarded: `check plan-red-violation: 1` log `implementation/check-plan-red-violation-1795288507684-1149761.log`.
- Red shown (missing behavior): same log family — `stop exit=0 .*stopped consultant` never printed.
- Size: ~25 s. Rerun: `stop.ts` diff.

### Criterion 6 (lost watcher sweeps the consultant)

- Boundary: `timer.ts` exit path on the real-core rig; the watcher terminal survives its agent via `--keep`.
- Proof command: `akrogon run-check --name watch-timer -- bun test --timeout=30000 ./tests/watch-timer.test.ts --test-name-pattern sweep`.
- Catches: an orphaned consultant terminal (paid session left running) after the watcher dies.
- Conditions traced: "kills and removes before exit" — `waitGone` on both timer and consultant. "verified only" — foreign survives (outlive-parent consultant so hc's own parent-end rule cannot do the sweep); same violation red as criterion 5.
- Red shown: `check plan-red-violation: 1` (violation) and the natural red `implementation/check-plan-watch-timer-1795288274750-960450.log` (`terminal t3 still live` — no sweep today).
- Size: ~15 s. Rerun: `timer.ts` diff.

### Criterion 7 (absent `slots.consultant`)

- Proof: `SKILL.md` Consult section, read by the reviewing seat — without the recipe the watch keeps today's notify-only outcome, sends one non-attention notice naming `slots.consultant`, and no attention notice (`seat --watch-consultant`'s existing refusal names the key; fix-and-config item 7′).
- No command; size seconds. Rerun: `SKILL.md` diff. Unproven: the absent-recipe path at runtime (the live run's config holds the recipe).

## Notes for review

- The brief's wording "a watching session … receives a base fix" is realized as the consultant pushing to the throwaway remote, as consult-loop item 1 of fix-and-config locks it (the consultant pushes, the watch observes). No conflict with the brief.
- `max_active: 2` in the tier machine config bounds concurrent leaf seats; the resumed leaf's seat A is the only one.
- The e2e cell's `AKROGON_E2E_CONSULT_WAIT_MS` knob exists so the plan-red run and slow machines can bound the no-consultant wait; the real run uses its 420 s default inside the 15-min session bound.
- Restart boundary for the slow run: the whole cell — `startWatchTier` refuses leftovers, so each attempt begins clean; `stopWatchTier` + `absent()` is the teardown and the grant's absence check.
