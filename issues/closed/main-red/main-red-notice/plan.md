# Plan: main-red-notice

Debate is off (`debate: "no"`); this synthesis plans directly from brief.md, design.md and the live surfaces listed below. `blocked-by: known-red-pass` is satisfied: `--known-red`, `compares` and the linked-pair gate are landed in this worktree.

## Read-first

- `brief.md`, `design.md` under this leaf (locked call shape, incident rule)
- `src/verify.ts` — `verifyRunSchema`, `runOnce` finalize under `recordLock`, `verify()` known-red flow
- `src/flaky.ts` — `failedTests` extraction and `(no test name)`/`(log gone)` placeholders
- `src/shell.ts` — `herdr`, `herdrError`, `CommandError`, `run`
- `src/batch.ts` — `isAncestor(cwd, a, b)` (`git merge-base --is-ancestor`)
- `src/state.ts` — `withLock`
- `src/run-check.ts` — `leafTarget` (`checkout`/holder caller) for who writes which records
- `src/preflight.ts` — `trackingRef`
- `src/phase.ts` — `announceFailed` (notification parse precedent `{shown, reason}`)
- `src/next.ts` — `mergeNotice` (catch-and-warn precedent)
- `tests/verify.test.ts` (fixture patterns, `failureScript`), `tests/helpers.ts` (`fixture`, `cli`, `leaf`, `seedRun`, `fakeHerdr`, `fakeAkrogon`, `unitBin`), `tests/fake-herdr.ts` (`notification show` fake, `failNotification`, `.calls` log)
- `src/AREA.md` — verify lines to update
- `docs/reference-index.md`, `learnings/LESSONS.md` (read; no leaf-relevant open lessons)

## Decisions

- D1 — Record shape: `verifyRunSchema` gains `notice: z.string().optional()`. Only completed base-side records (with `compares`) carry it: `'pending'` (reservation), the herdr reply `reason`, or `'error'`. No field means the run never counted the unit new.
- D2 — Incident identity = `(scope, command.name, command.command, failing test name)`, all read from `issues/verify-runs.jsonl`. sha/tree are evidence only. `failedTests` placeholders count as test names like everywhere else.
- D3 — Red observations = completed records (`end` set, `setup === 0`) with `compares` whose identity command exits nonzero and `failedTests` contains the unit's test. A red observation R is unresolved while no green observation exists for it; resolved records keep their `notice` but stop covering.
- D4 — Green observations (the design's open question): identified by sha on landed main, not by record type — a completed record whose identity-matching command exits 0 and whose `sha` is an ancestor of (or equal to) `git rev-parse <trackingRef(repo)>` at scan time. This covers base-side runs, operator tip verifies and candidate/leaf runs that became main; a leaf head still on its branch is excluded because its sha is not yet on main. A red R is resolved iff some green observation G satisfies `isAncestor(repo.root, R.sha, G.sha)` — equal shas count, so a green on the red revision itself resolves. A green on an older sha never clears a newer red regardless of `end` order.
- D5 — New unit: a unit failing in the finalizing record is new when no unresolved red observation holds a covering notice. Covering = `notice` set and not `'error'`, or `notice === 'pending'` while `pid` is alive (`process.kill(pid, 0)`; EPERM counts alive) on the same `boot_id` (same file read `runOnce` uses; missing file → `''`, compared literally). A dead or foreign-boot `pending` does not cover.
- D6 — Send path in `runOnce`, only when `compares !== undefined`: inside the existing finalize `withLock` callback, after this run's record is updated, compute the new units (scan + `failedTests` + memoized `isAncestor` all inside the lock) and write `notice: 'pending'` on this record in the same locked write when the set is non-empty. After the lock releases, run the herdr call once; on success record `shown.reason`, on any thrown error (nonzero exit, absent binary, parse failure) print `notice: <error>` to stderr and record `'error'` — via a second `withLock` rewrite of this record. Nothing rethrows, so verify's exit and comparison result are unchanged.
- D7 — Call: `herdr notification show "<repo.name> main red" --body "<n> new red on main: <names>; receipt <run id>; chart a repair" --sound none`, parsed `z.object({ shown: z.boolean(), reason: z.string() })`. `n` is the new-unit count; `<names>` is the first 3 distinct test names joined `, `. Single attempt — retries belong to the next base run.
- D8 — `src/AREA.md` verify lines updated for the notice. `grep` confirms no `docs/guide` or skill file describes the notice; none is touched.
- D9 — No credentials, no new files, no new proof machinery: proofs are `bun test` cases in `tests/verify.test.ts` driving real `akrogon verify --known-red` runs in fixture repos with the existing `fakeHerdr` on PATH.

## Units and waves

### U1 — notice on fresh base red (wave 1, only unit)

Owns: `src/verify.ts`, `tests/verify.test.ts`, `src/AREA.md`.

Changes: D1–D8. `verifyRunSchema.notice`; `newRedUnits` scan + `sendMainRedNotice` helper; wiring inside `runOnce`'s finalize/`finally`; AREA line; the six tests below.

Serial assessment: one unit in the only wave → serial-solo; A implements the plan itself, no workers.

Docs: `src/AREA.md` verify lines (U1). No other agent or human doc is affected — the notice is an internal detail of `verify`'s finish path and no guide/skill page documents it.

## Criterion proofs

All proofs run the leaf's own tests: `akrogon run-check --name <label> -- bun test tests/verify.test.ts -t "<pattern>"`. `failedTests` logs for seeded records live under a leaf's `implementation/` dir so `readLog` resolves them as plain files. Size: seconds each (each `--known-red` run does two fixture checkouts of a trivial `sh check.sh`). Rerun trigger for every criterion: any change to `src/verify.ts`, `src/flaky.ts`, `tests/verify.test.ts`, `tests/helpers.ts` or `tests/fake-herdr.ts`.

1. **First uncovered base red notifies once and records the reply** — new test `a fresh red base run sends one main-red notice and records the reason`: `failureScript('alpha')` on main tip `s1`; leaf `caller` worktree commits `h1`; `verify --known-red` exits 0; `herdr.json.calls` holds exactly one `['notification','show','repo main red','--body','1 new red on main: alpha; receipt <baseRun.run>; chart a repair','--sound','none']`; the base record's `notice === 'shown'`; the head record has no `notice`. Command: `akrogon run-check --name notice-c1 -- bun test tests/verify.test.ts -t "one main-red notice"`. Size: seconds.
2. **Same unresolved unit on a later base run stays silent** — new test `a later base run red on the same unresolved unit sends nothing`: continue with a second leaf worktree/`h2`; second `verify --known-red` exits 0, calls file still has one notification, second base record has no `notice`. Command: `akrogon run-check --name notice-c2 -- bun test tests/verify.test.ts -t "same unresolved unit sends nothing"`. Size: seconds.
3. **Clearing is generation-based on landed main** — new test `the incident resolves only on green evidence at or after the red on landed main`: after c1's notice, (a) a green plain `verify` run at a leaf head `h_ok` not on main resolves nothing — the next `--known-red` stays at 1 call (a wrongly-counted leaf-head green would resolve R1 and re-notify); (b) push `h_ok` to main, break alpha again at `s2`, new leaf `h3` → `verify --known-red` notifies again (calls 2, second record `shown`); (c) seed a green record at `s1` finishing after that run; new leaf `h4` → `verify --known-red` stays at 2 calls. Command: `akrogon run-check --name notice-c3 -- bun test tests/verify.test.ts -t "resolves only on green evidence"`. Size: seconds.
4. **Send failure keeps verify's result, prints, records `error`, retries next run** — new test `a failed herdr call is recorded and retried by the next base run`: `fakeHerdr` db `failNotification: true`; `verify --known-red` exits 0, stderr contains `notice: `, base record `notice === 'error'`; clear the flag, second leaf commit → next `verify --known-red` sends once, its base record `shown`. Command: `akrogon run-check --name notice-c4 -- bun test tests/verify.test.ts -t "failed herdr call"`. Size: seconds. Second case in the same test `an absent herdr binary is recorded as error and verify keeps its result`: same flow with `herdr` not on PATH — exit 0, `notice:` on stderr, record `error`. Command: same run-check (`-t` covers both).
5. **Reservation under the lock dedupes; a dead reservation retries** — two tests: (a) `two simultaneous base runs produce one notification` — two leaf worktrees run `verify --known-red` concurrently on the same red main; calls file holds exactly one notification, one base record `shown`, the other base record no `notice`; (b) `a pending notice left by a dead process does not block the next send` — seed a completed red base record for the identity with `notice: 'pending'`, a dead `pid` and foreign `boot_id`; `verify --known-red` notifies once, its record `shown`, seeded record still `pending`. Command: `akrogon run-check --name notice-c5 -- bun test tests/verify.test.ts -t "one notification|dead process"`. Size: seconds.

## Planned red evidence (committed before product code)

- `akrogon run-check --name notice-c1 -- bun test tests/verify.test.ts -t "one main-red notice"` → `check notice-c1: 1` (`implementation/check-notice-c1-1792230382146-3051347.log`): the notice call list is empty, so criterion 1 fails on the missing send.
- `akrogon run-check --name notice-c2 -- bun test tests/verify.test.ts -t "same unresolved unit sends nothing"` → `check notice-c2: 1` (`implementation/check-notice-c2-1792230384160-3051677.log`): zero notification calls, criterion 2's first-send precondition fails.
- `akrogon run-check --name notice-c3 -- bun test tests/verify.test.ts -t "resolves only on green evidence"` → `check notice-c3: 1` (`implementation/check-notice-c3-1792230386532-3052253.log`): zero notification calls, criterion 3 fails.
- `akrogon run-check --name notice-c4 -- bun test tests/verify.test.ts -t "herdr"` → `check notice-c4: 1` (`implementation/check-notice-c4-1792230427003-3056331.log`): both cases fail on absent `notice: ` stderr output, criterion 4 fails (verify itself exits 0 in both).
- `akrogon run-check --name notice-c5 -- bun test tests/verify.test.ts -t "one notification|dead process"` → `check notice-c5: 1` (`implementation/check-notice-c5-1792230393815-3053291.log`): zero notification calls plus `Unrecognized key: "notice"` when seeding the pending record, criterion 5 fails.

## Open limitations (preserved from the design)

- `shown` is not a read receipt: a missed notice leaves main red until someone looks (locked cost).
- A base run that crashes between the send and the second locked write can leave a `'pending'` record whose send already happened; the accepted duplicate-on-crash is unchanged.
- A green that lands on main after a red base run finalized but whose sha covers that run resolves the incident; that run's `notice` covers the unit for its own and earlier shas only, so a unit that was new at that finalize keeps its already-sent notice — the literal covering rule can suppress one later notification for a sha older than the landed green. Rare and self-correcting on the next new sha.
- A duplicate after a crash between send and record is accepted (design).

## Implementation notes

- 2026-10-17 check.repair B: require a clearing green observation to finish after the red observation as well as satisfy revision ancestry, following design's covering-notice-newer-than-last-clearing rule and brief criteria 2–3, so same-revision green evidence cannot clear future red incidents.
