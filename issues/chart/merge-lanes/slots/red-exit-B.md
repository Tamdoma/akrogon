# Red exit: slot B blind notes

2026-11-21. Source at akrogon `eb4d64e9`. Ledger numbers are my own counts over framework `issues/merge-attempts.jsonl`, `verify-runs.jsonl`, `log.jsonl`, window 2026-11-14 to 11-21, read 2026-11-21. All evidence is tier `better-than-training` (inspected code, measured ledgers) unless marked `practitioner`.

One rule ties my five picks together: **no seat is ever prompted for a leaf in `merge`.** The command runs the line alone. Anything that needs a seat leaves the line first.

## Q1. Where the red leaf goes

- Pick: the command moves it `merge -> check.repair` and clears the batch record.
  - Reason: `check.repair` is already B's repair phase with exits `merge`, `check.fix`, `failed` (`src/routing.ts` `routing`). Its move to `merge` already needs a green leaf receipt (`src/phase.ts` `transition`). Its skill text already forbids `merge_checks` runs, and `run-check` refuses them (`skills/check-issue/SKILL.md` `## check.repair`; `src/run-check.ts:208-213`). The queue, the holder guard, dispatch and status need no special case, because the leaf is not in `merge`. Each failed round becomes a `log.jsonl` row, which is what lock 1a counts.
  - Cost: one new state record for why it left (`red` with run id, `gate` with refusal text, `conflict` with base), replacing `batch.wake`, `batch.red`, `batch.refusal` and `batch.owner: 'seat'`. One new entry paragraph in the check-issue repair text. A leaf receipt on return: 25.6 s median, 41 s p90 (460 leaf-scope runs).
  - Consumers that change: `src/land.ts` `land` and `handOff` (exit move replaces the seat hand-off, and records the red attempt); `src/phase.ts` `commitMove` (batch cleared on this move), `phaseCommand` (seat `merged` and `check.fix` calls from `merge` become dead); `src/next.ts` `mergeTurn` (the seat-owned branch and `dispatchMergeLeaf` go), `promptFor` (carries the exit record); `src/verify.ts` `verifyCaller` (`--attempt` loses its seat caller); `src/status.ts` (row shows `check.repair`); `src/timing-report.ts` (repair visits now include merge returns); skills `merge-issue` (red, gate and solo sections removed), `lifecycle-rules` (merge-seat rerun and known-red forms removed), `check-issue`.
- Rejected: stay in `merge` with a mark. It creates the state "in merge, not in the queue", and every consumer in the merged map must learn it.
- Rejected: straight to `check.fix`. It wakes A on every flake (43 same-tree green reruns in the window) and adds a fix round each time. Token cost grows, which breaks a hard limit.
- Evidence: the map's defects D1 (seat-run `merged` races a wake, 97 min lost) and D2 (red hand-off to a lost B seat, line stalled 2 h) both need a seat-owned batch. With this pick that state cannot exist, so both are removed, not guarded.
- Pitfalls:
  - Check-issue repair text assumes review Fixes exist. Removed by the new entry paragraph landing in the same leaf as the command change.
  - `failed-merge-resume` edits the same batch handling. Removed by building on it after it lands.
  - `timing-report` mixes review repairs and merge returns. Removed by reading `from` in `log.jsonl`, already recorded.
- Not asked: should `routing.merge.next` drop `merged` and `check.fix` for seats, leaving only the operator's `failed`? The command moves by `commitMove`, as `commandMerged` does today.

## Q2. Which hand-offs leave

- Pick: every hand-off that needs a seat leaves: red verify, gate refusal, rebase conflict, dirty worktree, and a restack that no longer fits. Push errors and refused pushes stay with the command: the holder keeps the turn, the next wake relaunches the land run (`src/next.ts` `mergeTurn` already relaunches a dead land run), the green receipt is reused for the same tree, and the operator gets a notice.
  - Reason: a gate fix and a conflict resolution both change the leaf's commits, so its retest is a new turn anyway. A push error is the line's problem, not the leaf's; ejecting the leaf would cycle the whole queue through the same error.
  - Cost: solo rebase moves from merge-issue to the repair text. A conflict leaf pays one extra mechanical rebase at its turn.
  - Consumers that change: `src/next.ts` `mergeTurn` (a failed `buildStack` or `applyTop` exits instead of dispatching `solo`); `src/land.ts` `land` (gate refusal and `rebase` exit; push error returns without a seat); `src/phase.ts` `landPush`, `restack` (unchanged results, new caller handling); skill `merge-issue` (reduced to the broadcast note or removed).
- Rejected: only red verify leaves. Solo conflict turns took 17 attempts and 5.9 lane-hours (merged map, C). It also keeps the seat-owned batch, so D1 and D2 stay.
- Evidence: gates and push total 1.8 h of 74.5 h. Attempts whose runs were all green but ended red: 1. Merged attempts with two green runs (restack after a refused push): 4.
- Pitfalls:
  - A conflict leaf sent to the back drifts further and conflicts again. Removed by Q4's kept place: its turn comes within one run of B's rebase.
  - A persistent push error relaunches land on every wake. Removed by receipt reuse (no suite reruns) and the notice.
- Not asked: gates run after the suite (`src/land.ts` `land`), so a gate refusal wastes a green run. The gates that need no receipt (`batchGuards`, `moveGuards`) could run before verify. Small today (1 attempt), free to fix.

## Q3. The off-line retest and telling a flake apart

- Pick: no retest by default. B judges from the kept log and the leaf's diff. B may reproduce with the narrowest failing command through `akrogon run-check`. Never a full suite. A flake is told apart by B's judgment.
  - Reason: receipts are keyed by tree (`src/verify.ts` `greenRun`), and main moves while the leaf is away, so an off-line full run buys nothing reusable and breaks lock 2a. B is already woken on every red today, so tokens do not grow. B's reading takes 65 s median (red run end to rerun start) and happens while the next leaf runs, so it costs the line nothing.
  - Cost: the green rerun of a flake becomes the leaf's next turn. The `inconsistent` record in `review-B.md` is written without a same-tree green run.
  - Consumers that change: skills `check-issue` and `lifecycle-rules` only. No command change beyond Q1.
- Rejected: full suite off the line. Second concurrent suite, waits on N2, receipt wasted once main moves.
- Rejected: seatless requeue for tests on the `akrogon flaky` list. Measured against the window: it would catch 11 of 43 flakes and wrongly requeue 3 real reds (1 that went to `check.fix`, 2 red twice). It saves 11 seat prompts a week and no time. It adds a second classifier in the command. It also starves its own data: `flips` matches red then green on the same tree (`src/flaky.ts` `flips`), and under 5a the green run is on a rebased tree.
- Guard against a stray full suite (where slots differed): routing already blocks the leaf's own paths. `akrogon verify` in `check.repair` is leaf scope (`src/verify.ts` `verify`), and `--attempt` needs a merge leaf holding that attempt (`verifyCaller`). The one open door is `akrogon verify --holder` from the repo checkout, which runs merge scope beside the line. An existing mechanism closes it for every caller: framework lists `verify` in `full`, and the per-repo line (`src/admission.ts` `awaitLineTurn`) makes a second suite wait. `full` accepts a `merge_checks` name (`src/config.ts:109-111`). One framework config line, no new akrogon code, removed if N2 passes.
- Evidence: after a first red, the next run on the same tree was green 43 times and red 28 times. `practitioner`: Chromium CQ retries only the failed shard and reruns failing suites without the change (https://chromium.googlesource.com/chromium/src/+/HEAD/docs/infra/cq.md, read 2026-11-21); that is the narrow form, not a full rerun.
- Pitfalls:
  - Reds that only appear under full-suite load pass a narrow rerun. Removed by Q4's bound.
  - `akrogon flaky` goes blind under 5a for the reason above. Removed by matching on leaf and unit across consecutive merge runs with no `check.fix` between, or accepted with the list marked stale. This needs a decision either way.
- Not asked: who keeps the flaky list alive once same-tree reruns stop?

## Q4. Where the leaf re-enters

- Pick: at its first-entry place on its first return, whatever path it took. From the second return on, a new stamp at the back.
  - Reason: the line runs one suite per turn whoever holds it, so place changes who waits, not how many leaves land. Lock 1a counts from first entry, so first-entry order is the fair order. Returning leaves are not worse bets: first-run green is 54% on a first entry (109 of 201), 60% on a second (24 of 40) and 43% on a third or later (3 of 7). That supports keeping the place once and not after.
  - This changes my map position (kept place only with no code change by A). The 60% figure shows a `check.fix` return is as good a bet as a fresh leaf, and one rule is simpler than two.
  - Cost: a leaf behind a returning leaf waits one more turn than under today's rule. Today a red adds the whole queue to the red leaf: 66 min at median depth 3, 200 min at p90 depth 9.
  - Consumers that change: `src/phase.ts` `commitMove` (stamp kept when the log holds exactly one earlier move into `merge`; `visitOf` in `src/timing.ts` already counts them, so no new state); `src/turn.ts` `mergeQueue` (unchanged: dependents first, then stamp; the running holder still sorts first, so it is never displaced); `src/status.ts` TURN order.
- Rejected: back of the queue. Leaves with two or more entries already run median 87 to 91 min against 63 and p90 260 to 294 (merged map). The 2026-10-05 reason was "never inserted into an already-recorded batch"; batches were removed in `6e7a33ff`.
- Rejected: first-entry place with no bound. A leaf that keeps failing takes a turn ahead of everyone each time, and third-entry odds are the worst measured.
- Rejected: kept place only with no code change by A. Two rules and a path check, with no support in the green-rate data.
- Evidence: `practitioner`, read 2026-11-21. GitLab merge trains remove a failed MR and it must be re-added (https://docs.gitlab.com/ci/pipelines/merge_trains/). Zuul drops it (https://zuul-ci.org/docs/zuul/latest/gating.html). Shopify keeps position and removes only "when the number of successive failures exceeds the failure tolerance" (https://shopify.engineering/successfully-merging-work-1000-developers). They disagree. The ones that drop to the back have authors who re-queue by hand and no metric counted from first entry.
- Pitfalls:
  - Third-entry sample is 7 attempts. Removed by re-reading the green rate by entry number a week after landing.
  - `checker-command` (11 h in merge, fix rounds 3, live 19:43Z) would still go to the back after its second return. Accepted: its odds are the lowest in the queue.
- Not asked: does lock 1a mean the average journey or the worst ones? The bound trades between them.

## Q5. A red already red on main

- Pick: the land run accepts it from the ledger in the first turn: no rerun, no new base run, no seat. Named units only.
  - Rule: a red head passes when every failing unit is a real test title and each is an unresolved red on main: a completed base run at a main commit that is the head's merge-base or its ancestor fails that unit, and no fully green run has landed on main since. `newRedUnits` already computes "unresolved" for the notice (`src/verify.ts`); `knownRedReceipt` should use the same test instead of demanding a base run linked to this head.
  - First observation per incident: when a returning leaf's run fails a named unit its previous exit run also failed, the land run itself runs the base pass in that turn, through the existing known-red branch of `verify` (`src/verify.ts` `verify`). One base suite per incident, run in the line, so never a second suite at once.
  - Reason: every leaf paid a rerun and its own base run in the 11-15 to 11-17 incident: 41 head runs and 19 base runs, about 10 h (merged map). Under this pick the first victim pays the same three suites and every later leaf pays one. It also takes B out of every covered leaf, so tokens fall. The bar is unchanged: base-red `forks/red-base-policy.md` took "known reds pass" with the accepted cost that a new break inside an already-red unit can land.
  - Without this pick, 5a is worse than today: every leaf fails, leaves and returns, and the seat's `--known-red` command is refused off the line.
  - Cost: a leaf-caused red that B misjudged as no-cause triggers one wasted base pass on its second red. Window rate: 11 red-twice attempts, 2.2 h at worst, against 21 base runs today.
  - Consumers that change: `src/verify.ts` `knownRedReceipt` (base rows matched by ancestry and unresolved state), `requireGreenReceipt` (same code, wider meaning), `newRedUnits` (shared unresolved test); `src/land.ts` `land` (red branch tries the receipt, then the base pass on a repeat unit, then exits); `src/phase.ts` `recordTested`, `batchPush` (through `requireGreenReceipt`); skills `lifecycle-rules` (merge known-red form removed, named case automatic) and `merge-issue`.
- Rejected: today's path. It needs a seat-held turn and a full base suite per leaf.
- Rejected: base pass beside the line. Second concurrent suite, waits on N2.
- Rejected: narrow base rerun by B as the evidence. New evidence type, weaker than the base-red policy's whole-command base run, and load-only reds do not reproduce narrowly.
- Rejected: treating two different leaves failing the same unit as proof. Not a run of main; a precision change.
- Evidence: all 20 first-red runs that took the known-red path in the window failed named units only, so the named-only rule would have covered every one. 20 of 21 base runs were red. The base pass ran almost every time because main's tip tree rarely holds a whole-green row.
- Pitfalls:
  - A flake caught red in a base pass becomes a cover. Removed by the unresolved test: the next fully green landing clears it, usually within one turn.
  - A nameless main red (`(script) ...`, `(unnamed)`) has no automatic cover and no seat in the line to agree it, so that leaf waits for main's repair. This is a regression from today for that case. Zero such cases took the known-red path in the window. Removed only by an operator choice (see below).
  - The seat's seed filing of a base red disappears for covered leaves. The `main red` notice from the base run stays (`src/verify.ts` `runOnce`), which is the one signal the base-red notice fork chose.
- Not asked:
  - Is automatic acceptance with no seat read wanted? The base-red policy was A's pick under autopilot, not operator words.
  - What happens to a nameless main red: wait for the repair, or a recorded B agreement the command honors for one turn?
  - Who repairs main, and how fast? The incident ran three days. Its test reads `learnings/LESSONS.md`, which doors push outside the line.
